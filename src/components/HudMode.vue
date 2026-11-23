<template>
  <div
    class="fixed inset-0 z-50 bg-black flex flex-col justify-between p-6 sm:p-8 md:p-10 select-none overflow-hidden"
    style="background-color: #000000;"
  >
    <!-- 顶部控制栏 (保持正向不翻转，方便手持操作与退出) -->
    <header class="flex items-center justify-between gap-2 w-full z-20">
      <div class="flex items-center space-x-2">
        <!-- 镜像开关 -->
        <button
          @click="toggleMirror"
          type="button"
          class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full apple-pill hover:bg-white/[0.12] btn-spring cursor-pointer text-xs tracking-wider text-white/85 font-medium whitespace-nowrap"
        >
          <span>{{ settings.hudMirrored ? t.hudMirroredOn : t.hudMirroredOff }}</span>
          <span
            class="w-2 h-2 rounded-full transition-colors duration-200 shrink-0"
            :class="settings.hudMirrored ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]' : 'bg-white/25'"
          />
        </button>

        <!-- HUD 光学色温切换 (纯白 / 航空绿 / 夜航珀) -->
        <button
          @click="cycleHudTheme"
          type="button"
          class="px-3 py-1.5 rounded-full apple-pill hover:bg-white/[0.12] btn-spring cursor-pointer text-xs font-mono uppercase tracking-wider whitespace-nowrap"
          :style="{ color: hudColorHex }"
        >
          {{ hudThemeLabel }}
        </button>
      </div>

      <button
        @click="$emit('close')"
        type="button"
        class="p-2.5 rounded-full apple-pill text-white/60 hover:text-white hover:bg-white/[0.12] btn-spring cursor-pointer shrink-0"
        aria-label="Close HUD"
      >
        <X class="w-5 h-5 stroke-[1.8]" />
      </button>
    </header>

    <!-- 中央光学投影舞台 (仅对该区域执行水平镜像翻转，确保挡风玻璃/舷窗反射后正向成像) -->
    <main
      class="my-auto flex flex-col items-center justify-center text-center transition-transform duration-300 ease-out"
      :class="{ 'hud-mirrored': settings.hudMirrored }"
    >
      <!-- 超高对比巨幕速度 (位数自适应字号) -->
      <div
        class="relative inline-flex items-baseline justify-center hero-numeral select-none leading-none"
        :style="{ color: hudColorHex, textShadow: `0 0 36px ${hudGlowRgba}` }"
      >
        <span class="font-[200]" :class="hudNumeralClass">
          {{ speedParts.integer }}
        </span>
        <span class="text-3xl sm:text-5xl font-[200] opacity-45 ml-2">
          .{{ speedParts.decimal }}
        </span>
      </div>

      <!-- 单位与辅助高度/航向读数 -->
      <div class="mt-4 flex items-center justify-center space-x-4 font-mono uppercase tracking-[0.25em]" :style="{ color: hudColorHex }">
        <span class="text-xl sm:text-2xl opacity-60 font-light">{{ speedUnitDisplay }}</span>
        <template v-if="telemetry.altitudeM !== null">
          <span class="opacity-25">·</span>
          <span class="text-lg sm:text-xl opacity-55">
            ALT {{ formattedAlt }} {{ settings.altitudeUnit }}
          </span>
        </template>
        <template v-if="telemetry.headingDeg !== null">
          <span class="opacity-25">·</span>
          <span class="text-lg sm:text-xl opacity-55">
            {{ Math.round(telemetry.headingDeg) }}°
          </span>
        </template>
      </div>
    </main>

    <!-- 底部提示 (保持正向不翻转，手工语义断行) -->
    <footer class="text-center pb-2 flex flex-col items-center">
      <p class="text-[11.5px] text-white/35 tracking-wide leading-relaxed select-none font-normal whitespace-pre-line">
        {{ t.hudInstruction }}
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TelemetryData, SessionStats, AppSettings, HudTheme } from '../types'
import { formatSpeedValue, formatAltitudeValue } from '../services/unitConverters'
import { useI18n } from '../services/i18n'
import { playTactileTick } from '../services/audioCallouts'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  telemetry: TelemetryData
  stats: SessionStats
  settings: AppSettings
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:settings', newSettings: AppSettings): void
}>()

const t = computed(() => useI18n(props.settings.language))

function toggleMirror() {
  playTactileTick(props.settings.hapticFeedback)
  emit('update:settings', {
    ...props.settings,
    hudMirrored: !props.settings.hudMirrored
  })
}

function cycleHudTheme() {
  playTactileTick(props.settings.hapticFeedback)
  const themes: HudTheme[] = ['white', 'emerald', 'amber']
  const current = props.settings.hudTheme || 'white'
  const next = themes[(themes.indexOf(current) + 1) % themes.length]
  emit('update:settings', {
    ...props.settings,
    hudTheme: next
  })
}

const hudColorHex = computed(() => {
  switch (props.settings.hudTheme) {
    case 'emerald':
      return '#d4d4d8'
    case 'amber':
      return '#e2c799'
    default:
      return '#ffffff'
  }
})

const hudGlowRgba = computed(() => {
  switch (props.settings.hudTheme) {
    case 'emerald':
      return 'rgba(212, 212, 216, 0.18)'
    case 'amber':
      return 'rgba(226, 199, 153, 0.22)'
    default:
      return 'rgba(255, 255, 255, 0.16)'
  }
})

const hudThemeLabel = computed(() => {
  switch (props.settings.hudTheme) {
    case 'emerald':
      return t.value.hudThemeEmerald
    case 'amber':
      return t.value.hudThemeAmber
    default:
      return t.value.hudThemeWhite
  }
})

const speedUnitDisplay = computed(() => {
  return props.settings.speedUnit === 'knots' ? 'kt' : props.settings.speedUnit
})

const speedParts = computed(() => {
  return formatSpeedValue(props.telemetry.speedMps, props.settings.speedUnit)
})

const hudNumeralClass = computed(() => {
  const len = speedParts.value.integer.length
  if (len >= 3) return 'text-[6.25rem] sm:text-[9rem] md:text-[11rem]'
  return 'text-[8.25rem] sm:text-[11rem] md:text-[13rem]'
})

const formattedAlt = computed(() => {
  return formatAltitudeValue(props.telemetry.altitudeM, props.settings.altitudeUnit)
})
</script>
