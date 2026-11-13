<template>
  <div class="relative flex-1 min-h-0 h-full flex flex-col justify-between items-center w-full max-w-md mx-auto px-6 pt-3 pb-4 select-none font-sans overflow-hidden">
    <!-- 极克制的单色铂金顶光: 摒弃一切廉价彩色光斑 -->
    <div
      class="ambient-glow absolute inset-0 pointer-events-none -z-10"
      :style="ambientGlowStyle"
    ></div>

    <!-- 顶部状态工具栏: 左右严格对齐网格边缘 (px-6) -->
    <header class="w-full flex items-center justify-between gap-2 z-20 pb-2 shrink-0">
      <!-- 左侧: 智能自动收纳定位指示器 (搜到信号后自动缩为极简圆点，点击可展开详情或授权) -->
      <button
        type="button"
        @click="onGpsPillClick"
        class="inline-flex items-center rounded-full apple-pill hover:bg-white/10 active:scale-95 transition-all duration-300 cursor-pointer text-[11px] tracking-tight whitespace-nowrap shrink-0 h-8"
        :class="showFullGpsText ? 'px-3 space-x-2' : 'w-8 justify-center px-0'"
        :title="gpsStatusText"
      >
        <span class="w-2 h-2 rounded-full transition-colors duration-300 shrink-0" :class="gpsDotColor"></span>
        <span
          v-if="showFullGpsText"
          class="text-zinc-200 font-sans text-[11px] font-medium tracking-normal transition-opacity duration-200"
        >
          {{ gpsStatusText }}
        </span>
      </button>

      <!-- 右侧: 形态切换 (极简/表盘) + HUD 入口 (右边缘严格对齐底部第三列) -->
      <div class="flex items-center space-x-2 shrink-0">
        <div class="flex items-center p-0.5 rounded-full apple-pill h-8">
          <button
            type="button"
            @click="updateViewMode('minimal')"
            class="px-3 h-7 rounded-full text-[11px] font-medium btn-spring cursor-pointer whitespace-nowrap"
            :class="settings.viewMode === 'minimal' ? 'bg-white text-black font-semibold shadow-sm' : 'text-zinc-400 hover:text-white'"
          >
            {{ t.modeMinimal }}
          </button>
          <button
            type="button"
            @click="updateViewMode('gauge')"
            class="px-3 h-7 rounded-full text-[11px] font-medium btn-spring cursor-pointer whitespace-nowrap"
            :class="settings.viewMode === 'gauge' ? 'bg-white text-black font-semibold shadow-sm' : 'text-zinc-400 hover:text-white'"
          >
            {{ t.modeGauge }}
          </button>
        </div>

        <button
          type="button"
          @click="onOpenHud"
          class="h-8 px-3 rounded-full apple-pill hover:bg-white/10 text-zinc-200 hover:text-white btn-spring cursor-pointer inline-flex items-center justify-center shrink-0"
          title="HUD"
          aria-label="HUD Mode"
        >
          <span class="font-mono text-[10px] font-semibold tracking-wider">HUD</span>
        </button>
      </div>
    </header>

    <!-- 顶部临时轻提示: 仅在未开启定位，或刚进入弱信号前 4.5 秒显示，随后自动消失保持界面纯净 -->
    <div
      v-if="telemetry.gpsStatus === 'DENIED' || telemetry.gpsStatus === 'PROMPT'"
      class="w-full z-20 my-0.5 animate-fade-in shrink-0"
    >
      <div class="px-3.5 py-2 rounded-2xl apple-pill flex items-center justify-between gap-2 text-xs">
        <div class="flex items-center space-x-2 text-zinc-300 min-w-0">
          <span class="w-1.5 h-1.5 rounded-full bg-white/70 shrink-0"></span>
          <span class="text-[11px] font-medium whitespace-nowrap truncate">{{ t.bannerNeedAuth }}</span>
        </div>
        <button
          type="button"
          @click="onOpenPermission"
          class="px-3 py-1 rounded-full bg-white text-black font-semibold text-[11px] hover:bg-zinc-200 btn-spring cursor-pointer whitespace-nowrap shrink-0"
        >
          {{ t.btnAuthorize }}
        </button>
      </div>
    </div>

    <div
      v-else-if="showCabinTip"
      @click="showCabinTip = false"
      class="w-full z-20 my-0.5 animate-fade-in cursor-pointer shrink-0"
    >
      <div class="px-3.5 py-2 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md flex items-center justify-between gap-2 text-[11px] text-zinc-400">
        <div class="flex items-center space-x-2 min-w-0">
          <span class="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse shrink-0"></span>
          <span class="leading-relaxed whitespace-nowrap truncate">{{ t.bannerCabinTip }}</span>
        </div>
        <X class="w-3.5 h-3.5 text-zinc-500 shrink-0" />
      </div>
    </div>

    <!-- 中央核心舞台: 光学绝对居中 (整数严格处于屏幕垂直中轴线，小数悬浮于右侧不挤压中轴) -->
    <main class="my-auto flex flex-col items-center justify-center text-center w-full z-10 py-2">
      <Transition name="stage" mode="out-in">
        <!-- 形态 1: 极简纯粹巨幕 -->
        <div v-if="settings.viewMode === 'minimal'" key="minimal" class="flex flex-col items-center justify-center w-full">
          <!-- 光学居中巨幕数字: 主整数居中，.0 绝对定位在右侧，位数自适应字号确保三位数绝不溢出 -->
          <div
            @click="cycleUnit"
            class="relative inline-flex items-baseline justify-center hero-numeral select-none cursor-pointer active:scale-[0.97] transition-transform duration-150"
          >
            <span
              class="font-[200] text-white leading-none tracking-[-0.045em] transition-all duration-200"
              :class="minimalNumeralClass"
            >
              {{ formattedSpeed.integer }}
            </span>
            <span class="absolute left-full ml-1.5 bottom-[0.12em] text-2xl sm:text-3xl font-[200] text-white/30 leading-none">
              .{{ formattedSpeed.decimal }}
            </span>
          </div>

          <!-- 速度单位切换胶囊 (与上方主整数严格同一中轴) -->
          <div class="mt-5 flex items-center justify-center gap-2">
            <button
              type="button"
              @click="cycleUnit"
              class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs uppercase tracking-[0.2em] text-white/75 hover:text-white btn-spring cursor-pointer group apple-pill whitespace-nowrap"
            >
              <span class="font-mono font-medium">{{ speedUnitDisplay }}</span>
              <ChevronDown class="w-3.5 h-3.5 text-white/40 group-hover:text-white/80 transition-transform group-hover:translate-y-0.5" />
            </button>

            <span
              v-if="machNumber >= 0.25"
              class="px-2.5 py-1 rounded-full bg-white/[0.08] border border-white/15 text-[11px] font-mono text-white tracking-wider whitespace-nowrap"
            >
              MACH {{ machNumber.toFixed(2) }}
            </span>
          </div>
        </div>

        <!-- 形态 2: 瑞士精密单色计时表盘 -->
        <div v-else key="gauge" class="relative flex flex-col items-center justify-center w-72 h-72 sm:w-76 sm:h-76">
          <svg class="absolute inset-0 w-full h-full" viewBox="0 0 240 240">
            <!-- 外圈精密仪器基准环 -->
            <circle
              cx="120"
              cy="120"
              r="113"
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              stroke-width="1"
            />

            <!-- 60 根瑞士精密径向刻度线 (纯白激活态 vs 钛灰静默态) -->
            <g>
              <line
                v-for="tick in gaugeTicks"
                :key="tick.index"
                :x1="tick.x1"
                :y1="tick.y1"
                :x2="tick.x2"
                :y2="tick.y2"
                :stroke="tick.active ? '#ffffff' : tick.isMajor ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.09)'"
                :stroke-width="tick.isMajor ? 2 : 1.2"
                stroke-linecap="round"
                class="transition-colors duration-150"
              />
            </g>

            <!-- 内圈航向旋转环 (纯粹银白比例，无刺眼红绿) -->
            <g
              :style="{
                transform: `rotate(${ -(telemetry.headingDeg || 0) }deg)`,
                transformOrigin: '120px 120px',
                transition: 'transform 400ms cubic-bezier(0.22, 1, 0.36, 1)'
              }"
            >
              <circle
                cx="120"
                cy="120"
                r="84"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                stroke-width="1"
                stroke-dasharray="2 4"
              />
              <polygon
                points="120,31 116.5,38 123.5,38"
                :fill="telemetry.headingDeg !== null ? '#ffffff' : 'rgba(255,255,255,0.28)'"
              />
              <text x="120" y="47" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-size="7.5" font-family="JetBrains Mono, monospace" font-weight="600">N</text>
              <text x="197" y="122.5" text-anchor="middle" fill="rgba(255,255,255,0.28)" font-size="7" font-family="JetBrains Mono, monospace">E</text>
              <text x="120" y="199" text-anchor="middle" fill="rgba(255,255,255,0.28)" font-size="7" font-family="JetBrains Mono, monospace">S</text>
              <text x="43" y="122.5" text-anchor="middle" fill="rgba(255,255,255,0.28)" font-size="7" font-family="JetBrains Mono, monospace">W</text>
            </g>
          </svg>

          <!-- 表盘中心速度读数 (光学居中 + 位数自适应字号) -->
          <div class="relative z-10 flex flex-col items-center justify-center pt-2">
            <div class="text-[10px] font-mono tracking-widest uppercase mb-1.5" :class="telemetry.headingDeg !== null ? 'text-zinc-300' : 'text-zinc-600'">
              {{ headingLabel }}
            </div>

            <div
              @click="cycleUnit"
              class="relative inline-flex items-baseline justify-center hero-numeral select-none cursor-pointer active:scale-95 transition-transform"
            >
              <span class="font-[200] text-white leading-none" :class="gaugeNumeralClass">
                {{ formattedSpeed.integer }}
              </span>
              <span class="absolute left-full ml-1 bottom-[0.1em] text-xl sm:text-2xl font-[200] text-white/30 leading-none">
                .{{ formattedSpeed.decimal }}
              </span>
            </div>

            <button
              type="button"
              @click="cycleUnit"
              class="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.18em] text-white/70 hover:text-white btn-spring cursor-pointer apple-pill whitespace-nowrap"
            >
              <span class="font-mono font-medium">{{ speedUnitDisplay }}</span>
              <ChevronDown class="w-3 h-3 text-white/40" />
            </button>

            <span class="text-[9px] text-zinc-600 font-mono mt-1.5 tracking-widest uppercase">
              0–{{ currentGaugeMax }} {{ speedUnitDisplay }}
            </span>
          </div>
        </div>
      </Transition>

      <!-- 动态推背感与零百成绩: 静止时不显示冗余参数，仅在产生推背感 (>=0.08G) 或触发零百纪录时浮现 -->
      <div class="h-7 mt-2 flex items-center justify-center gap-2">
        <div
          v-if="telemetry.forwardG >= 0.08"
          class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/[0.07] border border-white/15 text-white text-xs font-mono tracking-wide animate-fade-in whitespace-nowrap"
        >
          <span class="text-[10px] font-sans text-zinc-300">{{ t.gForceLabel }}</span>
          <span class="tabular-nums font-medium">+{{ telemetry.forwardG.toFixed(2) }} G</span>
        </div>

        <div
          v-if="stats.zeroToHundredSec !== null"
          class="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/[0.08] border border-white/20 text-[11px] font-mono text-white whitespace-nowrap"
        >
          <span>0-100</span>
          <span class="font-semibold">{{ stats.zeroToHundredSec.toFixed(2) }}s</span>
        </div>
      </div>
    </main>

    <!-- 底部数据区: 严格遵循左、中、右建筑级网格对齐 -->
    <footer class="w-full z-10 font-sans space-y-3 shrink-0">
      <!-- 实时速度轨迹微流线 -->
      <div class="w-full h-6 relative flex items-end overflow-hidden opacity-75">
        <svg class="w-full h-full overflow-visible" viewBox="0 0 300 24" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sparklineFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="rgba(255,255,255,0.14)" />
              <stop offset="100%" stop-color="rgba(255,255,255,0.0)" />
            </linearGradient>
          </defs>
          <path
            v-if="sparklineAreaPath"
            :d="sparklineAreaPath"
            fill="url(#sparklineFill)"
          />
          <path
            :d="sparklinePath"
            fill="none"
            stroke="rgba(255,255,255,0.28)"
            stroke-width="1.25"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <!-- 第一排: 三大核心物理指标 (左列左对齐、中列居中对齐、右列右对齐，与顶部导航边缘严丝合缝) -->
      <div class="w-full grid grid-cols-3 pt-3.5 pb-3 border-t border-white/[0.08]">
        <!-- 1. 最高速度 (左对齐) -->
        <div class="flex flex-col items-start text-left">
          <span class="text-[11px] tracking-wider text-zinc-500 font-medium whitespace-nowrap">{{ t.maxSpeedLabel }}</span>
          <span class="text-[26px] font-[300] font-display text-white tabular-nums mt-1 leading-none">
            {{ formattedMaxSpeed }}
          </span>
          <span class="text-[10px] text-zinc-500 mt-1.5 tracking-wider font-mono uppercase">
            {{ speedUnitDisplay }}
          </span>
        </div>

        <!-- 2. 海拔高度 (居中对齐，点击可切换 米 m / 英尺 ft) -->
        <button
          type="button"
          @click="toggleAltitudeUnit"
          class="flex flex-col items-center text-center group cursor-pointer btn-spring"
        >
          <span class="text-[11px] tracking-wider text-zinc-500 group-hover:text-zinc-300 font-medium transition-colors whitespace-nowrap">
            {{ t.altitudeLabel }}
          </span>
          <span class="text-[26px] font-[300] font-display text-white tabular-nums mt-1 leading-none">
            {{ formattedAltitude }}
          </span>
          <span class="text-[10px] text-zinc-500 mt-1.5 tracking-wider font-mono whitespace-nowrap">
            {{ altitudeSubtitle }}
          </span>
        </button>

        <!-- 3. 累计里程 (右对齐) -->
        <div class="flex flex-col items-end text-right">
          <span class="text-[11px] tracking-wider text-zinc-500 font-medium whitespace-nowrap">{{ t.distanceLabel }}</span>
          <span class="text-[26px] font-[300] font-display text-white tabular-nums mt-1 leading-none">
            {{ tripDistance.value }}
          </span>
          <span class="text-[10px] text-zinc-500 mt-1.5 tracking-wider font-mono">
            {{ tripDistance.unit }}
          </span>
        </div>
      </div>

      <!-- 第二排: 行程状态控制栏 (纯黑白银克制配色 + 圆形精密按键) -->
      <div class="w-full flex items-center justify-between gap-2 px-4 py-2 rounded-2xl apple-pill text-[11px]">
        <div class="flex items-center space-x-2.5 text-zinc-400 font-mono tabular-nums truncate">
          <span>{{ t.avgSpeedShort }} <strong class="text-white font-medium">{{ formattedAvgSpeed }}</strong></span>
          <span class="text-white/15">·</span>
          <span v-if="!stats.hasStartedMoving" class="text-zinc-400 text-[11px] font-sans whitespace-nowrap">
            {{ t.standbyStatus }}
          </span>
          <span v-else-if="!stats.isRecording" class="text-zinc-300 font-sans whitespace-nowrap">
            {{ t.pausedStatus }} {{ formattedDuration }}
          </span>
          <span v-else class="whitespace-nowrap">
            {{ t.durationShort }} <strong class="text-white font-medium">{{ formattedDuration }}</strong>
          </span>
        </div>

        <div class="flex items-center space-x-1.5 shrink-0">
          <button
            type="button"
            @click="onToggleRecording"
            class="w-7 h-7 rounded-full bg-white/[0.08] hover:bg-white/15 text-zinc-200 hover:text-white btn-spring cursor-pointer inline-flex items-center justify-center"
            :aria-label="stats.hasStartedMoving && stats.isRecording ? 'Pause' : 'Start'"
          >
            <component :is="stats.hasStartedMoving && stats.isRecording ? Pause : Play" class="w-3.5 h-3.5 stroke-[2]" />
          </button>
          <button
            type="button"
            @click="onResetSession"
            class="w-7 h-7 rounded-full bg-white/[0.08] hover:bg-white/15 text-zinc-400 hover:text-white btn-spring cursor-pointer inline-flex items-center justify-center"
            aria-label="Reset"
          >
            <RotateCcw class="w-3.5 h-3.5 stroke-[2]" />
          </button>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { TelemetryData, SessionStats, AppSettings, SpeedUnit, ViewMode } from '../types'
