<template>
  <div class="min-h-screen h-dvh-screen bg-[#070709] text-white flex flex-col justify-center items-center overflow-hidden selection:bg-white selection:text-black font-sans">
    <!-- 电脑端展示与双语/多机型/宣传图快捷控制栏 (仅在宽屏桌面浏览器显示，真机自动隐藏) -->
    <div class="hidden md:flex fixed top-3 right-4 z-50 items-center space-x-1.5 bg-[#16161a]/90 backdrop-blur-xl border border-white/10 px-2.5 py-1.5 rounded-full text-xs text-zinc-400 shadow-lg">
      <!-- 1. 宣传物料工坊入口 -->
      <button
        type="button"
        @click="showPromoStudio = true"
        class="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white text-black font-semibold text-[11px] hover:bg-zinc-200 btn-spring cursor-pointer whitespace-nowrap"
      >
        <Sparkles class="w-3 h-3 stroke-[2.2]" />
        <span>{{ settings.language === 'zh' ? '宣传图工坊' : 'Promo Kit' }}</span>
      </button>

      <span class="text-white/15">|</span>

      <!-- 2. 主流手机机型尺寸适配预览切换 (iPhone 16 Pro / 小屏 SE / Android 旗舰 / 全屏) -->
      <button
        type="button"
        @click="cycleDevicePreset"
        class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white/[0.07] hover:bg-white/15 text-white font-medium text-[11px] btn-spring cursor-pointer whitespace-nowrap"
      >
        <component :is="settings.showDeviceFrame ? Smartphone : Monitor" class="w-3.5 h-3.5" />
        <span>{{ currentDevicePresetLabel }}</span>
      </button>

      <span class="text-white/15">|</span>

      <!-- 3. 中英双语一键切换 -->
      <button
        type="button"
        @click="toggleLanguage"
        class="px-2.5 py-1 rounded-full bg-white/[0.07] hover:bg-white/15 text-white font-mono text-[11px] font-medium btn-spring cursor-pointer whitespace-nowrap"
      >
        {{ settings.language === 'zh' ? 'EN / 中文' : '中文 / EN' }}
      </button>
    </div>

    <!-- 主容器: 真机采用 100dvh 动态视口高度完美避开浏览器底栏，桌面支持多主流机型尺寸实时预览 -->
    <div
      class="w-full flex flex-col justify-between transition-all duration-300 relative bg-black overflow-hidden"
      :class="deviceContainerClass"
    >
      <!-- iOS 模拟状态栏 (仅在桌面端开启 iPhone 样机框时渲染，真机上绝不重复显示假状态栏) -->
      <IosStatusBar v-if="settings.showDeviceFrame" class="hidden md:flex shrink-0" :showDynamicIsland="true" />
      <div v-else class="h-1 md:hidden shrink-0"></div>

      <!-- 全局轻量胶囊提示 (Apple HIG Toast) -->
      <Transition name="toast">
        <div
          v-if="toastMessage"
          class="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-white/95 text-black text-xs font-medium shadow-xl whitespace-nowrap pointer-events-none flex items-center space-x-1.5"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-black"></span>
          <span>{{ toastMessage }}</span>
        </div>
      </Transition>

      <!-- 核心页面视图切换 (min-h-0 确保子页面 100% 撑满剩余高度且不产生多余黑边) -->
      <div class="flex-1 min-h-0 flex flex-col overflow-y-auto no-scrollbar relative z-10">
        <Transition name="page" mode="out-in">
          <!-- Tab 1: 实时仪表盘 -->
          <SpeedDashboard
            v-if="currentTab === 'dashboard'"
            key="dashboard"
            :telemetry="telemetry"
            :stats="sessionStats"
            :settings="settings"
            @update:settings="updateSettings"
            @openHud="isHudActive = true"
            @requestPermission="showPermissionModal = true"
            @toggleRecording="handleToggleRecording"
            @resetSession="resetCurrentSession"
          />

          <!-- Tab 2: 测速认证证书 -->
          <ReportsView
            v-else-if="currentTab === 'reports'"
            key="reports"
            :telemetry="telemetry"
            :stats="sessionStats"
            :history="sessionHistory"
            :settings="settings"
            @resetSession="resetCurrentSession"
            @notify="showToast"
            @openProModal="showProModal = true"
          />

          <!-- Tab 3: 控制中心与硬件诊断 -->
          <SettingsView
            v-else-if="currentTab === 'settings'"
            key="settings"
            :telemetry="telemetry"
            :settings="settings"
            @update:settings="updateSettings"
            @resetSession="resetCurrentSession"
            @openPermissionSheet="showPermissionModal = true"
            @openProModal="showProModal = true"
            @notify="showToast"
          />
        </Transition>
      </div>

      <!-- 底部 iOS 毛玻璃 Tab Bar -->
      <TabBar
        :currentTab="currentTab"
        :lang="settings.language"
        @update:currentTab="onSwitchTab"
      />
    </div>

    <!-- 权限与受益说明半屏引导 -->
    <Transition name="modal">
      <PermissionSheet
        v-if="showPermissionModal || (telemetry.gpsStatus === 'PROMPT' && !promptDismissed)"
        :gpsStatus="telemetry.gpsStatus"
        :lang="settings.language"
        @dismiss="dismissPermissionModal"
      />
    </Transition>

    <!-- Pro 终身通行证 / 早鸟激活码兑换弹窗 -->
    <Transition name="modal">
      <ProPassModal
        v-if="showProModal"
        :lang="settings.language"
        :currentCode="settings.proLicenseCode"
        @close="showProModal = false"
        @unlocked="handleProUnlocked"
        @openPromoStudio="showProModal = false; showPromoStudio = true"
      />
    </Transition>

    <!-- 小红书 / 社媒 3:4 爆款宣传图与文案工坊 -->
    <Transition name="modal">
      <PromoStudioModal
        v-if="showPromoStudio"
        @close="showPromoStudio = false"
      />
    </Transition>

    <!-- 全屏 HUD 舷窗/前挡玻璃反光投影模式 -->
    <Transition name="modal">
      <HudMode
        v-if="isHudActive"
        :telemetry="telemetry"
        :stats="sessionStats"
        :settings="settings"
        @close="isHudActive = false"
        @update:settings="updateSettings"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import type { TelemetryData, SessionStats, SessionHistoryItem, AppSettings, AppTab, AppLanguage } from './types'
