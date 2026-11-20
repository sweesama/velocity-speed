<template>
  <div class="flex-1 min-h-0 h-full flex flex-col justify-between w-full max-w-md mx-auto px-5 pt-2 pb-3 select-none overflow-y-auto no-scrollbar font-sans">
    <!-- 顶部唯一控制栏: 严格控制宽度 (总宽 < 290px，在 340px 视口内留足 50px 余量，绝不溢出) -->
    <header class="w-full flex items-center justify-between gap-2 pb-2.5 shrink-0">
      <!-- 左侧: 材质与实景背景切换 -->
      <div class="flex items-center p-0.5 rounded-full apple-pill text-[11px] shrink-0">
        <button
          v-for="s in styles"
          :key="s.id"
          type="button"
          @click="selectStyle(s.id)"
          class="px-2.5 py-1 rounded-full font-medium transition cursor-pointer whitespace-nowrap"
          :class="currentStyle === s.id && !bgPhotoUrl ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'"
        >
          {{ s.label }}
        </button>

        <button
          type="button"
          @click="triggerPhotoUpload"
          class="px-2.5 py-1 rounded-full font-medium transition cursor-pointer whitespace-nowrap inline-flex items-center space-x-1"
          :class="bgPhotoUrl ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'"
        >
          <Camera class="w-3 h-3 stroke-[1.8]" />
          <span>{{ settings.language === 'en' ? 'Photo' : '实景' }}</span>
        </button>
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          class="hidden"
          @change="onPhotoSelected"
        />
      </div>

      <!-- 右侧: 换词图标按钮 + 保存按钮 (精简紧凑，彻底杜绝右侧溢出) -->
      <div class="flex items-center space-x-1.5 shrink-0">
        <button
          type="button"
          @click="shuffleQuote"
          class="h-7 px-2.5 rounded-full apple-pill hover:bg-white/15 active:scale-95 transition cursor-pointer inline-flex items-center space-x-1 text-[11px] text-zinc-200 hover:text-white font-medium whitespace-nowrap shrink-0"
          :title="t.btnShuffleQuote"
        >
          <RefreshCw class="w-3 h-3 transition-transform duration-300 shrink-0" :style="{ transform: `rotate(${quoteVariant * 180}deg)` }" />
          <span>{{ settings.language === 'en' ? 'Vibe' : '换词' }}</span>
        </button>

        <button
          type="button"
          @click="exportPoster"
          :disabled="isExporting"
          class="h-7 px-3 rounded-full bg-white text-black font-semibold text-[11px] hover:bg-zinc-200 active:scale-95 transition cursor-pointer shadow-sm inline-flex items-center space-x-1 whitespace-nowrap shrink-0"
        >
          <Download class="w-3 h-3 stroke-[2.2] shrink-0" />
          <span>{{ isExporting ? '...' : (settings.language === 'en' ? 'Save' : '保存') }}</span>
        </button>
      </div>
    </header>

    <!-- 满屏主体证书卡片: 建筑级留白与线性分割，去除套娃边框与重复标尺 -->
    <div
      class="relative flex-1 min-h-0 w-full rounded-[28px] p-6 flex flex-col justify-between overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.9)] transition-all duration-300"
      :class="cardBgClass"
    >
      <!-- 实景照片暗调光学衬底 -->
      <div
        v-if="bgPhotoUrl"
        class="absolute inset-0 bg-cover bg-center pointer-events-none transition-opacity duration-500"
        :style="{ backgroundImage: `url(${bgPhotoUrl})` }"
      >
        <div class="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/85"></div>
      </div>

      <!-- 极克制的单色顶部柔光 -->
      <div
        v-else
        class="absolute -top-28 left-1/2 -translate-x-1/2 w-80 h-56 rounded-full blur-3xl pointer-events-none bg-white/[0.045]"
      ></div>

      <!-- 1. 顶部刊头: 左侧品牌与简洁备注输入 (绝不截断) + 右侧状态勋章 -->
      <div class="relative z-10 flex items-start justify-between gap-3 pb-4 border-b border-white/[0.08] shrink-0">
        <div class="min-w-0 flex-1">
          <div class="flex items-center space-x-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-white/80"></span>
            <span class="text-[10px] font-mono tracking-[0.26em] text-white/45 uppercase">VELOCITY</span>
            <span
              v-if="settings.isProUnlocked"
              class="px-1.5 py-0.2 rounded bg-white/10 border border-white/15 font-mono text-[8.5px] text-white/85 tracking-wider uppercase"
            >
              FOUNDER
            </span>
          </div>
          <input
            v-model="customTag"
            type="text"
            maxlength="22"
            :placeholder="settings.language === 'en' ? 'Add flight or route note...' : '添加行程或航班备注...'"
            class="mt-1 w-full bg-transparent text-[12px] text-white/85 font-normal placeholder-white/40 focus:placeholder-white/25 focus:outline-none transition truncate"
          />
        </div>

        <button
          type="button"
          @click="shuffleQuote"
          class="inline-flex items-center px-3 py-1 rounded-full bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.14] text-[11px] text-white/90 font-medium whitespace-nowrap shrink-0 cursor-pointer active:scale-95 transition"
        >
          <span>{{ viralInsight.badge }}</span>
        </button>
      </div>

      <!-- 2. 中央视觉重心: 超大雕塑感数字 + 纯粹杂志级排版金句 (无套娃方框，无冗余标尺) -->
      <div class="relative z-10 my-auto flex flex-col items-center text-center py-2">
        <button
          type="button"
          @click="cycleDemoScenario"
          class="text-[10px] font-mono tracking-[0.22em] text-white/40 hover:text-white/70 uppercase mb-2 transition cursor-pointer"
        >
          {{ demoScenario ? demoScenario.label : t.certPeakTitle }}
        </button>

        <!-- 光学居中大数字 (点击数字可预览不同速度段位证书，位数自适应字号) -->
        <div
          @click="cycleDemoScenario"
          class="relative inline-flex items-baseline justify-center hero-numeral cursor-pointer active:scale-95 transition-transform duration-150"
          :title="settings.language === 'en' ? 'Tap to preview speed tiers' : '点击可预览不同速度段位证书'"
        >
          <span
            class="font-[200] text-white leading-none tracking-[-0.045em] transition-all duration-200"
            :class="certNumeralClass"
          >
            {{ formattedMaxSpeed }}
          </span>
          <span class="text-base sm:text-lg font-light text-white/40 ml-2 uppercase font-mono">
            {{ speedUnitDisplay }}
          </span>
        </div>

        <!-- 走心社交文案区 (遵循手工级语义断行 \n + 丝滑淡入淡出动效，绝不拆碎词语或产生单字孤行) -->
        <div
          @click="shuffleQuote"
          class="mt-7 w-full px-1 mx-auto cursor-pointer group transition-opacity hover:opacity-90 min-h-[88px] flex flex-col justify-center"
        >
          <Transition name="quote" mode="out-in">
            <div :key="`${quoteVariant}-${demoIndex}-${settings.language}`">
              <p class="text-[14.5px] font-medium text-white leading-[1.65] tracking-tight whitespace-pre-line">
                {{ viralInsight.headline }}
              </p>
              <p class="text-[12px] text-white/50 mt-2.5 leading-[1.65] font-normal whitespace-pre-line">
                {{ viralInsight.subtext }}
              </p>
            </div>
          </Transition>
        </div>
      </div>

      <!-- 3. 底部建筑感线性四联数据栏 (用 1px 极细分割线替代笨重黑框) -->
      <div class="relative z-10 shrink-0">
        <div class="grid grid-cols-4 gap-1 py-3.5 border-y border-white/[0.08] text-center">
          <div>
            <div class="text-[10px] text-white/40 truncate">{{ t.certAvgSpeed }}</div>
            <div class="text-[13px] font-medium text-white mt-1 tabular-nums whitespace-nowrap font-mono">{{ formattedAvgSpeed }}</div>
          </div>
          <div class="border-l border-white/[0.08]">
            <div class="text-[10px] text-white/40 truncate">{{ t.certMaxAlt }}</div>
            <div class="text-[13px] font-medium text-white mt-1 tabular-nums whitespace-nowrap font-mono">{{ formattedMaxAltitude }}</div>
          </div>
          <div class="border-l border-white/[0.08]">
            <div class="text-[10px] text-white/40 truncate">{{ t.certDistance }}</div>
            <div class="text-[13px] font-medium text-white mt-1 tabular-nums whitespace-nowrap font-mono">{{ formatDistance(displayStats.distanceM, settings.speedUnit) }}</div>
          </div>
          <div class="border-l border-white/[0.08]">
            <div class="text-[10px] text-white/40 truncate">{{ t.certDuration }}</div>
            <div class="text-[13px] font-medium text-white mt-1 tabular-nums whitespace-nowrap font-mono">{{ formatDuration(displayStats.durationSec) }}</div>
          </div>
        </div>

        <!-- 底部极简时间戳与署名 -->
        <div class="flex items-center justify-between pt-3 text-[10px] text-white/35 font-mono">
          <span>{{ dateString }}</span>
          <span class="tracking-widest uppercase">VELOCITY</span>
        </div>
      </div>
    </div>

    <!-- 微信/iOS/小红书全兼容海报长按保存与原生分享弹窗 (解决微信内置浏览器拦截 <a download> 无法存相册的痛点) -->
    <Transition name="modal">
      <div
        v-if="exportedImageUrl"
        class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-5 select-none"
        @click.self="exportedImageUrl = null"
      >
        <div class="w-full max-w-[330px] flex flex-col items-center animate-fade-in">
          <div class="w-full flex items-center justify-between mb-2.5 px-1">
            <span class="text-xs font-medium text-zinc-200">
              {{
                settings.language === 'en'
                  ? 'Long-press image to save to Photos'
                  : '手机请「长按下方海报」保存至系统相册'
              }}
            </span>
            <button
              type="button"
              @click="exportedImageUrl = null"
              class="p-1 rounded-full bg-white/10 text-zinc-300 hover:text-white btn-spring cursor-pointer"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <img
            :src="exportedImageUrl"
            alt="Velocity Speed Card"
            class="w-full rounded-[22px] border border-white/15 shadow-2xl select-auto pointer-events-auto"
          />

          <div class="w-full flex gap-2 mt-3.5">
            <button
              type="button"
              @click="shareExportedImage"
              class="flex-1 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 btn-spring cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Share2 class="w-3.5 h-3.5 stroke-[2]" />
              <span>{{ settings.language === 'en' ? 'Share Image' : '调用系统分享' }}</span>
            </button>
            <button
              type="button"
              @click="exportedImageUrl = null"
              class="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium btn-spring cursor-pointer"
            >
              {{ settings.language === 'en' ? 'Done' : '完成' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { TelemetryData, SessionStats, SessionHistoryItem, AppSettings } from '../types'
import {
  convertSpeed,
  formatAltitudeValue,
  formatDistance,
  formatDuration
} from '../services/unitConverters'
import { useI18n, getSpeedViralInsight } from '../services/i18n'
import { playTactileTick } from '../services/audioCallouts'
import { Camera, Download, RefreshCw, Share2, X } from 'lucide-vue-next'

const props = defineProps<{
  telemetry: TelemetryData
  stats: SessionStats
  history: SessionHistoryItem[]
  settings: AppSettings
}>()

const emit = defineEmits<{
  (e: 'resetSession'): void
  (e: 'notify', message: string): void
  (e: 'openProModal'): void
}>()

const t = computed(() => useI18n(props.settings.language))

const isExporting = ref(false)
const exportedImageUrl = ref<string | null>(null)
const currentStyle = ref<'dark' | 'glass' | 'cyber'>('dark')
const customTag = ref('')
const quoteVariant = ref(0)

// 实景照片水印背景支持
const fileInputRef = ref<HTMLInputElement | null>(null)
const bgPhotoUrl = ref<string | null>(null)
const bgPhotoImage = ref<HTMLImageElement | null>(null)

function selectStyle(id: 'dark' | 'glass' | 'cyber') {
  playTactileTick(props.settings.hapticFeedback)
  // 曜石黑永久免费；钛金与暖砂高定材质需激活 Pro 或领取早鸟码
  if (id !== 'dark' && !props.settings.isProUnlocked) {
    emit('openProModal')
    return
  }
  bgPhotoUrl.value = null
  bgPhotoImage.value = null
  currentStyle.value = id
}

function triggerPhotoUpload() {
  playTactileTick(props.settings.hapticFeedback)
  if (!props.settings.isProUnlocked) {
    emit('openProModal')
    return
  }
  fileInputRef.value?.click()
}

function onPhotoSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const result = reader.result as string
    bgPhotoUrl.value = result
    const img = new Image()
    img.src = result
    bgPhotoImage.value = img
  }
  reader.readAsDataURL(file)
}