import {
  formatSpeedValue,
  convertSpeed,
  formatAltitudeValue,
  formatTripDistanceParts,
  formatDuration,
  calculateMach,
  compassDirectionFromHeading
} from '../services/unitConverters'
import { useI18n } from '../services/i18n'
import { playTactileTick } from '../services/audioCallouts'
import {
  ChevronDown,
  Pause,
  Play,
  RotateCcw,
  X
} from 'lucide-vue-next'

const props = defineProps<{
  telemetry: TelemetryData
  stats: SessionStats
  settings: AppSettings
}>()

const emit = defineEmits<{
  (e: 'update:settings', newSettings: AppSettings): void
  (e: 'openHud'): void
  (e: 'requestPermission'): void
  (e: 'toggleRecording'): void
  (e: 'resetSession'): void
}>()

const t = computed(() => useI18n(props.settings.language))

// 顶部 GPS 状态胶囊自动折叠逻辑: 状态变更时短暂展示文字 2.8 秒，随后自动收纳为一个呼吸小圆点
const gpsLabelExpanded = ref(true)
let gpsCollapseTimer: number | null = null

function scheduleGpsCollapse() {
  if (gpsCollapseTimer !== null) {
    window.clearTimeout(gpsCollapseTimer)
  }
  gpsLabelExpanded.value = true
  gpsCollapseTimer = window.setTimeout(() => {
    if (props.telemetry.gpsStatus === 'READY' || props.telemetry.gpsStatus === 'LOCATING') {
      gpsLabelExpanded.value = false
    }
  }, 2800)
}

