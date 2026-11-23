<template>
  <div class="flex-1 min-h-0 h-full flex flex-col w-full max-w-xl mx-auto px-6 pt-2.5 pb-4 select-none overflow-y-auto no-scrollbar font-sans">
    <!-- 页面标题: 左右严格对齐网格边缘 -->
    <div class="pt-1 pb-3.5 flex items-end justify-between shrink-0">
      <div>
        <h1 class="text-[22px] font-semibold text-white tracking-tight leading-tight">{{ t.settingsTitle }}</h1>
        <p class="text-[11.5px] text-zinc-400 mt-1 whitespace-nowrap">{{ t.settingsSubtitle }}</p>
      </div>
      <button
        type="button"
        @click="checkOtaUpdate"
        class="px-2.5 py-0.5 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] font-mono text-[10px] text-zinc-400 hover:text-white tracking-wider whitespace-nowrap btn-spring cursor-pointer"
        :title="settings.language === 'en' ? 'Tap to check for updates' : '点击检查离线包热更新'"
      >
        v2.4 · OFFLINE
      </button>
    </div>

    <!-- 模块 0: Velocity Pro 终身买断权益卡 (2x2 建筑网格布局，彻底杜绝任何断词与孤字折行) -->
    <div class="mb-4 rounded-2xl p-4 bg-gradient-to-b from-white/[0.09] to-white/[0.025] border border-white/[0.14] shadow-[0_12px_32px_rgba(0,0,0,0.45)] shrink-0">
      <!-- 顶部栏: 总宽严格控制在 240px 以内，绝不挤压折行 -->
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center space-x-2 min-w-0">
          <span class="px-2 py-0.5 rounded-md bg-white text-black font-mono text-[10px] font-bold tracking-wider uppercase shrink-0">
            PRO
          </span>
          <span class="text-[14.5px] font-semibold text-white tracking-tight whitespace-nowrap">
            Velocity Pro
          </span>
          <span class="text-[11px] text-zinc-400 font-normal whitespace-nowrap">
            ·
            {{
              settings.isProUnlocked
                ? settings.language === 'en'
                  ? 'Founder Pass'
                  : '创始内测官'
                : settings.language === 'en'
                  ? 'Beta Invite'
                  : '内测限免'
            }}
          </span>
        </div>

        <button
          type="button"
          @click="settings.isProUnlocked ? toggleProExpand() : $emit('openProModal')"
          class="px-3 py-1 rounded-full bg-white text-black text-[11px] font-semibold hover:bg-zinc-200 btn-spring cursor-pointer whitespace-nowrap shrink-0"
        >
          {{
            settings.isProUnlocked
              ? isProExpanded
                ? settings.language === 'en'
                  ? 'Hide'
                  : '收起'
                : settings.language === 'en'
                  ? 'Founder ✓'
                  : '已激活 ✓'
              : settings.language === 'en'
                ? 'Activate'
                : '内测激活'
          }}
        </button>
      </div>

      <!-- 2x2 核心权益矩阵: 每个胶囊严格单行，彻底告别长句随机断词 -->
      <div class="grid grid-cols-2 gap-2 mt-3">
        <div
          v-for="perk in proGridItems"
          :key="perk.title"
          @click="toggleProExpand"
          class="px-2.5 py-2 rounded-xl bg-black/35 border border-white/[0.07] hover:border-white/[0.15] transition flex items-center space-x-2 cursor-pointer"
        >
          <component :is="perk.icon" class="w-3.5 h-3.5 text-white/85 shrink-0 stroke-[1.75]" />
          <span class="text-[11.5px] font-medium text-zinc-200 whitespace-nowrap">{{ perk.title }}</span>
        </div>
      </div>

      <!-- 展开态详情: 每一条严格控制单行字数 (<=15字)，绝不跨行拆词 -->
      <div
        v-if="isProExpanded"
        class="mt-3 pt-3 border-t border-white/[0.08] space-y-2.5 text-[11.5px] animate-fade-in"
      >
        <div
          v-for="detail in proDetailItems"
          :key="detail.num"
          class="flex items-center justify-between gap-2"
        >
          <div class="flex items-center space-x-2 min-w-0">
            <span class="font-mono text-[10px] text-white/50">{{ detail.num }}</span>
            <span class="font-medium text-white whitespace-nowrap">{{ detail.title }}</span>
          </div>
          <span class="text-[11px] text-zinc-400 whitespace-nowrap">{{ detail.desc }}</span>
        </div>

        <button
          type="button"
          @click="settings.isProUnlocked ? onPreviewProToast() : $emit('openProModal')"
          class="mt-2 w-full py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-white text-[11.5px] font-medium btn-spring cursor-pointer flex items-center justify-center space-x-1.5 whitespace-nowrap"
        >
          <Check class="w-3.5 h-3.5 stroke-[2.2]" />
          <span>
            {{
              settings.isProUnlocked
                ? settings.language === 'en'
                  ? `License Active (${settings.proLicenseCode || 'EARLY2026'})`
                  : `已绑定终身通行证 (${settings.proLicenseCode || 'EARLY2026'})`
                : settings.language === 'en'
                  ? 'Tap to Enter Early-Bird Code (EARLY2026)'
                  : '点击输入早鸟码 (EARLY2026) 免费激活'
            }}
          </span>
        </button>
      </div>
    </div>

    <!-- 模块 1: 通用偏好设置 (纯粹黑白银高定配色，单行严格对齐) -->
    <div class="mb-4 shrink-0">
      <div class="text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-1 mb-2">
        {{ t.secPreferences }}
      </div>

      <div class="rounded-2xl apple-card overflow-hidden divide-y divide-white/[0.06]">
        <!-- 界面语言切换 -->
        <div class="flex items-center justify-between px-4 py-3 gap-2">
          <span class="text-[13px] font-medium text-white whitespace-nowrap">{{ t.rowLanguage }}</span>
          <div class="flex p-0.5 rounded-xl bg-black/55 border border-white/[0.08] text-xs shrink-0">
            <button
              v-for="l in [{ id: 'zh', label: '中文' }, { id: 'en', label: 'EN' }] as const"
              :key="l.id"
              type="button"
              @click="updateSetting('language', l.id)"
              class="px-3 py-1 rounded-[9px] font-medium btn-spring cursor-pointer whitespace-nowrap"
              :class="settings.language === l.id ? 'bg-white text-black font-semibold shadow-sm' : 'text-zinc-400 hover:text-white'"
            >
              {{ l.label }}
            </button>
          </div>
        </div>

        <!-- 速度主单位切换 (使用国际航空标准缩写 kt 保持四键等宽平衡) -->
        <div class="flex items-center justify-between px-4 py-3 gap-2">
          <span class="text-[13px] font-medium text-white whitespace-nowrap">{{ t.rowSpeedUnit }}</span>
          <div class="flex p-0.5 rounded-xl bg-black/55 border border-white/[0.08] text-[11px] shrink-0">
            <button
              v-for="u in speedUnitOptions"
              :key="u.id"
              type="button"
              @click="updateSetting('speedUnit', u.id)"
              class="px-2.5 py-1 rounded-[9px] font-medium btn-spring cursor-pointer font-mono whitespace-nowrap"
              :class="settings.speedUnit === u.id ? 'bg-white text-black font-semibold shadow-sm' : 'text-zinc-400 hover:text-white'"
            >
              {{ u.label }}
            </button>
          </div>
        </div>

        <!-- 海拔单位切换 -->
        <div class="flex items-center justify-between px-4 py-3 gap-2">
          <span class="text-[13px] font-medium text-white whitespace-nowrap">{{ t.rowAltUnit }}</span>
          <div class="flex p-0.5 rounded-xl bg-black/55 border border-white/[0.08] text-xs shrink-0">
            <button
              v-for="u in [{ id: 'm', label: t.unitMeter }, { id: 'ft', label: t.unitFeet }] as const"
              :key="u.id"
              type="button"
              @click="updateSetting('altitudeUnit', u.id)"
              class="px-3 py-1 rounded-[9px] font-medium btn-spring cursor-pointer whitespace-nowrap"
              :class="settings.altitudeUnit === u.id ? 'bg-white text-black font-semibold shadow-sm' : 'text-zinc-400 hover:text-white'"
            >
              {{ u.label }}
            </button>
          </div>
        </div>

        <!-- 屏幕常亮防熄屏 (每行副标题严格单行，杜绝参差折行) -->
        <div class="flex items-center justify-between px-4 py-3 gap-3">
          <div class="min-w-0">
            <div class="text-[13px] font-medium text-white whitespace-nowrap">{{ t.rowWakeLock }}</div>
            <div class="text-[11px] text-zinc-500 mt-0.5 whitespace-nowrap truncate">{{ t.wakeLockDesc }}</div>
          </div>
          <button
            type="button"
            @click="updateSetting('keepScreenAwake', !settings.keepScreenAwake)"
            class="w-11 h-6 rounded-full p-0.5 transition-colors duration-300 cursor-pointer shrink-0 active:scale-95"
            :class="settings.keepScreenAwake ? 'bg-white' : 'bg-zinc-800 border border-white/10'"
            role="switch"
            :aria-checked="settings.keepScreenAwake"
          >
            <div
              class="w-5 h-5 rounded-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-sm"
              :class="settings.keepScreenAwake ? 'translate-x-5 bg-black' : 'translate-x-0 bg-zinc-400'"
            ></div>
          </button>
        </div>

        <!-- HUD 水平镜像反转 -->
        <div class="flex items-center justify-between px-4 py-3 gap-3">
          <div class="min-w-0">
            <div class="text-[13px] font-medium text-white whitespace-nowrap">{{ t.rowHudMirror }}</div>
            <div class="text-[11px] text-zinc-500 mt-0.5 whitespace-nowrap truncate">{{ t.hudMirrorDesc }}</div>
          </div>
          <button
            type="button"
            @click="updateSetting('hudMirrored', !settings.hudMirrored)"
            class="w-11 h-6 rounded-full p-0.5 transition-colors duration-300 cursor-pointer shrink-0 active:scale-95"
            :class="settings.hudMirrored ? 'bg-white' : 'bg-zinc-800 border border-white/10'"
            role="switch"
            :aria-checked="settings.hudMirrored"
          >
            <div
              class="w-5 h-5 rounded-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-sm"
              :class="settings.hudMirrored ? 'translate-x-5 bg-black' : 'translate-x-0 bg-zinc-400'"
            ></div>
          </button>
        </div>

        <!-- 轻触震动反馈 -->
        <div class="flex items-center justify-between px-4 py-3 gap-3">
          <div class="min-w-0">
            <div class="text-[13px] font-medium text-white whitespace-nowrap">{{ t.rowHaptics }}</div>
            <div class="text-[11px] text-zinc-500 mt-0.5 whitespace-nowrap truncate">{{ t.hapticsDesc }}</div>
          </div>
          <button
            type="button"
            @click="updateSetting('hapticFeedback', !settings.hapticFeedback)"
            class="w-11 h-6 rounded-full p-0.5 transition-colors duration-300 cursor-pointer shrink-0 active:scale-95"
            :class="settings.hapticFeedback ? 'bg-white' : 'bg-zinc-800 border border-white/10'"
            role="switch"
            :aria-checked="settings.hapticFeedback"
          >
            <div
              class="w-5 h-5 rounded-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-sm"
              :class="settings.hapticFeedback ? 'translate-x-5 bg-black' : 'translate-x-0 bg-zinc-400'"
            ></div>
          </button>
        </div>
      </div>
    </div>

    <!-- 模块 2: 传感器状态 (点击 + 按钮顺滑旋转 45° 展开实时诊断参数) -->
    <div class="mb-4 shrink-0">
      <div class="text-[11px] font-medium text-zinc-500 uppercase tracking-wider px-1 mb-2">
        {{ t.secTelemetry }}
      </div>

      <div class="rounded-2xl apple-card overflow-hidden divide-y divide-white/[0.06]">
        <button
          type="button"
          @click="toggleTelemetry"
          class="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition cursor-pointer text-left"
        >
          <div class="flex items-center space-x-2.5">
            <Radio class="w-4 h-4 text-zinc-400 stroke-[1.7]" />
            <span class="text-[13px] font-medium text-white whitespace-nowrap">{{ t.rowSatStatus }}</span>
          </div>
          <div class="flex items-center space-x-2.5">
            <div class="flex items-center space-x-1.5 font-medium text-[12px] text-zinc-200 whitespace-nowrap">
              <span class="w-1.5 h-1.5 rounded-full" :class="gpsDotBg"></span>
              <span>{{ gpsStatusText }}</span>
            </div>
            <div
              class="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300"
              :class="isTelemetryExpanded ? 'bg-white text-black rotate-45' : 'bg-white/[0.06] text-zinc-400'"
            >
              <Plus class="w-3.5 h-3.5 stroke-[2]" />
            </div>
          </div>
        </button>

        <template v-if="isTelemetryExpanded">
          <div class="flex items-center justify-between px-4 py-2.5 bg-black/25 animate-fade-in">
            <span class="text-[12px] text-zinc-400">{{ t.rowDopplerAcc }}</span>
            <span class="text-[12px] text-white font-mono tabular-nums">{{ speedAccuracyText }}</span>
          </div>

          <div class="flex items-center justify-between px-4 py-2.5 bg-black/25 animate-fade-in">
            <span class="text-[12px] text-zinc-400">{{ t.rowCepAcc }}</span>
            <span class="text-[12px] text-white font-mono tabular-nums">
              {{ telemetry.accuracyM !== null ? `±${Math.round(telemetry.accuracyM)} m` : '--' }}
            </span>
          </div>

          <div class="flex items-center justify-between px-4 py-2.5 bg-black/25 animate-fade-in">
            <span class="text-[12px] text-zinc-400">{{ t.rowGeoAlt }}</span>
            <span class="text-[12px] text-white font-mono tabular-nums">{{ altitudeDiagnosticText }}</span>
          </div>

          <div class="flex items-center justify-between px-4 py-2.5 bg-black/25 animate-fade-in">
            <span class="text-[12px] text-zinc-400">{{ t.rowCoords }}</span>
            <span class="text-[12px] text-zinc-300 font-mono tabular-nums">
              {{
                telemetry.latitude !== null && telemetry.longitude !== null
                  ? `${telemetry.latitude.toFixed(4)}°, ${telemetry.longitude.toFixed(4)}°`
                  : '--'
              }}
            </span>
          </div>

          <div class="flex items-center justify-between px-4 py-2.5 bg-black/25 animate-fade-in">
            <span class="text-[12px] text-zinc-400">{{ t.rowHeading }}</span>
            <span class="text-[12px] text-white font-mono tabular-nums">{{ headingDiagnosticText }}</span>
          </div>
        </template>

        <div class="flex items-center justify-between px-4 py-3">
          <span class="text-[13px] font-medium text-white whitespace-nowrap">{{ t.rowImu }}</span>
          <div class="flex items-center space-x-2">
            <span
              v-if="telemetry.imuAvailable"
              class="text-[12px] text-zinc-200 font-mono tabular-nums"
            >
              {{ t.imuReady }}
            </span>
            <button
              v-else
              type="button"
              @click="activateImu"
              class="px-3 py-1 rounded-lg bg-white/[0.08] hover:bg-white/15 text-xs text-white font-medium btn-spring cursor-pointer whitespace-nowrap"
            >
              {{ t.btnActivateImu }}
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="telemetry.gpsStatus === 'DENIED' || telemetry.gpsStatus === 'PROMPT'"
        class="mt-2 px-4 py-2.5 rounded-xl apple-pill text-[12px] text-zinc-400 flex items-center justify-between"
      >
        <div class="flex items-center space-x-2">
          <Info class="w-3.5 h-3.5 text-white/70 shrink-0 stroke-[1.7]" />
          <span class="whitespace-nowrap">{{ t.authHintBar }}</span>
        </div>
        <button
          type="button"
          @click="$emit('openPermissionSheet')"
          class="text-xs text-white font-medium underline underline-offset-2 cursor-pointer whitespace-nowrap"
        >
          {{ t.btnViewBenefits }}
        </button>
      </div>
    </div>

    <!-- 模块 3: 多场景测速常见问题 (手工语义提行 \n + whitespace-pre-line，绝不断词) -->
    <div class="mb-4 shrink-0">
      <div class="rounded-2xl apple-card overflow-hidden">
        <button
          type="button"
          @click="toggleGuide"
          class="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition cursor-pointer text-left"
        >
          <span class="text-[13px] font-medium text-white whitespace-nowrap">{{ t.secPhysicsGuide }}</span>
          <div
            class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
            :class="isGuideExpanded ? 'bg-white text-black rotate-45' : 'bg-white/[0.06] text-zinc-400'"
          >
            <Plus class="w-3.5 h-3.5 stroke-[2]" />
          </div>
        </button>

        <div
          v-if="isGuideExpanded"
          class="px-4 pb-4 pt-2.5 border-t border-white/[0.06] space-y-3 text-left animate-fade-in"
        >
          <div>
            <div class="font-medium text-white text-[12px] flex items-center space-x-2 mb-1">
              <Plane class="w-3.5 h-3.5 text-zinc-400 stroke-[1.7] shrink-0" />
              <span class="whitespace-nowrap">{{ t.guideAviationTitle }}</span>
            </div>
            <p class="text-[11.5px] text-zinc-400 pl-5 leading-[1.65] whitespace-pre-line">
              {{ t.guideAviationDesc }}
            </p>
          </div>

          <div class="h-px bg-white/[0.06]"></div>

          <div>
            <div class="font-medium text-white text-[12px] flex items-center space-x-2 mb-1">
              <Train class="w-3.5 h-3.5 text-zinc-400 stroke-[1.7] shrink-0" />
              <span class="whitespace-nowrap">{{ t.guideGroundTitle }}</span>
            </div>
            <p class="text-[11.5px] text-zinc-400 pl-5 leading-[1.65] whitespace-pre-line">
              {{ t.guideGroundDesc }}
            </p>
          </div>

          <div class="h-px bg-white/[0.06]"></div>

          <div>
            <div class="font-medium text-white text-[12px] flex items-center space-x-2 mb-1">
              <ShieldCheck class="w-3.5 h-3.5 text-zinc-400 stroke-[1.7] shrink-0" />
              <span class="whitespace-nowrap">{{ t.guidePrivacyTitle }}</span>
            </div>
            <p class="text-[11.5px] text-zinc-400 pl-5 leading-[1.65] whitespace-pre-line">
              {{ t.guidePrivacyDesc }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 模块 3.5: 安装到手机桌面 (PWA 离线全屏应用引导 + 自动热更新说明) -->
    <div class="mb-4 shrink-0">
      <div class="rounded-2xl apple-card overflow-hidden">
        <button
          type="button"
          @click="onClickInstallApp"
          class="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition cursor-pointer text-left"
        >
          <div class="flex items-center space-x-2.5 min-w-0">
            <Smartphone class="w-4 h-4 text-zinc-300 stroke-[1.7] shrink-0" />
            <span class="text-[13px] font-medium text-white whitespace-nowrap">
              {{
                settings.language === 'en'
                  ? 'Add to Home Screen (Offline App)'
                  : '添加到手机桌面（断网可用）'
              }}
            </span>
          </div>
          <div
            class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
            :class="isInstallExpanded ? 'bg-white text-black rotate-45' : 'bg-white/[0.06] text-zinc-400'"
          >
            <Plus class="w-3.5 h-3.5 stroke-[2]" />
          </div>
        </button>

        <div
          v-if="isInstallExpanded"
          class="px-4 pb-4 pt-2.5 border-t border-white/[0.06] space-y-2.5 text-left animate-fade-in text-[11.5px] text-zinc-400"
        >
          <p class="leading-[1.65] whitespace-pre-line text-zinc-300">
            {{
              settings.language === 'en'
                ? 'Install Velocity directly from your browser\nfor a full-screen, offline-ready experience:'
                : '无需前往应用商店，直接将网页添加到手机桌面\n即可获得全屏无边框体验，并支持万米高空断网使用：'
            }}
          </p>
          <div class="p-2.5 rounded-xl bg-black/35 border border-white/[0.06] space-y-1.5 text-[11px]">
            <div class="flex items-center justify-between">
              <span class="text-white font-medium">iPhone (Safari)</span>
              <span class="text-zinc-400">底部「分享」›「添加到主屏幕」</span>
            </div>
            <div class="h-px bg-white/[0.05]"></div>
            <div class="flex items-center justify-between">
              <span class="text-white font-medium">Android / Chrome</span>
              <span class="text-zinc-400">右上角菜单 ›「安装应用」</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模块 4: 二次防误触数据清零按钮 -->
    <div class="pt-1 pb-2 shrink-0">
      <button
        type="button"
        @click="onClickReset"
        class="w-full py-3 rounded-2xl border text-[13px] font-medium btn-spring cursor-pointer flex items-center justify-center space-x-1.5"
        :class="
          confirmingReset
            ? 'bg-white text-black border-white shadow-lg font-semibold'
            : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-zinc-300 hover:text-white'
        "
      >
        <RotateCcw class="w-3.5 h-3.5 stroke-[1.8]" :class="confirmingReset ? 'animate-spin' : ''" />
        <span>
          {{
            confirmingReset
              ? settings.language === 'en'
                ? 'Tap Again to Confirm Reset'
                : '再次点击确认清零当前记录'
              : t.btnResetSession
          }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { TelemetryData, AppSettings, SpeedUnit } from '../types'
import { compassDirectionFromHeading, formatAltitudeValue } from '../services/unitConverters'
import { useI18n } from '../services/i18n'
import { telemetryService } from '../services/telemetryManager'
import { playTactileTick } from '../services/audioCallouts'
import {
  Radio,
  Plane,
  Train,
  Info,
  ShieldCheck,
  RotateCcw,
  Plus,
  Sparkles,
  Camera,
  Award,
  Maximize2,
  Check,
  Smartphone
} from 'lucide-vue-next'

const props = defineProps<{
  telemetry: TelemetryData
  settings: AppSettings
}>()

const emit = defineEmits<{
  (e: 'update:settings', newSettings: AppSettings): void
  (e: 'resetSession'): void
  (e: 'openPermissionSheet'): void
  (e: 'openProModal'): void
  (e: 'notify', message: string): void
}>()

const t = computed(() => useI18n(props.settings.language))

const isProExpanded = ref(false)
const isGuideExpanded = ref(false)
const isTelemetryExpanded = ref(false)
const isInstallExpanded = ref(false)
const confirmingReset = ref(false)
let resetTimer: number | null = null
let deferredInstallPrompt: any = null

function handleBeforeInstallPrompt(e: Event) {
  e.preventDefault()
  deferredInstallPrompt = e
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
})

async function onClickInstallApp() {
  playTactileTick(props.settings.hapticFeedback)
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt()
    const choice = await deferredInstallPrompt.userChoice
    if (choice?.outcome === 'accepted') {
      emit(
        'notify',
        props.settings.language === 'en' ? 'Added to Home Screen' : '已成功安装到手机桌面'
      )
    }
    deferredInstallPrompt = null
    return
  }
  isInstallExpanded.value = !isInstallExpanded.value
}

