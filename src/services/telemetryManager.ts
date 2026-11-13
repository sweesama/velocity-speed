import { TelemetryData, SessionStats, SessionHistoryItem } from '../types'
import { playMilestoneChime } from './audioCallouts'

export interface TelemetryListener {
  (telemetry: TelemetryData, stats: SessionStats, history: SessionHistoryItem[]): void
}

const HISTORY_STORAGE_KEY = 'velocity_session_history_v1'
const ACTIVE_SESSION_KEY = 'velocity_active_session_v2'

function calculateHaversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export class TelemetryManager {
  private geoWatchId: number | null = null
  private heartbeatTimer: number | null = null
  private listeners: Set<TelemetryListener> = new Set()
  private wakeLockSentinel: any = null
  private keepScreenAwakeEnabled: boolean = true
  public hapticFeedbackEnabled: boolean = true

  // 0-100 & 0-200 km/h 加速计时状态
  private accelStartTime: number | null = null
  private accelArmed: boolean = false
  private reachedMilestones: Set<number> = new Set()

  // 一维卡尔曼滤波与速度状态
  private kalmanSpeedMps: number = 0
  private kalmanVariance: number = 1.0
  private lastFixLat: number | null = null
  private lastFixLon: number | null = null
  private lastFixAlt: number | null = null
  private lastFixTime: number = 0
  private lastSpeedMps: number = 0
  private lastSpeedTime: number = 0
  private lastTrackSaveTime: number = 0

  // 有效移动均速积分器
  private movingTimeSec: number = 0
  private movingDistanceM: number = 0

  // 三轴加速度计基线分离 (消除重力倾角伪 G 值)
  private gravityBaseline = { x: 0, y: 0, z: 0, initialized: false }
  private smoothedLinearG: number = 0
  private lastMotionEventTime: number = 0
  private motionListening: boolean = false

  private sessionHistory: SessionHistoryItem[] = []

  private currentTelemetry: TelemetryData = {
    speedMps: 0,
    altitudeM: null,
    altitudeAccuracyM: null,
    verticalSpeedMps: 0,
    headingDeg: null,
    accuracyM: null,
    speedAccuracyMps: null,
    latitude: null,
    longitude: null,
    forwardG: 0,
    imuAvailable: false,
    timestamp: Date.now(),
    gpsStatus: 'LOCATING',
    isAccuracyLow: false
  }

  private sessionStats: SessionStats = {
    isRecording: true,
    hasStartedMoving: false,
    startTime: null,
    durationSec: 0,
    distanceM: 0,
    maxSpeedMps: 0,
    avgSpeedMps: 0,
    maxAltitudeM: null,
    minAltitudeM: null,
    altitudeGainM: 0,
    peakG: 0,
    zeroToHundredSec: null,
    zeroToTwoHundredSec: null,
    milestones: [],
    trackPoints: [],
    speedTimeline: []
  }

  constructor() {
    this.loadPersistedData()
    this.initVisibilityListener()
    this.startHeartbeat()
    this.checkInitialPermission()
  }

  private loadPersistedData() {
    if (typeof localStorage === 'undefined') return
    try {
      const rawHistory = localStorage.getItem(HISTORY_STORAGE_KEY)
      if (rawHistory) {
        const parsed = JSON.parse(rawHistory)
        if (Array.isArray(parsed)) {
          this.sessionHistory = parsed
        }
      }
      const rawActive = localStorage.getItem(ACTIVE_SESSION_KEY)
      if (rawActive) {
        const saved = JSON.parse(rawActive) as Partial<SessionStats>
        if (
          saved &&
          saved.startTime &&
          Date.now() - saved.startTime < 12 * 3600 * 1000 &&
          (saved.maxSpeedMps || 0) > 0.5
        ) {
          this.sessionStats = {
            ...this.sessionStats,
            ...saved,
            isRecording: true,
            hasStartedMoving: Boolean(saved.hasStartedMoving),
            trackPoints: Array.isArray(saved.trackPoints) ? saved.trackPoints : [],
            speedTimeline: Array.isArray(saved.speedTimeline) ? saved.speedTimeline : [],
            milestones: Array.isArray(saved.milestones) ? saved.milestones : []
          }
          for (const m of this.sessionStats.milestones) {
            this.reachedMilestones.add(m)
          }
        }
      }
    } catch {
      // 忽略存储读取异常
    }
  }

  private persistActiveSession() {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(this.sessionStats))
    } catch {
      // 忽略配额限制
    }
  }

  private persistHistory() {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(this.sessionHistory))
    } catch {
      // 忽略配额限制
    }
  }

  private startHeartbeat() {
    if (typeof window === 'undefined') return
    if (this.heartbeatTimer) window.clearInterval(this.heartbeatTimer)

    this.heartbeatTimer = window.setInterval(() => {
      const now = Date.now()
      let changed = false

      // 1. 智能行程秒表：只有当已产生移动 (hasStartedMoving) 且未暂停 (isRecording) 时才累加行程秒数
      // 彻底解决用户刚打开网页静止不动时秒表自己盲目跑字的问题
      if (this.sessionStats.isRecording && this.sessionStats.hasStartedMoving) {
        this.sessionStats.durationSec += 1
        changed = true
      }

      // 2. 加速度计静默衰减
      if (this.lastMotionEventTime > 0 && now - this.lastMotionEventTime > 400) {
        if (this.smoothedLinearG > 0.01) {
          this.smoothedLinearG *= 0.65
          if (this.smoothedLinearG < 0.02) this.smoothedLinearG = 0
          this.currentTelemetry.forwardG = Math.round(this.smoothedLinearG * 100) / 100
          changed = true
        }
      }

      // 3. 信号中断 / 停车归零守护 (Zero-Velocity Decay Watchdog)
      if (this.lastSpeedTime > 0 && this.currentTelemetry.speedMps > 0) {
        const silenceSec = (now - this.lastSpeedTime) / 1000
        if (silenceSec > 4.0 && this.smoothedLinearG < 0.08) {
          const decayed = this.currentTelemetry.speedMps * 0.6
          this.currentTelemetry.speedMps = decayed < 0.2 ? 0 : decayed
          this.kalmanSpeedMps = this.currentTelemetry.speedMps
          if (this.currentTelemetry.speedMps === 0) {
            this.currentTelemetry.verticalSpeedMps = 0
          }
          changed = true
        }
      }

      // 4. 采样实时速度时间序列 (仅在已启动或有速度变化时记录)
      if (this.sessionStats.isRecording && (this.sessionStats.hasStartedMoving || this.currentTelemetry.speedMps > 0)) {
        this.sessionStats.speedTimeline.push({
          timestamp: now,
          speedMps: Math.round(this.currentTelemetry.speedMps * 100) / 100,
          altitudeM: this.currentTelemetry.altitudeM,
          forwardG: this.currentTelemetry.forwardG
        })
        if (this.sessionStats.speedTimeline.length > 180) {
          this.sessionStats.speedTimeline.shift()
        }
        changed = true
      }

      if (changed) {
        this.notify()
      }
    }, 1000)
  }

  private async checkInitialPermission() {
    if (typeof navigator !== 'undefined' && 'permissions' in navigator && navigator.permissions.query) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
        permissionStatus.onchange = () => {
          if (permissionStatus.state === 'granted') {
            this.startHardwareSensors()
          } else if (permissionStatus.state === 'denied') {
            this.currentTelemetry.gpsStatus = 'DENIED'
            this.currentTelemetry.gpsErrorMessage = '定位权限已被拒绝'
            this.notify()
          }
        }
        if (permissionStatus.state === 'prompt') {
          this.currentTelemetry.gpsStatus = 'PROMPT'
          this.notify()
          return
        } else if (permissionStatus.state === 'denied') {
          this.currentTelemetry.gpsStatus = 'DENIED'
          this.currentTelemetry.gpsErrorMessage = '定位权限已被拒绝'
          this.notify()
          return
        }
      } catch {
        // 部分 WebKit 环境不支持 query geolocation，直接走启动流程
      }
    }
    this.startHardwareSensors()
  }

  private initVisibilityListener() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.keepScreenAwakeEnabled) {
          this.requestWakeLock()
        } else if (document.visibilityState === 'hidden') {
          this.persistActiveSession()
        }
      })
    }
  }

  public subscribe(listener: TelemetryListener): () => void {
    this.listeners.add(listener)
    listener(
      { ...this.currentTelemetry },
      { ...this.sessionStats },
      [...this.sessionHistory]
    )
    return () => this.listeners.delete(listener)
  }

  private notify() {
    const telemSnapshot = { ...this.currentTelemetry }
    const statsSnapshot = {
      ...this.sessionStats,
      milestones: [...this.sessionStats.milestones],
      trackPoints: [...this.sessionStats.trackPoints],
      speedTimeline: [...this.sessionStats.speedTimeline]
    }
    const historySnapshot = [...this.sessionHistory]
    for (const listener of this.listeners) {
      listener(telemSnapshot, statsSnapshot, historySnapshot)
    }
  }

  public async setKeepScreenAwake(enabled: boolean) {
    this.keepScreenAwakeEnabled = enabled
    if (enabled) {
      await this.requestWakeLock()
    } else if (this.wakeLockSentinel) {
      try {
        await this.wakeLockSentinel.release()
      } catch {
        // ignore
      }
      this.wakeLockSentinel = null
    }
  }

  public async requestWakeLock() {
    if (!this.keepScreenAwakeEnabled) return
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      try {
        if (this.wakeLockSentinel) return
        this.wakeLockSentinel = await (navigator as any).wakeLock.request('screen')
        this.wakeLockSentinel.addEventListener('release', () => {
          this.wakeLockSentinel = null
        })
      } catch {
        // 忽略低电量模式或后台拒绝
      }
    }
  }

  public async requestMotionPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) {
      return false
    }
    try {
      const DeviceMotionEventAny = DeviceMotionEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>
      }
      if (typeof DeviceMotionEventAny.requestPermission === 'function') {
        const res = await DeviceMotionEventAny.requestPermission()
        if (res !== 'granted') return false
      }
      if (!this.motionListening) {
        window.addEventListener('devicemotion', this.handleMotion, { passive: true })
        this.motionListening = true
      }
      return true
    } catch {
      if (!this.motionListening) {
        window.addEventListener('devicemotion', this.handleMotion, { passive: true })
        this.motionListening = true
      }
      return true
    }
  }

  public startHardwareSensors() {
    if (this.keepScreenAwakeEnabled) {
      this.requestWakeLock()
    }
    this.requestMotionPermission()

    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      this.currentTelemetry.gpsStatus = 'UNAVAILABLE'
      this.currentTelemetry.gpsErrorMessage = '当前设备或浏览器不支持硬件卫星定位'
      this.notify()
      return
    }

    if (this.geoWatchId !== null) {
      navigator.geolocation.clearWatch(this.geoWatchId)
      this.geoWatchId = null
    }

    this.currentTelemetry.gpsStatus = 'LOCATING'
    this.currentTelemetry.gpsErrorMessage = undefined
    this.notify()

    this.geoWatchId = navigator.geolocation.watchPosition(
      (pos) => this.handlePositionUpdate(pos),
      (err) => {
        if (err.code === 1) {
          this.currentTelemetry.gpsStatus = 'DENIED'
          this.currentTelemetry.gpsErrorMessage = '系统定位权限未开启或已被拒绝'
        } else if (err.code === 2) {
          this.currentTelemetry.gpsStatus = 'LOCATING'
          this.currentTelemetry.gpsErrorMessage = '正在搜索卫星信号...'
        } else if (err.code === 3) {
          if (this.currentTelemetry.latitude === null) {
            this.currentTelemetry.gpsStatus = 'LOCATING'
            this.currentTelemetry.gpsErrorMessage = '正在搜索卫星信号...'
          }
        }
        this.notify()
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 12000
      }
    )
  }

  private handlePositionUpdate(pos: GeolocationPosition) {
    const coords = pos.coords
    const now = pos.timestamp || Date.now()
    const accuracy = typeof coords.accuracy === 'number' && Number.isFinite(coords.accuracy) ? coords.accuracy : 10
    const isAccuracyLow = accuracy > 35

    let rawSpeed: number | null =
      typeof coords.speed === 'number' && Number.isFinite(coords.speed) && coords.speed >= 0
        ? coords.speed
        : null

    let stepDistance = 0
    const dtFix = this.lastFixTime > 0 ? (now - this.lastFixTime) / 1000 : 0

    if (this.lastFixLat !== null && this.lastFixLon !== null && dtFix > 0.2) {
      stepDistance = calculateHaversine(
        this.lastFixLat,
        this.lastFixLon,
        coords.latitude,
        coords.longitude
      )
    }

    if (rawSpeed === null) {
      if (dtFix >= 0.4 && dtFix < 10) {
        const noiseFloorMeters = Math.max(3.0, accuracy * 0.6)
        if (stepDistance > noiseFloorMeters) {
          rawSpeed = stepDistance / dtFix
        } else {
          rawSpeed = 0
        }
      } else {
        rawSpeed = 0
      }
    }

    let candidateSpeed = rawSpeed
    if (candidateSpeed < 0.22 && this.smoothedLinearG < 0.06) {
      candidateSpeed = 0
    }

    const dtSpeed = this.lastSpeedTime > 0 ? (now - this.lastSpeedTime) / 1000 : 0
    if (dtSpeed > 0.1 && dtSpeed < 4.0 && candidateSpeed > 0) {
      const accelMps2 = Math.abs(candidateSpeed - this.lastSpeedMps) / dtSpeed
      if (accelMps2 > 19.6 && this.smoothedLinearG < 0.85) {
        const maxDelta = 14.7 * dtSpeed
        candidateSpeed =
          this.lastSpeedMps + Math.sign(candidateSpeed - this.lastSpeedMps) * maxDelta
      }
    }

    let finalSpeed = candidateSpeed
    if (candidateSpeed === 0) {
      this.kalmanSpeedMps = 0
      this.kalmanVariance = 0.5
      finalSpeed = 0
    } else {
      const processNoise = 0.8
      const measurementNoise = isAccuracyLow ? 4.5 : coords.speed !== null ? 0.35 : 1.5
      const predictedVar = this.kalmanVariance + processNoise
      const kalmanGain = predictedVar / (predictedVar + measurementNoise)
      this.kalmanSpeedMps =
        this.kalmanSpeedMps + kalmanGain * (candidateSpeed - this.kalmanSpeedMps)
      this.kalmanVariance = (1 - kalmanGain) * predictedVar
      finalSpeed = Math.max(0, this.kalmanSpeedMps)
    }

    // 智能自动开始计时：一旦检测到真实移动 (速度 >= 1.4 km/h)，自动激活行程记录
    if (this.sessionStats.isRecording && finalSpeed >= 0.4 && !this.sessionStats.hasStartedMoving) {
      this.sessionStats.hasStartedMoving = true
      if (!this.sessionStats.startTime) {
        this.sessionStats.startTime = now
      }
    }

    if (
      this.sessionStats.isRecording &&
      finalSpeed >= 0.35 &&
      dtFix > 0 &&
      dtFix < 15
    ) {
      const dopplerStep = finalSpeed * dtFix
      const validStep =
        stepDistance > 0 && stepDistance < Math.max(50, dopplerStep * 2.5)
          ? stepDistance
          : dopplerStep
      if (validStep > 0 && validStep < 1500) {
        this.sessionStats.distanceM += validStep
        this.movingDistanceM += validStep
        this.movingTimeSec += dtFix
      }
    }

    const hasAltitude = typeof coords.altitude === 'number' && Number.isFinite(coords.altitude)
    const currentAlt = hasAltitude ? (coords.altitude as number) : null
    const altAccuracy =
      typeof coords.altitudeAccuracy === 'number' && Number.isFinite(coords.altitudeAccuracy)
        ? coords.altitudeAccuracy
        : null

    let verticalSpeed = this.currentTelemetry.verticalSpeedMps
    if (currentAlt !== null && this.lastFixAlt !== null && dtFix >= 0.5 && dtFix < 10) {
      const dAlt = currentAlt - this.lastFixAlt
      const rawVsi = dAlt / dtFix
      verticalSpeed = Math.round((verticalSpeed * 0.6 + rawVsi * 0.4) * 10) / 10
      if (this.sessionStats.isRecording && dAlt >= 1.5 && (!altAccuracy || altAccuracy < 30)) {
        this.sessionStats.altitudeGainM += dAlt
        this.lastFixAlt = currentAlt
      } else if (Math.abs(dAlt) >= 1.5) {
        this.lastFixAlt = currentAlt
      }
    } else if (currentAlt !== null && this.lastFixAlt === null) {
      this.lastFixAlt = currentAlt
      verticalSpeed = 0
    } else if (currentAlt === null) {
      verticalSpeed = 0
    }

    const hasValidHeading =
      typeof coords.heading === 'number' &&
      Number.isFinite(coords.heading) &&
      coords.heading >= 0 &&
      finalSpeed >= 0.4
    const heading = hasValidHeading
      ? (coords.heading as number)
      : this.currentTelemetry.headingDeg

    let derivedG = 0
    if (dtSpeed >= 0.25 && dtSpeed < 4.0) {
      const dv = finalSpeed - this.lastSpeedMps
      derivedG = Math.max(0, dv / dtSpeed / 9.80665)
    }

    this.lastFixLat = coords.latitude
    this.lastFixLon = coords.longitude
    this.lastFixTime = now
    this.lastSpeedMps = finalSpeed
    this.lastSpeedTime = now

    const fusedG = Math.min(1.95, Math.max(this.smoothedLinearG, derivedG))
    const speedAccMps = coords.speed !== null
      ? Math.max(0.05, Math.min(0.5, accuracy * 0.02))
      : Math.max(0.2, accuracy * 0.08)

    this.currentTelemetry = {
      speedMps: finalSpeed,
      altitudeM: currentAlt,
      altitudeAccuracyM: altAccuracy,
      verticalSpeedMps: verticalSpeed,
      headingDeg: heading,
      accuracyM: accuracy,
      speedAccuracyMps: Math.round(speedAccMps * 100) / 100,
      latitude: coords.latitude,
      longitude: coords.longitude,
      forwardG: Math.round(fusedG * 100) / 100,
      imuAvailable: this.currentTelemetry.imuAvailable,
      timestamp: now,
      gpsStatus: 'READY',
      gpsErrorMessage: undefined,
      isAccuracyLow
    }

    if (this.sessionStats.isRecording && now - this.lastTrackSaveTime >= 1000 && !isAccuracyLow) {
      this.lastTrackSaveTime = now
      this.sessionStats.trackPoints.push({
        latitude: coords.latitude,
        longitude: coords.longitude,
        altitude: currentAlt !== null ? Math.round(currentAlt * 10) / 10 : null,
        speedMps: Math.round(finalSpeed * 100) / 100,
        timestamp: now
      })
      if (this.sessionStats.trackPoints.length > 7200) {
        this.sessionStats.trackPoints.shift()
      }
    }

    this.updateStats(finalSpeed, currentAlt, fusedG, isAccuracyLow)
    this.checkMilestonesAndAccel(finalSpeed, now)
    this.persistActiveSession()
    this.notify()
  }

  private handleMotion = (event: DeviceMotionEvent) => {
    const lin = event.acceleration
    const inc = event.accelerationIncludingGravity
    let netAccelMps2 = 0

    if (lin && typeof lin.x === 'number' && typeof lin.y === 'number') {
      const ax = lin.x || 0
      const ay = lin.y || 0
      const az = lin.z || 0
      const mag = Math.sqrt(ax * ax + ay * ay + az * az * 0.25)
      netAccelMps2 = Math.max(0, mag - 0.18)
      this.currentTelemetry.imuAvailable = true
    } else if (inc && typeof inc.x === 'number' && typeof inc.y === 'number') {
      const gx = inc.x || 0
      const gy = inc.y || 0
      const gz = inc.z || 0
      if (!this.gravityBaseline.initialized) {
        this.gravityBaseline = { x: gx, y: gy, z: gz, initialized: true }
      } else {
        const alpha = 0.96
        this.gravityBaseline.x = alpha * this.gravityBaseline.x + (1 - alpha) * gx
        this.gravityBaseline.y = alpha * this.gravityBaseline.y + (1 - alpha) * gy
        this.gravityBaseline.z = alpha * this.gravityBaseline.z + (1 - alpha) * gz
      }
      const dx = gx - this.gravityBaseline.x
      const dy = gy - this.gravityBaseline.y
      const dz = gz - this.gravityBaseline.z
      const mag = Math.sqrt(dx * dx + dy * dy + dz * dz)
      netAccelMps2 = Math.max(0, mag - 0.3)
      this.currentTelemetry.imuAvailable = true
    } else {
      return
    }

    this.lastMotionEventTime = Date.now()
    const rawG = Math.min(1.95, netAccelMps2 / 9.80665)
    this.smoothedLinearG = this.smoothedLinearG * 0.78 + rawG * 0.22
    const roundedG = Math.round(this.smoothedLinearG * 100) / 100
    this.currentTelemetry.forwardG = roundedG < 0.04 ? 0 : roundedG

    if (this.sessionStats.isRecording && this.currentTelemetry.forwardG > this.sessionStats.peakG) {
      this.sessionStats.peakG = this.currentTelemetry.forwardG
    }
  }

  private checkMilestonesAndAccel(speedMps: number, now: number) {
    if (!this.sessionStats.isRecording) return
    const kmh = speedMps * 3.6

    if (kmh < 1.2) {
      this.accelArmed = true
      this.accelStartTime = now
    } else if (this.accelArmed && this.accelStartTime !== null) {
      const elapsedSec = (now - this.accelStartTime) / 1000
      if (elapsedSec > 60 && kmh < 100) {
        this.accelArmed = false
        this.accelStartTime = null
      } else {
        if (kmh >= 100) {
          if (
            this.sessionStats.zeroToHundredSec === null ||
            elapsedSec < this.sessionStats.zeroToHundredSec
          ) {
            this.sessionStats.zeroToHundredSec = Math.round(elapsedSec * 100) / 100
          }
        }
        if (kmh >= 200) {
          if (
            this.sessionStats.zeroToTwoHundredSec === null ||
            elapsedSec < this.sessionStats.zeroToTwoHundredSec
          ) {
            this.sessionStats.zeroToTwoHundredSec = Math.round(elapsedSec * 100) / 100
          }
          this.accelArmed = false
          this.accelStartTime = null
        }
      }
    }

    const milestonesToCheck = [30, 50, 100, 150, 200, 250, 300, 350, 500, 800, 900]
    for (const m of milestonesToCheck) {
      if (kmh >= m && !this.reachedMilestones.has(m)) {
        this.reachedMilestones.add(m)
        this.sessionStats.milestones = Array.from(this.reachedMilestones).sort((a, b) => a - b)
        playMilestoneChime(this.hapticFeedbackEnabled)
      }
    }
  }

  private updateStats(
    speedMps: number,
    altitudeM: number | null,
    g: number = 0,
    isAccuracyLow: boolean = false
  ) {
    if (!this.sessionStats.isRecording) return

    if (!isAccuracyLow) {
      if (speedMps > this.sessionStats.maxSpeedMps) {
        this.sessionStats.maxSpeedMps = speedMps
      }
      if (altitudeM !== null && Number.isFinite(altitudeM)) {
        if (
          this.sessionStats.maxAltitudeM === null ||
          altitudeM > this.sessionStats.maxAltitudeM
        ) {
          this.sessionStats.maxAltitudeM = Math.round(altitudeM)
        }
        if (
          this.sessionStats.minAltitudeM === null ||
          altitudeM < this.sessionStats.minAltitudeM
        ) {
          this.sessionStats.minAltitudeM = Math.round(altitudeM)
        }
      }
    }

    if (g > this.sessionStats.peakG) {
      this.sessionStats.peakG = Math.round(g * 100) / 100
    }

    if (this.movingTimeSec > 1 && this.movingDistanceM > 1) {
      this.sessionStats.avgSpeedMps = this.movingDistanceM / this.movingTimeSec
    } else if (speedMps > 0.3 && this.sessionStats.avgSpeedMps === 0) {
      this.sessionStats.avgSpeedMps = speedMps
    }
  }

  public toggleRecording(): boolean {
    if (!this.sessionStats.hasStartedMoving) {
      // 用户手动点击开始，立即进入计时状态
      this.sessionStats.hasStartedMoving = true
      this.sessionStats.isRecording = true
      if (!this.sessionStats.startTime) {
        this.sessionStats.startTime = Date.now()
      }
    } else {
      this.sessionStats.isRecording = !this.sessionStats.isRecording
    }
    this.persistActiveSession()
    this.notify()
    return this.sessionStats.isRecording
  }

  public generateGpxString(): string {
    const points = this.sessionStats.trackPoints || []
    const startTimeIso = new Date(this.sessionStats.startTime || Date.now()).toISOString()

    let gpx = `<?xml version="1.0" encoding="UTF-8"?>\n`
    gpx += `<gpx version="1.1" creator="Velocity Precision Telemetry" xmlns="http://www.topografix.com/GPX/1/1">\n`
    gpx += `  <metadata>\n`
    gpx += `    <name>Velocity Telemetry Track</name>\n`
    gpx += `    <time>${startTimeIso}</time>\n`
    gpx += `  </metadata>\n`
    gpx += `  <trk>\n`
    gpx += `    <name>Velocity Session (${new Date().toLocaleDateString()})</name>\n`
    gpx += `    <trkseg>\n`

    for (const pt of points) {
      const timeIso = new Date(pt.timestamp).toISOString()
      gpx += `      <trkpt lat="${pt.latitude}" lon="${pt.longitude}">\n`
      if (pt.altitude !== null && Number.isFinite(pt.altitude)) {
        gpx += `        <ele>${pt.altitude}</ele>\n`
      }
      gpx += `        <time>${timeIso}</time>\n`
      gpx += `        <extensions>\n`
      gpx += `          <speed>${pt.speedMps}</speed>\n`
      gpx += `        </extensions>\n`
      gpx += `      </trkpt>\n`
    }

    gpx += `    </trkseg>\n`
    gpx += `  </trk>\n`
    gpx += `</gpx>`
    return gpx
  }

  public resetSession(archiveIfValid: boolean = true) {
    if (
      archiveIfValid &&
      this.sessionStats.maxSpeedMps * 3.6 >= 1.0 &&
      this.sessionStats.durationSec >= 5
    ) {
      const item: SessionHistoryItem = {
        id: `session_${Date.now()}`,
        startTime: this.sessionStats.startTime || Date.now(),
        endTime: Date.now(),
        durationSec: this.sessionStats.durationSec,
        distanceM: Math.round(this.sessionStats.distanceM),
        maxSpeedMps: this.sessionStats.maxSpeedMps,
        avgSpeedMps: this.sessionStats.avgSpeedMps,
        maxAltitudeM: this.sessionStats.maxAltitudeM,
        peakG: this.sessionStats.peakG,
        zeroToHundredSec: this.sessionStats.zeroToHundredSec,
        trackPointCount: this.sessionStats.trackPoints.length
      }
      this.sessionHistory.unshift(item)
      if (this.sessionHistory.length > 20) {
        this.sessionHistory = this.sessionHistory.slice(0, 20)
      }
      this.persistHistory()
    }

    this.sessionStats = {
      isRecording: true,
      hasStartedMoving: false,
      startTime: null,
      durationSec: 0,
      distanceM: 0,
      maxSpeedMps: 0,
      avgSpeedMps: 0,
      maxAltitudeM: this.currentTelemetry.altitudeM !== null ? Math.round(this.currentTelemetry.altitudeM) : null,
      minAltitudeM: this.currentTelemetry.altitudeM !== null ? Math.round(this.currentTelemetry.altitudeM) : null,
      altitudeGainM: 0,
      peakG: 0,
      zeroToHundredSec: null,
      zeroToTwoHundredSec: null,
      milestones: [],
      trackPoints: [],
      speedTimeline: []
    }
    this.reachedMilestones.clear()
    this.movingTimeSec = 0
    this.movingDistanceM = 0
    this.accelStartTime = null
    this.accelArmed = false
    this.lastTrackSaveTime = 0
    this.persistActiveSession()
    this.notify()
  }

  public deleteHistoryItem(id: string) {
    this.sessionHistory = this.sessionHistory.filter((item) => item.id !== id)
    this.persistHistory()
    this.notify()
  }

  public clearAllHistory() {
    this.sessionHistory = []
    this.persistHistory()
    this.notify()
  }

  public stopHardwareSensors() {
    if (this.geoWatchId !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(this.geoWatchId)
      this.geoWatchId = null
    }
    if (this.motionListening && typeof window !== 'undefined') {
      window.removeEventListener('devicemotion', this.handleMotion)
      this.motionListening = false
    }
  }
}

export const telemetryService = new TelemetryManager()