const showFullGpsText = computed(() => {
  if (props.telemetry.gpsStatus === 'PROMPT' || props.telemetry.gpsStatus === 'DENIED') {
    return true
  }
  return gpsLabelExpanded.value
})

function onGpsPillClick() {
  playTactileTick(props.settings.hapticFeedback)
  if (!showFullGpsText.value) {
    scheduleGpsCollapse()
    return
  }
  emit('requestPermission')
}

// 机舱/车内靠窗小提醒: 展示 4.5 秒后自动淡出消失，也可点击立即关闭
const showCabinTip = ref(false)
let cabinTipTimer: number | null = null

function triggerCabinTipBriefly() {
  if (cabinTipTimer !== null) {
    window.clearTimeout(cabinTipTimer)
  }
  showCabinTip.value = true
  cabinTipTimer = window.setTimeout(() => {
    showCabinTip.value = false
  }, 4500)
}

watch(
  () => [props.telemetry.gpsStatus, props.telemetry.isAccuracyLow],
  ([newStatus, isLow], [oldStatus]) => {
    if (newStatus !== oldStatus) {
      scheduleGpsCollapse()
    }
    if (newStatus === 'LOCATING' || isLow) {
      if (oldStatus !== 'LOCATING') {
        triggerCabinTipBriefly()
      }
    } else {
      showCabinTip.value = false
    }
  }
)