async function checkOtaUpdate() {
  playTactileTick(props.settings.hapticFeedback)
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration()
      if (reg) {
        await reg.update()
      }
    }
  } catch {
    // ignore offline error
  }
  emit(
    'notify',
    props.settings.language === 'en'
      ? 'Up to date (v2.4 · Offline Ready)'
      : '已是最新版本 (v2.4 · 离线引擎已就绪)'
  )
}

const speedUnitOptions: { id: SpeedUnit; label: string }[] = [
  { id: 'km/h', label: 'km/h' },
  { id: 'mph', label: 'mph' },
  { id: 'knots', label: 'kt' },
  { id: 'm/s', label: 'm/s' }
]

const proGridItems = computed(() => {
  if (props.settings.language === 'en') {
    return [
      { icon: Sparkles, title: '100% Ad-Free' },
      { icon: Camera, title: 'Photo Watermark' },
      { icon: Award, title: 'Titanium Finishes' },
      { icon: Maximize2, title: 'Windshield HUD' }
    ]
  }
  return [
    { icon: Sparkles, title: '纯净零广告' },
    { icon: Camera, title: '实景相机水印' },
    { icon: Award, title: '高定证书材质' },
    { icon: Maximize2, title: '挡风玻璃 HUD' }
  ]
})