function shuffleQuote() {
  playTactileTick(props.settings.hapticFeedback)
  quoteVariant.value = (quoteVariant.value + 1) % 3
}

const demoIndex = ref(0)

const demoPresets = computed(() => {
  const isEn = props.settings.language === 'en'
  return [
    null,
    {
      label: isEn ? 'PREVIEW · WALKING' : '预览模式 · 散步街溜子 (点击数字切换)',
      maxSpeedMps: 5.2 / 3.6,
      avgSpeedMps: 4.1 / 3.6,
      maxAltitudeM: 42,
      distanceM: 1850,
      durationSec: 1620
    },
    {
      label: isEn ? 'PREVIEW · CITY RIDE' : '预览模式 · 城市破风骑行 (点击数字切换)',
      maxSpeedMps: 35.0 / 3.6,
      avgSpeedMps: 24.5 / 3.6,
      maxAltitudeM: 68,
      distanceM: 8400,
      durationSec: 1230
    },
    {
      label: isEn ? 'PREVIEW · NIGHT DRIVE' : '预览模式 · 深夜高架兜风 (点击数字切换)',
      maxSpeedMps: 98.0 / 3.6,
      avgSpeedMps: 76.0 / 3.6,
      maxAltitudeM: 115,
      distanceM: 28600,
      durationSec: 1350
    },
    {
      label: isEn ? 'PREVIEW · BULLET TRAIN' : '预览模式 · 复兴号高铁 (点击数字切换)',
      maxSpeedMps: 348.0 / 3.6,
      avgSpeedMps: 292.0 / 3.6,
      maxAltitudeM: 160,
      distanceM: 142000,
      durationSec: 1750
    },
    {
      label: isEn ? 'PREVIEW · FLIGHT CRUISE' : '预览模式 · 万米高空巡航 (点击数字切换)',
      maxSpeedMps: 885.0 / 3.6,
      avgSpeedMps: 810.0 / 3.6,
      maxAltitudeM: 10600,
      distanceM: 685000,
      durationSec: 3040
    }
  ]
})