// 60fps 物理惯性插值显示
const displayedSpeedMps = ref(0)
let rafId: number | null = null

function animateSpeedDisplay() {
  const target = Number.isFinite(props.telemetry?.speedMps) ? props.telemetry.speedMps : 0
  if (target === 0 && displayedSpeedMps.value < 0.08) {
    displayedSpeedMps.value = 0
  } else {
    const diff = target - displayedSpeedMps.value
    if (Math.abs(diff) < 0.01) {
      displayedSpeedMps.value = target
    } else {
      displayedSpeedMps.value += diff * 0.18
    }
  }
  rafId = window.requestAnimationFrame(animateSpeedDisplay)
}

onMounted(() => {
  displayedSpeedMps.value = props.telemetry?.speedMps || 0
  rafId = window.requestAnimationFrame(animateSpeedDisplay)
  scheduleGpsCollapse()
  if (props.telemetry.gpsStatus === 'LOCATING' || props.telemetry.isAccuracyLow) {
    triggerCabinTipBriefly()
  }
})

onUnmounted(() => {
  if (rafId !== null) window.cancelAnimationFrame(rafId)
  if (gpsCollapseTimer !== null) window.clearTimeout(gpsCollapseTimer)
  if (cabinTipTimer !== null) window.clearTimeout(cabinTipTimer)
})

