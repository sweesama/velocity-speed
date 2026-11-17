<template>
  <div
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md"
    @click.self="$emit('close')"
  >
    <div
      class="w-full max-w-sm bg-gradient-to-b from-[#18181d] to-[#0d0d11] border border-white/15 rounded-t-[32px] sm:rounded-[32px] p-6 text-white shadow-2xl relative flex flex-col items-center animate-fade-in font-sans"
    >
      <div class="w-10 h-1 bg-white/20 rounded-full mb-4 sm:hidden"></div>

      <button
        type="button"
        @click="$emit('close')"
        class="absolute top-5 right-5 p-1.5 rounded-full text-zinc-500 hover:text-white hover:bg-white/10 btn-spring cursor-pointer"
        aria-label="Close"
      >
        <X class="w-4 h-4" />
      </button>

      <!-- 顶部黑金内测徽章 (连点 5 次或输入 ADMIN888 可开启发码器) -->
      <div
        @click="onTapBadge"
        class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.07] border border-white/[0.14] mb-3 cursor-pointer select-none"
      >
        <span class="px-1.5 py-0.5 rounded bg-white text-black font-mono text-[9px] font-bold uppercase tracking-wider">
          FOUNDER
        </span>
        <span class="text-[11px] font-medium text-zinc-200 whitespace-nowrap">
          {{ lang === 'en' ? '100 Founding Beta Spots · Free' : '首批 100 席内测限免 · 原价 ¥18' }}
        </span>
      </div>

      <!-- 模式 A: 开发者内置发码器 (输入 ADMIN888 或连点顶部徽章 5 次触发) -->
      <template v-if="showAdminGenerator">
        <h3 class="text-lg font-semibold tracking-tight text-center whitespace-nowrap">
          一客一码 · 专属内测发码器
        </h3>
        <p class="text-[11.5px] text-zinc-400 text-center mt-1 leading-[1.6] whitespace-pre-line">
          每次生成 10 个独立加密序列号（共百万种组合）\n可直接复制发给小红书/社群内测用户，支持离线验证
        </p>

        <div class="w-full my-3 p-3 rounded-2xl bg-black/60 border border-white/10 font-mono text-[11px] text-zinc-200 grid grid-cols-2 gap-1.5">
          <div
            v-for="k in generatedKeys"
            :key="k"
            class="px-2 py-1 rounded bg-white/[0.04] text-center select-all"
          >
            {{ k }}
          </div>
        </div>

        <div class="w-full flex gap-2">
          <button
            type="button"
            @click="refreshBatchKeys"
            class="flex-1 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-xs font-medium text-white btn-spring cursor-pointer"
          >
            换一批新码
          </button>
          <button
            type="button"
            @click="copyBatchKeys"
            class="flex-1 py-2.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 btn-spring cursor-pointer"
          >
            {{ copiedBatch ? '已复制 10 个码 ✓' : '一键复制全部' }}
          </button>
        </div>

        <button
          type="button"
          @click="showAdminGenerator = false"
          class="mt-2.5 text-[11px] text-zinc-500 hover:text-zinc-300 cursor-pointer"
        >
          返回内测激活页
        </button>
      </template>

      <!-- 模式 B: 创始内测官尊享礼遇主界面 -->
      <template v-else>
        <h3 class="text-xl font-semibold tracking-tight text-center whitespace-nowrap">
          {{ lang === 'en' ? 'Founding Beta Pass' : 'Velocity 创始内测官礼遇' }}
        </h3>
        <p class="text-[12px] text-zinc-400 text-center mt-1.5 leading-[1.65] whitespace-pre-line">
          {{
            lang === 'en'
              ? 'Enter your Founding Beta invite code to unlock\nlifetime Pro features & Founder poster badge'
              : '凭内测邀请码免费解锁价值 ¥18 终身买断特权\n并获赠速度证书专属「FOUNDER」编号刻印'
          }}
        </p>

        <!-- 2x2 尊享权益矩阵 (严格单行，绝不断词) -->
        <div class="w-full grid grid-cols-2 gap-2 my-4">
          <div
            v-for="item in perks"
            :key="item.title"
            class="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center space-x-2"
          >
            <component :is="item.icon" class="w-3.5 h-3.5 text-white shrink-0 stroke-[1.8]" />
            <span class="text-[11.5px] font-medium text-zinc-200 whitespace-nowrap">{{ item.title }}</span>
          </div>
        </div>

        <!-- 激活码 / 内测码输入框 -->
        <div class="w-full space-y-2.5">
          <div class="flex items-center gap-2">
            <input
              v-model="inputCode"
              type="text"
              maxlength="20"
              :placeholder="lang === 'en' ? 'Invite code (e.g. BETA100 or VELO-...)' : '输入内测邀请码 (如 BETA100)'"
              @keyup.enter="handleRedeem"
              class="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white font-mono uppercase placeholder:font-sans placeholder:normal-case placeholder-zinc-500 focus:outline-none focus:border-white/40 transition"
            />
            <button
              type="button"
              @click="handleRedeem"
              class="px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 btn-spring cursor-pointer whitespace-nowrap shrink-0"
            >
              {{ lang === 'en' ? 'Activate' : '激活席位' }}
            </button>
          </div>

          <p v-if="errorMsg" class="text-[11px] text-zinc-300 text-center animate-fade-in">
            {{ errorMsg }}
          </p>

          <!-- 经过验证的增长飞轮按钮: 分享裂变解锁 (或凭社媒评论区暗号 BETA100 解锁) -->
          <button
            type="button"
            @click="shareToUnlock"
            class="w-full py-3 px-4 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.14] text-white font-medium text-xs btn-spring cursor-pointer flex items-center justify-center space-x-1.5 whitespace-nowrap"
          >
            <Share2 class="w-3.5 h-3.5 stroke-[1.8]" />
            <span>
              {{
                lang === 'en'
                  ? 'Share with a Friend to Unlock Free Pass'
                  : '分享给 1 位好友 · 立即免费解锁内测席位'
              }}
            </span>
          </button>

          <p class="text-[10.5px] text-zinc-500 text-center pt-0.5 whitespace-nowrap">
            {{
              lang === 'en'
                ? 'Or comment on our launch post to get an exclusive invite code'
                : '或在小红书/社媒首发帖评论区留言获取专属一客一码'
            }}
          </p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import confetti from 'canvas-confetti'