const demoScenario = computed(() => demoPresets.value[demoIndex.value] || null)

function cycleDemoScenario() {
  playTactileTick(props.settings.hapticFeedback)
  demoIndex.value = (demoIndex.value + 1) % demoPresets.value.length
  quoteVariant.value = 0
}

// 精简双字标签，确保在任何小屏手机上绝不挤压右侧按钮
const styles = computed(() => [
  { id: 'dark' as const, label: props.settings.language === 'en' ? 'Dark' : '曜石' },
  { id: 'glass' as const, label: props.settings.language === 'en' ? 'Steel' : '钛金' },
  { id: 'cyber' as const, label: props.settings.language === 'en' ? 'Sand' : '暖砂' }
])

const displayStats = computed(() => {
  if (demoScenario.value) {
    return {
      startTime: Date.now(),
      durationSec: demoScenario.value.durationSec,
      distanceM: demoScenario.value.distanceM,
      maxSpeedMps: demoScenario.value.maxSpeedMps,
      avgSpeedMps: demoScenario.value.avgSpeedMps,
      maxAltitudeM: demoScenario.value.maxAltitudeM,
      peakG: 0,
      zeroToHundredSec: null
    }
  }
  return {
    startTime: props.stats.startTime,
    durationSec: props.stats.durationSec,
    distanceM: props.stats.distanceM,
    maxSpeedMps: props.stats.maxSpeedMps,
    avgSpeedMps: props.stats.avgSpeedMps,
    maxAltitudeM: props.stats.maxAltitudeM ?? props.telemetry.altitudeM,
    peakG: props.stats.peakG,
    zeroToHundredSec: props.stats.zeroToHundredSec
  }
})

