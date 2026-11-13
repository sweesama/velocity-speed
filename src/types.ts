export type GpsStatus = 'PROMPT' | 'LOCATING' | 'READY' | 'DENIED' | 'UNAVAILABLE'

export type SpeedUnit = 'km/h' | 'knots' | 'mph' | 'm/s'

export type AltitudeUnit = 'm' | 'ft'

export type HudTheme = 'white' | 'emerald' | 'amber'

export type AppTab = 'dashboard' | 'reports' | 'settings'

export type ViewMode = 'minimal' | 'gauge'

export type AppLanguage = 'zh' | 'en'

export interface TrackPoint {
  latitude: number
  longitude: number
  altitude: number | null
  speedMps: number
  timestamp: number
}

export interface SpeedSample {
  timestamp: number
  speedMps: number
  altitudeM: number | null
  forwardG: number
}

export interface TelemetryData {
  speedMps: number                  // 实时物理地速 (米/秒)
  altitudeM: number | null          // 实时空间几何海拔 (米, WGS84; 未锁定时为 null)
  altitudeAccuracyM: number | null  // 垂直高程精度 (米)
  verticalSpeedMps: number          // 垂直升降率 VSI (米/秒)
  headingDeg: number | null         // 真北航向角 (0-360; 静止或未知时为 null)
  accuracyM: number | null          // 水平定位精度 CEP (米)
  speedAccuracyMps: number | null   // 多普勒测速硬件精度估算 (米/秒)
  latitude: number | null
  longitude: number | null
  forwardG: number                  // 实时纵向加速度 / 推背感 G 值
  imuAvailable: boolean             // 硬件加速度计是否已激活就绪
  timestamp: number
  gpsStatus: GpsStatus
  gpsErrorMessage?: string
  isAccuracyLow?: boolean           // 水平精度是否偏低 (>35m)
}

export interface SessionStats {
  isRecording: boolean              // 是否允许记录
  hasStartedMoving: boolean         // 是否已触发有效移动计时 (智能自动开始，避免开机静止时计时空转)
  startTime: number | null
  durationSec: number               // 有效行程时长 (秒)
  distanceM: number                 // 累计真实移动距离 (米)
  maxSpeedMps: number               // 本次测速最高速度 (米/秒)
  avgSpeedMps: number               // 有效移动平均速度 (米/秒)
  maxAltitudeM: number | null       // 本次记录最高海拔 (米)
  minAltitudeM: number | null       // 本次记录最低海拔 (米)
  altitudeGainM: number             // 累计爬升高度 (米)
  peakG: number                     // 记录的最大推背/加速度 G 值
  zeroToHundredSec: number | null   // 0-100 km/h 加速用时 (秒)
  zeroToTwoHundredSec: number | null // 0-200 km/h 加速用时 (秒)
  milestones: number[]              // 已突破的时速里程碑 (km/h)
  trackPoints: TrackPoint[]         // 标准航迹点 (用于 GPX 导出)
  speedTimeline: SpeedSample[]      // 最近实时速度曲线采样点 (用于趋势图与战报曲线)
}

export interface SessionHistoryItem {
  id: string
  startTime: number
  endTime: number
  durationSec: number
  distanceM: number
  maxSpeedMps: number
  avgSpeedMps: number
  maxAltitudeM: number | null
  peakG: number
  zeroToHundredSec: number | null
  trackPointCount: number
  note?: string
}

export interface AppSettings {
  language: AppLanguage
  speedUnit: SpeedUnit
  altitudeUnit: AltitudeUnit
  hudMirrored: boolean
  hudTheme: HudTheme
  keepScreenAwake: boolean
  hapticFeedback: boolean           // 里程碑轻触音频/触觉反馈
  viewMode: ViewMode                // 仪表盘形态: 极简巨幕 / 环形罗盘
  showDeviceFrame: boolean          // 电脑端是否显示手机外框模型
  isProUnlocked?: boolean           // 是否已激活 Velocity Pro 终身通行证
  proLicenseCode?: string           // 已绑定的早鸟码 / 激活码
}