watch(
  () => props.telemetry.speedMps,
  (newVal) => {
    if (newVal === 0 && displayedSpeedMps.value < 0.3) {
      displayedSpeedMps.value = 0
    }
  }
)

function updateViewMode(mode: ViewMode) {
  playTactileTick(props.settings.hapticFeedback)
  emit('update:settings', {
    ...props.settings,
    viewMode: mode
  })
}

function cycleUnit() {
  playTactileTick(props.settings.hapticFeedback)
  const units: SpeedUnit[] = ['km/h', 'knots', 'mph', 'm/s']
  const idx = units.indexOf(props.settings.speedUnit)
  const next = units[(idx + 1) % units.length]
  emit('update:settings', {
    ...props.settings,
    speedUnit: next
  })
}

function toggleAltitudeUnit() {
  playTactileTick(props.settings.hapticFeedback)
  emit('update:settings', {
    ...props.settings,
    altitudeUnit: props.settings.altitudeUnit === 'm' ? 'ft' : 'm'
  })
}

function onOpenHud() {
  playTactileTick(props.settings.hapticFeedback)
  emit('openHud')
}

function onOpenPermission() {
  playTactileTick(props.settings.hapticFeedback)
  emit('requestPermission')
}

function onToggleRecording() {
  playTactileTick(props.settings.hapticFeedback)
  emit('toggleRecording')
}