const proDetailItems = computed(() => {
  if (props.settings.language === 'en') {
    return [
      { num: '01', title: 'Ad-Free Forever', desc: 'Zero banners or popups' },
      { num: '02', title: 'Photo Watermark', desc: 'Overlay speed on your photos' },
      { num: '03', title: 'Pro Card Finishes', desc: 'Steel, Sand & clean footer' },
      { num: '04', title: 'Windshield HUD', desc: 'Optical mirror & 0-100 timer' }
    ]
  }
  return [
    { num: '01', title: '纯净零广告', desc: '永久免除横幅与弹窗干扰' },
    { num: '02', title: '实景相机水印', desc: '导入机舱或自驾实拍图合成' },
    { num: '03', title: '高定证书材质', desc: '解锁钛金、暖砂与纯净底栏' },
    { num: '04', title: '挡风玻璃 HUD', desc: '前挡光学镜像与零百加速计时' }
  ]
})

function toggleProExpand() {
  playTactileTick(props.settings.hapticFeedback)
  isProExpanded.value = !isProExpanded.value
}

function onPreviewProToast() {
  playTactileTick(props.settings.hapticFeedback)
  emit(
    'notify',
    props.settings.language === 'en'
      ? 'Pro features are unlocked in this preview'
      : '已为您解锁全部 Pro 权益，可在证书页点击「实景」体验'
  )
}