const viralInsight = computed(() => {
  const maxKmh = (displayStats.value.maxSpeedMps || 0) * 3.6
  return getSpeedViralInsight(maxKmh, props.settings.language, quoteVariant.value)
})

const cardBgClass = computed(() => {
  switch (currentStyle.value) {
    case 'dark':
      return 'bg-gradient-to-b from-[#111114] to-[#060608] border border-white/[0.1]'
    case 'glass':
      return 'bg-gradient-to-b from-[#1e2025] to-[#0c0d10] border border-white/[0.18]'
    case 'cyber':
      return 'bg-gradient-to-b from-[#1b1916] to-[#0a0908] border border-[#d6c7b2]/20'
  }
})

const speedUnitDisplay = computed(() => {
  return props.settings.speedUnit === 'knots' ? 'kt' : props.settings.speedUnit
})

const formattedMaxSpeed = computed(() => {
  const mps = Number.isFinite(displayStats.value.maxSpeedMps) ? displayStats.value.maxSpeedMps : 0
  const v = convertSpeed(mps, props.settings.speedUnit)
  return Math.round(v).toString()
})

const certNumeralClass = computed(() => {
  const len = formattedMaxSpeed.value.length
  if (len >= 3) return 'text-[5.5rem] sm:text-[6.25rem]'
  return 'text-[6.75rem] sm:text-[7.5rem]'
})