function onResetSession() {
  playTactileTick(props.settings.hapticFeedback)
  emit('resetSession')
}

const speedUnitDisplay = computed(() => {
  return props.settings.speedUnit === 'knots' ? 'kt' : props.settings.speedUnit
})

const formattedSpeed = computed(() => {
  return formatSpeedValue(displayedSpeedMps.value, props.settings.speedUnit)
})

const minimalNumeralClass = computed(() => {
  const len = formattedSpeed.value.integer.length
  if (len >= 4) return 'text-[4.5rem] sm:text-[5rem]'
  if (len === 3) return 'text-[5.75rem] sm:text-[6.5rem]'
  return 'text-[7.5rem] sm:text-[8.75rem]'
})

const gaugeNumeralClass = computed(() => {
  const len = formattedSpeed.value.integer.length
  if (len >= 3) return 'text-5xl sm:text-[3.25rem]'
  return 'text-6xl sm:text-[4.25rem]'
})

const machNumber = computed(() => {
  return calculateMach(displayedSpeedMps.value, props.telemetry.altitudeM)
})

const formattedMaxSpeed = computed(() => {
  const maxMps = Number.isFinite(props.stats?.maxSpeedMps) ? props.stats.maxSpeedMps : 0
  const v = convertSpeed(maxMps, props.settings.speedUnit)
  return Math.round(v).toString()
})

const formattedAvgSpeed = computed(() => {
  const avgMps = Number.isFinite(props.stats?.avgSpeedMps) ? props.stats.avgSpeedMps : 0
  const v = convertSpeed(avgMps, props.settings.speedUnit)
  return `${Math.round(v)}`
})

const formattedAltitude = computed(() => {
  return formatAltitudeValue(props.telemetry?.altitudeM, props.settings.altitudeUnit)
})

const altitudeSubtitle = computed(() => {
  const unitLabel = props.settings.altitudeUnit === 'ft' ? 'ft' : 'm'
  const vsi = props.telemetry?.verticalSpeedMps || 0
  if (props.telemetry?.altitudeM !== null && Math.abs(vsi) >= 0.5) {
    const arrow = vsi > 0 ? '↑' : '↓'
    return `${arrow}${Math.abs(vsi).toFixed(1)}m/s · ${unitLabel}`
  }
  return unitLabel
})