import { telemetryService } from './services/telemetryManager'
import { useI18n } from './services/i18n'
import { verifyProLicenseCode } from './services/proLicense'
import { playTactileTick } from './services/audioCallouts'
import SpeedDashboard from './components/SpeedDashboard.vue'
import ReportsView from './components/ReportsView.vue'
import SettingsView from './components/SettingsView.vue'
import TabBar from './components/TabBar.vue'
import HudMode from './components/HudMode.vue'
import IosStatusBar from './components/IosStatusBar.vue'
import PermissionSheet from './components/PermissionSheet.vue'
import ProPassModal from './components/ProPassModal.vue'
import PromoStudioModal from './components/PromoStudioModal.vue'
import { Smartphone, Monitor, Sparkles } from 'lucide-vue-next'

const currentTab = ref<AppTab>('dashboard')
const isHudActive = ref(false)
const showPermissionModal = ref(false)
const showProModal = ref(false)
const showPromoStudio = ref(false)
const promptDismissed = ref(false)
const toastMessage = ref<string | null>(null)
let toastTimer: number | null = null

type DevicePreset = 'iphone16' | 'iphonese' | 'android' | 'fullscreen'
const devicePreset = ref<DevicePreset>('iphone16')

function cycleDevicePreset() {
  playTactileTick(settings.hapticFeedback)
  const order: DevicePreset[] = ['iphone16', 'android', 'iphonese', 'fullscreen']
  const next = order[(order.indexOf(devicePreset.value) + 1) % order.length]
  devicePreset.value = next
  updateSettings({ showDeviceFrame: next !== 'fullscreen' })
}

const currentDevicePresetLabel = computed(() => {
  const isEn = settings.language === 'en'
  switch (devicePreset.value) {
    case 'iphone16':
      return isEn ? 'iPhone 16 Pro' : 'iPhone 16 Pro'
    case 'android':
      return isEn ? 'Android Ultra' : '安卓旗舰屏'
    case 'iphonese':
      return isEn ? 'Compact SE' : '小屏紧凑机型'
    case 'fullscreen':
      return isEn ? 'Full Screen' : '全屏沉浸'
  }
})