const formattedAvgSpeed = computed(() => {
  const mps = Number.isFinite(displayStats.value.avgSpeedMps) ? displayStats.value.avgSpeedMps : 0
  const v = convertSpeed(mps, props.settings.speedUnit)
  return `${Math.round(v)} ${speedUnitDisplay.value}`
})

const formattedMaxAltitude = computed(() => {
  const alt = displayStats.value.maxAltitudeM
  if (alt === null || alt === undefined || !Number.isFinite(alt)) return '--'
  return `${formatAltitudeValue(alt, props.settings.altitudeUnit)} ${props.settings.altitudeUnit}`
})

function formatTimestamp(ts: number | null) {
  const d = new Date(ts || Date.now())
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const dateString = computed(() => formatTimestamp(displayStats.value.startTime))

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function drawCenteredWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number = 3
): number {
  const paragraphs = text.split('\n')
  const isCjk = /[\u4e00-\u9fa5]/.test(text)
  let currentY = startY
  let lineCount = 0

  ctx.textAlign = 'center'

  for (const para of paragraphs) {
    if (lineCount >= maxLines) break
    const units = isCjk ? Array.from(para) : para.split(' ')
    let line = ''

    for (let i = 0; i < units.length; i++) {
      const sep = isCjk ? '' : line ? ' ' : ''
      const testLine = line + sep + units[i]
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line, centerX, currentY)
        line = units[i]
        currentY += lineHeight
        lineCount++
        if (lineCount >= maxLines) break
      } else {
        line = testLine
      }
    }
    if (line && lineCount < maxLines) {
      ctx.fillText(line, centerX, currentY)
      currentY += lineHeight
      lineCount++
    }
  }
  return currentY
}