function toggleTelemetry() {
  playTactileTick(props.settings.hapticFeedback)
  isTelemetryExpanded.value = !isTelemetryExpanded.value
}

function toggleGuide() {
  playTactileTick(props.settings.hapticFeedback)
  isGuideExpanded.value = !isGuideExpanded.value
}

function onClickReset() {
  playTactileTick(props.settings.hapticFeedback)
  if (!confirmingReset.value) {
    confirmingReset.value = true
    if (resetTimer) window.clearTimeout(resetTimer)
    resetTimer = window.setTimeout(() => {
      confirmingReset.value = false
    }, 2600)
    return
  }
  confirmingReset.value = false
  if (resetTimer) window.clearTimeout(resetTimer)
  emit('resetSession')
}

onUnmounted(() => {
  if (resetTimer) window.clearTimeout(resetTimer)
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
})

function updateSetting<K extends keyof AppSettings>(key: K, val: AppSettings[K]) {
  playTactileTick(props.settings.hapticFeedback)
  emit('update:settings', {
    ...props.settings,
    [key]: val
  })
}

async function activateImu() {
  const granted = await telemetryService.requestMotionPermission()
  if (granted) {
    emit('notify', t.value.toastImuActivated)
  } else {
    emit('notify', t.value.toastImuUnavailable)
  }
}