const deviceContainerClass = computed(() => {
  if (!settings.showDeviceFrame || devicePreset.value === 'fullscreen') {
    return 'max-w-lg h-dvh-screen pt-2 safe-top'
  }
  const baseFrame =
    'max-w-md h-dvh-screen md:my-3 md:border-[10px] md:border-[#222226] md:shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.1)]'
  switch (devicePreset.value) {
    case 'iphonese':
      return `${baseFrame} md:max-w-[375px] md:h-[680px] md:rounded-[44px]`
    case 'android':
      return `${baseFrame} md:max-w-[412px] md:h-[880px] md:rounded-[38px]`
    case 'iphone16':
    default:
      return `${baseFrame} md:max-w-[400px] md:h-[844px] md:rounded-[52px]`
  }
})

function showToast(msg: string) {
  toastMessage.value = msg
  if (toastTimer) window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    toastMessage.value = null
  }, 2600)
}

function dismissPermissionModal() {
  showPermissionModal.value = false
  promptDismissed.value = true
}

const telemetry = reactive<TelemetryData>({
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
})

const sessionStats = reactive<SessionStats>({
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
})

const sessionHistory = ref<SessionHistoryItem[]>([])

const SETTINGS_KEY = 'velocity_settings_v5'
const savedSettingsRaw =
  localStorage.getItem(SETTINGS_KEY) || localStorage.getItem('velocity_settings_v4')

function detectDefaultLanguage(): AppLanguage {
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
  }
  return 'zh'
}

const defaultSettings: AppSettings = {
  language: detectDefaultLanguage(),
  speedUnit: 'km/h',
  altitudeUnit: 'm',
  hudMirrored: true,
  hudTheme: 'white',
  keepScreenAwake: true,
  hapticFeedback: true,
  viewMode: 'minimal',
  showDeviceFrame: true,
  isProUnlocked: false,
  proLicenseCode: ''
}

let parsedSettings: Partial<AppSettings> = {}
if (savedSettingsRaw) {
  try {
    parsedSettings = JSON.parse(savedSettingsRaw)
  } catch {
    parsedSettings = {}
  }
}

const settings = reactive<AppSettings>({
  ...defaultSettings,
  ...parsedSettings
})

const t = computed(() => useI18n(settings.language))

function syncSettingsToEngine() {
  telemetryService.setKeepScreenAwake(settings.keepScreenAwake)
  telemetryService.hapticFeedbackEnabled = settings.hapticFeedback
}

function updateSettings(newSettings: Partial<AppSettings> | AppSettings) {
  Object.assign(settings, newSettings)
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  syncSettingsToEngine()
}

function toggleLanguage() {
  playTactileTick(settings.hapticFeedback)
  const next: AppLanguage = settings.language === 'zh' ? 'en' : 'zh'
  updateSettings({ language: next })
}

function onSwitchTab(tab: AppTab) {
  playTactileTick(settings.hapticFeedback)
  currentTab.value = tab
}

function handleToggleRecording() {
  const isRec = telemetryService.toggleRecording()
  showToast(isRec ? t.value.toastResumed : t.value.toastPaused)
}

function resetCurrentSession() {
  telemetryService.resetSession(true)
  showToast(t.value.toastReset)
}

function handleProUnlocked(code: string) {
  updateSettings({ isProUnlocked: true, proLicenseCode: code })
  showProModal.value = false
  showToast(
    settings.language === 'en'
      ? `Velocity Pro Unlocked (${code})`
      : `已成功激活 Velocity Pro (${code})`
  )
}

let unsubscribe: (() => void) | null = null

onMounted(() => {
  syncSettingsToEngine()
  // 支持通过分享专属早鸟链接 (?code=EARLY2026) 自动激活会员
  try {
    const params = new URLSearchParams(window.location.search)
    const urlCode = params.get('code') || params.get('vip')
    if (urlCode && !settings.isProUnlocked) {
      const check = verifyProLicenseCode(urlCode)
      if (check.valid) {
        updateSettings({ isProUnlocked: true, proLicenseCode: check.normalizedCode })
        showToast(
          settings.language === 'en'
            ? `Early-Bird Pro Activated (${check.normalizedCode})`
            : `已通过专属链接自动激活 Pro (${check.normalizedCode})`
        )
      }
    }
  } catch {
    // ignore URL parse error
  }

  unsubscribe = telemetryService.subscribe((newTelem, newStats, newHistory) => {
    Object.assign(telemetry, newTelem)
    Object.assign(sessionStats, newStats)
    sessionHistory.value = newHistory
  })
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
  if (toastTimer) {
    window.clearTimeout(toastTimer)
  }
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px) scale(0.95);
}
</style>