const tripDistance = computed(() => {
  return formatTripDistanceParts(props.stats?.distanceM || 0, props.settings.speedUnit)
})

const formattedDuration = computed(() => {
  return formatDuration(props.stats?.durationSec || 0)
})

const headingLabel = computed(() => {
  if (props.telemetry.headingDeg === null || !Number.isFinite(props.telemetry.headingDeg)) {
    return '--°'
  }
  return `${Math.round(props.telemetry.headingDeg)}° ${compassDirectionFromHeading(props.telemetry.headingDeg, props.settings.language)}`
})

const gpsStatusText = computed(() => {
  switch (props.telemetry?.gpsStatus) {
    case 'READY': {
      if (props.telemetry.isAccuracyLow) {
        return t.value.gpsWeak
      }
      return t.value.gpsLocked
    }
    case 'LOCATING':
      return t.value.gpsLocating
    case 'PROMPT':
      return t.value.gpsPrompt
    case 'DENIED':
      return t.value.gpsDenied
    default:
      return t.value.gpsReady
  }
})

// 克制单色定位状态圆点: 信号锁定为纯白微光，搜寻中为柔和银灰呼吸，无刺眼红黄
const gpsDotColor = computed(() => {
  switch (props.telemetry?.gpsStatus) {
    case 'READY':
      return props.telemetry?.isAccuracyLow
        ? 'bg-white/55'
        : 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]'
    case 'LOCATING':
    case 'PROMPT':
      return 'bg-white/50 animate-pulse'
    default:
      return 'bg-white/25'
  }
})

const currentGaugeMax = computed(() => {
  const val = convertSpeed(displayedSpeedMps.value, props.settings.speedUnit)
  if (val <= 55) return 60
  if (val <= 150) return 160
  if (val <= 380) return 400
  return 1000
})

const gaugeTicks = computed(() => {
  const totalTicks = 60
  const startAngleDeg = 135
  const sweepAngleDeg = 270
  const val = convertSpeed(displayedSpeedMps.value, props.settings.speedUnit)
  const ratio = Math.min(1, Math.max(0, val / currentGaugeMax.value))
  const activeTickCount = Math.round(ratio * totalTicks)

  const ticks = []
  for (let i = 0; i <= totalTicks; i++) {
    const isMajor = i % 5 === 0
    const angleDeg = startAngleDeg + (i / totalTicks) * sweepAngleDeg
    const rad = (angleDeg * Math.PI) / 180
    const outerR = 106
    const innerR = isMajor ? 94 : 98
    const cx = 120
    const cy = 120
    ticks.push({
      index: i,
      isMajor,
      active: i <= activeTickCount && val > 0.1,
      x1: cx + innerR * Math.cos(rad),
      y1: cy + innerR * Math.sin(rad),
      x2: cx + outerR * Math.cos(rad),
      y2: cy + outerR * Math.sin(rad)
    })
  }
  return ticks
})

const sparklinePoints = computed(() => {
  const timeline = props.stats?.speedTimeline || []
  const recent = timeline.slice(-60)
  if (recent.length < 2) {
    return []
  }
  const maxSpd = Math.max(5, ...recent.map((s) => s.speedMps))
  return recent.map((pt, idx) => {
    const x = (idx / (recent.length - 1)) * 300
    const y = 22 - (Math.min(pt.speedMps, maxSpd) / maxSpd) * 18
    return { x, y }
  })
})

const sparklinePath = computed(() => {
  const pts = sparklinePoints.value
  if (pts.length < 2) {
    return 'M 0 22 L 300 22'
  }
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
})

const sparklineAreaPath = computed(() => {
  const pts = sparklinePoints.value
  if (pts.length < 2) return ''
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  return `${line} L 300 24 L 0 24 Z`
})

// 纯粹光学黑白银微光，随速度微微提亮亮度而非变换廉价彩光
const ambientGlowStyle = computed(() => {
  const kmh = displayedSpeedMps.value * 3.6
  const intensity = Math.min(0.08, 0.035 + (kmh / 300) * 0.045)
  return {
    background: `radial-gradient(ellipse at 50% 36%, rgba(255, 255, 255, ${intensity.toFixed(3)}) 0%, transparent 68%)`
  }
})
</script>