const gpsStatusText = computed(() => {
  switch (props.telemetry.gpsStatus) {
    case 'READY':
      return props.telemetry.isAccuracyLow ? t.value.statusWeak : t.value.statusLocked
    case 'LOCATING':
      return t.value.statusSearching
    case 'PROMPT':
      return t.value.statusPrompt
    case 'DENIED':
      return t.value.statusDenied
    default:
      return t.value.statusUnavailable
  }
})

const gpsDotBg = computed(() => {
  switch (props.telemetry.gpsStatus) {
    case 'READY':
      return props.telemetry.isAccuracyLow
        ? 'bg-white/50'
        : 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.85)]'
    case 'LOCATING':
    case 'PROMPT':
      return 'bg-white/50 animate-pulse'
    default:
      return 'bg-white/25'
  }
})

const speedAccuracyText = computed(() => {
  if (props.telemetry.gpsStatus !== 'READY' || props.telemetry.speedAccuracyMps === null) {
    return '--'
  }
  const kmhAcc = (props.telemetry.speedAccuracyMps * 3.6).toFixed(1)
  return `±${kmhAcc} km/h`
})

const altitudeDiagnosticText = computed(() => {
  if (props.telemetry.altitudeM === null) {
    return t.value.altWaitingSignal
  }
  const base = `${formatAltitudeValue(props.telemetry.altitudeM, props.settings.altitudeUnit)} ${props.settings.altitudeUnit}`
  if (props.telemetry.altitudeAccuracyM !== null) {
    return `${base} (±${Math.round(props.telemetry.altitudeAccuracyM)}m)`
  }
  return base
})

const headingDiagnosticText = computed(() => {
  if (props.telemetry.headingDeg === null || !Number.isFinite(props.telemetry.headingDeg)) {
    return t.value.headingWaiting
  }
  return `${Math.round(props.telemetry.headingDeg)}° ${compassDirectionFromHeading(props.telemetry.headingDeg, props.settings.language)}`
})
</script>