async function exportPoster() {
  if (isExporting.value) return
  isExporting.value = true

  try {
    const canvas = document.createElement('canvas')
    const width = 1080
    const height = 1350
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 1. 绘制背景
    if (bgPhotoImage.value && bgPhotoImage.value.complete) {
      const img = bgPhotoImage.value
      const scale = Math.max(width / img.width, height / img.height)
      const sw = img.width * scale
      const sh = img.height * scale
      ctx.drawImage(img, (width - sw) / 2, (height - sh) / 2, sw, sh)
      const overlay = ctx.createLinearGradient(0, 0, 0, height)
      overlay.addColorStop(0, 'rgba(0,0,0,0.68)')
      overlay.addColorStop(0.5, 'rgba(0,0,0,0.48)')
      overlay.addColorStop(1, 'rgba(0,0,0,0.88)')
      ctx.fillStyle = overlay
      ctx.fillRect(0, 0, width, height)
    } else {
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height)
      if (currentStyle.value === 'glass') {
        bgGradient.addColorStop(0, '#1e2025')
        bgGradient.addColorStop(1, '#0c0d10')
      } else if (currentStyle.value === 'cyber') {
        bgGradient.addColorStop(0, '#1b1916')
        bgGradient.addColorStop(1, '#0a0908')
      } else {
        bgGradient.addColorStop(0, '#111114')
        bgGradient.addColorStop(1, '#060608')
      }
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, width, height)

      const radial = ctx.createRadialGradient(width * 0.5, 160, 20, width * 0.5, 160, 560)
      radial.addColorStop(0, 'rgba(255, 255, 255, 0.05)')
      radial.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = radial
      ctx.fillRect(0, 0, width, height)
    }

    drawRoundedRect(ctx, 56, 56, width - 112, height - 112, 48)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
    ctx.lineWidth = 2
    ctx.stroke()

    // 2. 顶部刊头
    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.font = '600 21px "JetBrains Mono", -apple-system, monospace'
    ctx.fillText(
      props.settings.isProUnlocked ? '● VELOCITY · FOUNDER EDITION' : '● VELOCITY',
      110,
      140
    )

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
    ctx.font = '400 30px "Inter", -apple-system, sans-serif'
    ctx.fillText(customTag.value.trim() || t.value.certHeaderSub, 110, 190)

    ctx.font = '500 23px "Inter", -apple-system, sans-serif'
    const badgeStr = viralInsight.value.badge
    const badgeW = ctx.measureText(badgeStr).width + 56
    drawRoundedRect(ctx, width - 110 - badgeW, 128, badgeW, 54, 27)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.07)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.textAlign = 'center'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(badgeStr, width - 110 - badgeW / 2, 163)

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(110, 236)
    ctx.lineTo(width - 110, 236)
    ctx.stroke()

    // 3. 中央核心大数字
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.font = '500 22px "JetBrains Mono", -apple-system, monospace'
    ctx.fillText(t.value.certPeakTitle, width / 2, 360)

    ctx.fillStyle = '#ffffff'
    ctx.font = '200 260px "Outfit", -apple-system, sans-serif'
    ctx.fillText(formattedMaxSpeed.value, width / 2, 600)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.font = '300 36px "JetBrains Mono", -apple-system, monospace'
    ctx.fillText(props.settings.speedUnit.toUpperCase(), width / 2, 665)

    // 4. 杂志感居中金句排版
    ctx.fillStyle = '#ffffff'
    ctx.font = '500 34px "Inter", -apple-system, sans-serif'
    const nextY = drawCenteredWrappedText(
      ctx,
      `“${viralInsight.value.headline}”`,
      width / 2,
      775,
      width - 260,
      50,
      2
    )

    ctx.fillStyle = 'rgba(255, 255, 255, 0.52)'
    ctx.font = '400 24px "Inter", -apple-system, sans-serif'
    drawCenteredWrappedText(
      ctx,
      viralInsight.value.subtext,
      width / 2,
      nextY + 18,
      width - 260,
      38,
      2
    )

    // 5. 底部建筑感 1px 线性四联指标
    const gridTopY = 1005
    const gridBotY = 1165
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(110, gridTopY)
    ctx.lineTo(width - 110, gridTopY)
    ctx.moveTo(110, gridBotY)
    ctx.lineTo(width - 110, gridBotY)
    ctx.stroke()

    const cols = [
      { label: t.value.certAvgSpeed, val: formattedAvgSpeed.value },
      { label: t.value.certMaxAlt, val: formattedMaxAltitude.value },
      { label: t.value.certDistance, val: formatDistance(displayStats.value.distanceM, props.settings.speedUnit) },
      { label: t.value.certDuration, val: formatDuration(displayStats.value.durationSec) }
    ]
    const colW = (width - 220) / 4
    ctx.textAlign = 'center'
    cols.forEach((c, idx) => {
      const cx = 110 + colW * idx + colW / 2
      ctx.fillStyle = 'rgba(255, 255, 255, 0.42)'
      ctx.font = '400 22px "Inter", -apple-system, sans-serif'
      ctx.fillText(c.label, cx, gridTopY + 62)

      ctx.fillStyle = '#ffffff'
      ctx.font = '500 32px "JetBrains Mono", -apple-system, monospace'
      ctx.fillText(c.val, cx, gridTopY + 118)

      if (idx > 0) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
        ctx.beginPath()
        ctx.moveTo(110 + colW * idx, gridTopY + 32)
        ctx.lineTo(110 + colW * idx, gridBotY - 32)
        ctx.stroke()
      }
    })

    // 6. 底部极简时间戳与署名 (免费版带低饱和品牌识别，内测 Pro 版为纯净 VELOCITY 刻印)
    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
    ctx.font = '500 21px "JetBrains Mono", -apple-system, monospace'
    ctx.fillText(dateString.value, 110, 1232)

    ctx.textAlign = 'right'
    const footerRight = props.settings.isProUnlocked
      ? 'VELOCITY'
      : props.settings.language === 'en'
        ? 'VELOCITY · LIVE GPS'
        : 'VELOCITY · 实时测速仪'
    ctx.fillText(footerRight, width - 110, 1232)

    const dataUrl = canvas.toDataURL('image/png')
    exportedImageUrl.value = dataUrl

    // 桌面浏览器同时自动触发文件下载，手机端通过弹窗支持微信/iOS长按保存至系统相册
    const isMobile = /iPhone|iPad|iPod|Android|MicroMessenger/i.test(navigator.userAgent || '')
    if (!isMobile) {
      const link = document.createElement('a')
      link.download = `Velocity_Card_${Date.now()}.png`
      link.href = dataUrl
      link.click()
    }
    emit('notify', t.value.toastPosterSaved)
  } catch (e) {
    console.error('Export error:', e)
    emit('notify', t.value.toastPosterError)
  } finally {
    isExporting.value = false
  }
}

async function shareExportedImage() {
  if (!exportedImageUrl.value) return
  playTactileTick(props.settings.hapticFeedback)
  try {
    const res = await fetch(exportedImageUrl.value)
    const blob = await res.blob()
    const file = new File([blob], `Velocity_${Date.now()}.png`, { type: 'image/png' })
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: 'Velocity Speed Card',
        files: [file]
      })
      emit('notify', t.value.toastPosterShared)
      return
    }
  } catch {
    // ignore share cancel
  }
  const link = document.createElement('a')
  link.download = `Velocity_Card_${Date.now()}.png`
  link.href = exportedImageUrl.value
  link.click()
}
</script>