import type { AppLanguage } from '../types'
import { verifyProLicenseCode, generateBatchLicenseKeys } from '../services/proLicense'
import { playTactileTick } from '../services/audioCallouts'
import { X, Sparkles, Camera, Award, ShieldCheck, Share2 } from 'lucide-vue-next'

const props = defineProps<{
  lang: AppLanguage
  currentCode?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'unlocked', code: string): void
}>()

const inputCode = ref(props.currentCode || '')
const errorMsg = ref('')
const showAdminGenerator = ref(false)
const generatedKeys = ref<string[]>(generateBatchLicenseKeys(10))
const copiedBatch = ref(false)
let badgeTapCount = 0

function onTapBadge() {
  badgeTapCount++
  if (badgeTapCount >= 5) {
    badgeTapCount = 0
    showAdminGenerator.value = !showAdminGenerator.value
  }
}

function refreshBatchKeys() {
  playTactileTick(true)
  generatedKeys.value = generateBatchLicenseKeys(10)
  copiedBatch.value = false
}

async function copyBatchKeys() {
  playTactileTick(true)
  try {
    await navigator.clipboard.writeText(generatedKeys.value.join('\n'))
    copiedBatch.value = true
  } catch {
    copiedBatch.value = true
  }
}

const perks = computed(() => {
  if (props.lang === 'en') {
    return [
      { icon: Award, title: 'FOUNDER Card Badge' },
      { icon: Camera, title: 'Photo Watermark' },
      { icon: Sparkles, title: 'Titanium Finishes' },
      { icon: ShieldCheck, title: 'Lifetime Ad-Free' }
    ]
  }
  return [
    { icon: Award, title: 'FOUNDER 证书刻印' },
    { icon: Camera, title: '实景相机水印' },
    { icon: Sparkles, title: '钛金与暖砂材质' },
    { icon: ShieldCheck, title: '终身纯净零广告' }
  ]
})

function fireLuxuryConfetti() {
  try {
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#ffffff', '#d4d4d8', '#d6c7b2']
    })
  } catch {
    // ignore confetti error
  }
}

function handleRedeem() {
  playTactileTick(true)
  const res = verifyProLicenseCode(inputCode.value)
  if (res.isAdminTrigger) {
    showAdminGenerator.value = true
    errorMsg.value = ''
    return
  }
  if (!res.valid) {
    errorMsg.value =
      props.lang === 'en'
        ? 'Invalid code. Share below or use code from our launch post.'
        : '邀请码无效，可点击下方分享给好友立即免费解锁'
    return
  }
  errorMsg.value = ''
  fireLuxuryConfetti()
  emit('unlocked', `${res.normalizedCode} · ${res.founderNumber}`)
}

async function shareToUnlock() {
  playTactileTick(true)
  const shareUrl = window.location.origin || 'https://velocity-speed.pages.dev'
  const shareTitle = 'Velocity — 极简实时测速与万米高空海拔仪'
  const shareText =
    props.lang === 'en'
      ? `Check out Velocity — a minimalist GPS speedometer & altimeter that works offline in Airplane Mode: ${shareUrl}`
      : `发现一个超酷的徕卡风实时测速与万米海拔仪 Velocity，坐飞机开飞行模式也能测出 900km/h，还能生成实景测速证书：${shareUrl}`

  try {
    if (navigator.share) {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl
      })
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText)
    }
  } catch {
    // 用户取消系统分享面板时也允许复制口令解锁
    try {
      await navigator.clipboard?.writeText(shareText)
    } catch {
      // ignore
    }
  }

  const res = verifyProLicenseCode('FOUNDER')
  errorMsg.value = ''
  fireLuxuryConfetti()
  emit('unlocked', `SHARED · ${res.founderNumber}`)
}
</script>
