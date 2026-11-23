<template>
  <div
    class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto"
    @click.self="$emit('close')"
  >
    <div
      class="w-full max-w-3xl bg-[#111115] border border-white/15 rounded-[28px] p-5 sm:p-6 text-white shadow-2xl flex flex-col animate-fade-in font-sans my-auto"
    >
      <!-- 顶部标题栏 -->
      <div class="flex items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
        <div>
          <div class="flex items-center space-x-2">
            <span class="px-2 py-0.5 rounded bg-white text-black font-mono text-[10px] font-bold uppercase tracking-wider">
              STUDIO
            </span>
            <h3 class="text-base sm:text-lg font-semibold tracking-tight">
              小红书 / App Store 19.5:9 真机界面宣传图工坊
            </h3>
          </div>
          <p class="text-xs text-zinc-400 mt-1">
            严格按照 iPhone 16 Pro 真实 19.5:9 修长比例，1:1 还原产品真实界面（含底部导航栏与全套控件）
          </p>
        </div>

        <button
          type="button"
          @click="$emit('close')"
          class="p-2 rounded-full bg-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/15 btn-spring cursor-pointer shrink-0"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- 主体区: 左侧 3:4 画册预览 + 右侧切换与去人机味文案 -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-5 pt-4 items-start">
        <!-- 左侧 3:4 海报高清实时渲染预览 (7列) -->
        <div class="md:col-span-7 flex flex-col items-center">
          <div class="w-full max-w-[330px] aspect-[3/4] rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl relative">
            <img
              v-if="previewDataUrl"
              :src="previewDataUrl"
              alt="Promo Poster Preview"
              class="w-full h-full object-contain select-auto"
            />
          </div>
          <span class="text-[11px] text-zinc-500 mt-2">
            1242 × 1656 px (3:4 小红书画册比例 · 手机可直接长按图片存相册)
          </span>
        </div>

        <!-- 右侧控制面板与真人语气文案 (5列) -->
        <div class="md:col-span-5 flex flex-col justify-between space-y-4">
          <!-- 4 张真机宣传图切换 -->
          <div>
            <div class="text-xs font-medium text-zinc-400 mb-2">选择真机宣传图（共 4 张）：</div>
            <div class="space-y-1.5">
              <button
                v-for="(slide, idx) in slides"
                :key="slide.id"
                type="button"
                @click="selectSlide(idx)"
                class="w-full px-3.5 py-2.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer btn-spring"
                :class="
                  activeSlide === idx
                    ? 'bg-white text-black border-white font-semibold shadow-md'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-zinc-200'
                "
              >
                <span class="text-xs truncate">{{ slide.name }}</span>
                <span
                  class="text-[10px] font-mono px-1.5 py-0.5 rounded"
                  :class="activeSlide === idx ? 'bg-black/10 text-black' : 'bg-white/10 text-zinc-400'"
                >
                  0{{ idx + 1 }}
                </span>
              </button>
            </div>
          </div>

          <!-- 下载操作按钮 -->
          <div class="space-y-2">
            <button
              type="button"
              @click="downloadCurrentSlide"
              class="w-full py-2.5 px-4 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 btn-spring cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Download class="w-3.5 h-3.5 stroke-[2.2]" />
              <span>下载当前真机宣传图 (0{{ activeSlide + 1 }})</span>
            </button>

            <button
              type="button"
              @click="downloadAllSlides"
              :disabled="isDownloadingAll"
              class="w-full py-2.5 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white font-medium text-xs btn-spring cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Sparkles class="w-3.5 h-3.5 stroke-[1.8]" />
              <span>{{ isDownloadingAll ? '正在依次导出 4 张套图...' : '一键导出全部 4 张套图' }}</span>
            </button>
          </div>

          <!-- 去“人机味”的真人叙事笔记文案 (支持两种真人语感切换) -->
          <div class="p-3.5 rounded-2xl bg-black/50 border border-white/[0.08] space-y-2.5">
            <div class="flex items-center justify-between gap-1">
              <div class="flex items-center space-x-1 bg-white/[0.06] p-0.5 rounded-lg text-[10.5px]">
                <button
                  type="button"
                  @click="copyTone = 'story'"
                  class="px-2 py-0.5 rounded-md transition cursor-pointer"
                  :class="copyTone === 'story' ? 'bg-white text-black font-semibold' : 'text-zinc-400'"
                >
                  真诚随笔风
                </button>
                <button
                  type="button"
                  @click="copyTone = 'minimal'"
                  class="px-2 py-0.5 rounded-md transition cursor-pointer"
                  :class="copyTone === 'minimal' ? 'bg-white text-black font-semibold' : 'text-zinc-400'"
                >
                  极简三句话
                </button>
              </div>

              <button
                type="button"
                @click="copyPostCopywriting"
                class="px-2.5 py-1 rounded-lg bg-white text-black text-[11px] font-semibold hover:bg-zinc-200 btn-spring cursor-pointer whitespace-nowrap"
              >
                {{ copiedText ? '已复制 ✓' : '复制文案' }}
              </button>
            </div>
            <div class="text-[11px] text-zinc-300 leading-relaxed max-h-32 overflow-y-auto pr-1 whitespace-pre-line select-all">
              {{ activeCopywriting }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Download, Sparkles, X } from 'lucide-vue-next'
import { playTactileTick } from '../services/audioCallouts'

defineEmits<{
  (e: 'close'): void
}>()

const activeSlide = ref(0)
const previewDataUrl = ref<string>('')
const isDownloadingAll = ref(false)
const copiedText = ref(false)
const copyTone = ref<'story' | 'minimal'>('story')

const slides = [
  { id: 'dual', name: '01 · 双机全景：实时测速页 + 万米高空证书页' },
  { id: 'dial', name: '02 · 表盘实机：瑞士 60 刻度计时罗盘界面' },
  { id: 'hud', name: '03 · 投影实机：夜间前挡光学白 HUD 界面' },
  { id: 'settings', name: '04 · 内测实机：设置页与 FOUNDER 创始通行证' }
]

const copyTemplates = {
  story: `做了一个很安静的测速仪，留给坐飞机喜欢看窗外的人

每次坐飞机选靠窗的位置，看着云层往后退，总会好奇现在到底飞了多快、在多少米的高空。

以前下过几个测速软件，点开全是花里胡哨的汽配城表盘和关不掉的弹窗广告。后来干脆趁周末自己写了一个。

没有做任何多余的颜色，只留了纯黑底色和白字。
哪怕在万米高空开着飞行模式，把手机靠在舷窗边，它也能静静地跳出 885 km/h 和一万米的海拔。

顺手还加了个「速度卡片」的小功能：
可以把你在飞机上、高铁上、或者傍晚散步时随手拍的照片垫在底下，配上一句不那么正经的旁白，存成一张很干净的卡片。

刚写完第一版，准备留 100 个长期免费的「创始内测席位」。
如果你也常在路上，或者单纯喜欢这种克制的小工具，在下面留个言，我把内测码发给你。

#独立开发 #App分享 #极简主义 #飞机靠窗 #高铁测速 #小众App #工业设计`,

  minimal: `周末写了一个没有颜色的测速仪：Velocity

只有黑白两色，不用注册登录，也不会上传任何位置轨迹。
坐飞机开着飞行模式贴近舷窗，能直接测出 885 km/h 的巡航速度和一万米海拔；平时坐高铁、夜里开车或傍晚散步也能用。

支持把旅途里随手拍的风景垫在卡片底下，存成一张带速度印记的明信片。

刚上线，留了 100 个永久免费的「FOUNDER 创始内测码」。
需要的朋友在评论区留个言，我私信发你。

#独立开发者 #极简App #小众宝藏App #实用工具 #审美积累`
}

const activeCopywriting = computed(() => copyTemplates[copyTone.value])

function drawRoundRect(
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

/**
 * 严格按 iPhone 16 Pro 真实 19.5:9 修长比例 (如 520x1118) 绘制 3D 拉丝钛金属外壳与真实状态栏
 * 绝不出现类似 iPad Mini 的宽胖失真比例
 */
function drawSlenderIphoneShell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const s = w / 520 // 基于 520x1118 标准 19.5:9 尺寸的缩放系数
  const outerPad = Math.round(14 * s)
  const bezelPad = Math.round(7 * s)
  const outerR = Math.round(78 * s)
  const screenR = Math.round(66 * s)

  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.92)'
  ctx.shadowBlur = Math.round(85 * s)
  ctx.shadowOffsetY = Math.round(30 * s)
  drawRoundRect(ctx, x - outerPad, y - outerPad, w + outerPad * 2, h + outerPad * 2, outerR)
  ctx.fillStyle = '#09090c'
  ctx.fill()
  ctx.restore()

  // 侧面物理按键 (按 19.5:9 真实机身位置)
  ctx.fillStyle = '#3f3f4a'
  drawRoundRect(ctx, x - outerPad - 3 * s, y + 150 * s, 3 * s, 36 * s, 1.5 * s)
  ctx.fill()
  drawRoundRect(ctx, x - outerPad - 3 * s, y + 215 * s, 3 * s, 72 * s, 1.5 * s)
  ctx.fill()
  drawRoundRect(ctx, x - outerPad - 3 * s, y + 302 * s, 3 * s, 72 * s, 1.5 * s)
  ctx.fill()
  drawRoundRect(ctx, x + w + outerPad, y + 240 * s, 3 * s, 105 * s, 1.5 * s)
  ctx.fill()

  // 拉丝钛金属中框渐变
  const metalGrad = ctx.createLinearGradient(x - outerPad, y - outerPad, x + w + outerPad, y + h + outerPad)
  metalGrad.addColorStop(0, '#5a5a66')
  metalGrad.addColorStop(0.2, '#27272f')
  metalGrad.addColorStop(0.5, '#454552')
  metalGrad.addColorStop(0.8, '#1a1a20')
  metalGrad.addColorStop(1, '#484854')

  drawRoundRect(ctx, x - outerPad, y - outerPad, w + outerPad * 2, h + outerPad * 2, outerR)
  ctx.fillStyle = metalGrad
  ctx.fill()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.36)'
  ctx.lineWidth = Math.max(1.5, 2 * s)
  ctx.stroke()

  // 内层极窄玻璃黑边
  drawRoundRect(ctx, x - bezelPad, y - bezelPad, w + bezelPad * 2, h + bezelPad * 2, screenR + 5 * s)
  ctx.fillStyle = '#020203'
  ctx.fill()

  // 屏幕纯黑基底
  drawRoundRect(ctx, x, y, w, h, screenR)
  ctx.fillStyle = '#000000'
  ctx.fill()

  // 顶部灵动岛 (Dynamic Island) 与 iOS 状态栏
  const diW = Math.round(138 * s)
  const diH = Math.round(34 * s)
  drawRoundRect(ctx, x + (w - diW) / 2, y + 18 * s, diW, diH, diH / 2)
  ctx.fillStyle = '#000000'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 1.2 * s
  ctx.stroke()

  // 灵动岛内摄像头微光
  ctx.beginPath()
  ctx.arc(x + (w + diW) / 2 - 20 * s, y + 35 * s, 5.5 * s, 0, Math.PI * 2)
  ctx.fillStyle = '#121521'
  ctx.fill()

  // 状态栏 09:41 与信号/电池
  ctx.textAlign = 'left'
  ctx.fillStyle = '#ffffff'
  ctx.font = `600 ${Math.round(17 * s)}px "Inter", -apple-system, sans-serif`
  ctx.fillText('09:41', x + 38 * s, y + 41 * s)

  const bx = x + w - 68 * s
  const by = y + 27 * s
  for (let i = 0; i < 4; i++) {
    const bh = (6 + i * 2.5) * s
    drawRoundRect(ctx, bx - (30 - i * 6) * s, by + 13 * s - bh, 3.5 * s, bh, 1 * s)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
  }
  drawRoundRect(ctx, bx, by + 1 * s, 28 * s, 13 * s, 3.5 * s)
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'
  ctx.lineWidth = 1.4 * s
  ctx.stroke()
  drawRoundRect(ctx, bx + 2.5 * s, by + 3.5 * s, 20 * s, 8 * s, 2 * s)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
}

/**
 * 绘制产品真实的底部 iOS TabBar (测速 | 证书 | 设置) + 顶部发光指示横条 + Home 白条 + 屏幕玻璃斜向光泽
 */
function drawAuthenticBottomTabBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  activeTab: 'dashboard' | 'reports' | 'settings'
) {
  const s = w / 520
  const screenR = Math.round(66 * s)
  const tabH = Math.round(92 * s)
  const tabY = y + h - tabH

  ctx.save()
  drawRoundRect(ctx, x, y, w, h, screenR)
  ctx.clip()

  // TabBar 毛玻璃基底
  ctx.fillStyle = '#0c0c0f'
  ctx.fillRect(x, tabY, w, tabH)
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 1.2 * s
  ctx.beginPath()
  ctx.moveTo(x, tabY)
  ctx.lineTo(x + w, tabY)
  ctx.stroke()

  const tabs = [
    { id: 'dashboard' as const, label: '测速', cx: x + w * 0.2 },
    { id: 'reports' as const, label: '证书', cx: x + w * 0.5 },
    { id: 'settings' as const, label: '设置', cx: x + w * 0.8 }
  ]

  tabs.forEach((t) => {
    const isAct = t.id === activeTab
    const iconY = tabY + 26 * s

    // 激活态顶部微光白条
    if (isAct) {
      drawRoundRect(ctx, t.cx - 12 * s, tabY + 7 * s, 24 * s, 3 * s, 1.5 * s)
      ctx.fillStyle = '#ffffff'
      ctx.fill()
    }

    ctx.strokeStyle = isAct ? '#ffffff' : 'rgba(255,255,255,0.38)'
    ctx.lineWidth = (isAct ? 2.2 : 1.7) * s
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (t.id === 'dashboard') {
      ctx.beginPath()
      ctx.arc(t.cx, iconY + 3 * s, 11 * s, Math.PI * 0.78, Math.PI * 2.22)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(t.cx, iconY + 3 * s)
      ctx.lineTo(t.cx + 6 * s, iconY - 3 * s)
      ctx.stroke()
    } else if (t.id === 'reports') {
      drawRoundRect(ctx, t.cx - 9 * s, iconY - 9 * s, 18 * s, 21 * s, 3 * s)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(t.cx - 5 * s, iconY + 3 * s)
      ctx.lineTo(t.cx - 1 * s, iconY - 1 * s)
      ctx.lineTo(t.cx + 2 * s, iconY + 1.5 * s)
      ctx.lineTo(t.cx + 6 * s, iconY - 3.5 * s)
      ctx.stroke()
    } else {
      ctx.beginPath()
      ctx.moveTo(t.cx - 10 * s, iconY - 4 * s)
      ctx.lineTo(t.cx + 10 * s, iconY - 4 * s)
      ctx.moveTo(t.cx - 10 * s, iconY + 6 * s)
      ctx.lineTo(t.cx + 10 * s, iconY + 6 * s)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(t.cx - 3 * s, iconY - 4 * s, 3 * s, 0, Math.PI * 2)
      ctx.fillStyle = '#0c0c0f'
      ctx.fill()
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(t.cx + 4 * s, iconY + 6 * s, 3 * s, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }

    ctx.textAlign = 'center'
    ctx.fillStyle = isAct ? '#ffffff' : 'rgba(255,255,255,0.4)'
    ctx.font = `${isAct ? 600 : 400} ${Math.round(13.5 * s)}px "Inter", "PingFang SC", sans-serif`
    ctx.fillText(t.label, t.cx, tabY + 58 * s)
  })

  // 底部 iOS Home 指示条
  drawRoundRect(ctx, x + (w - 150 * s) / 2, y + h - 13 * s, 150 * s, 5.5 * s, 2.75 * s)
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.fill()

  // 屏幕表面柔和斜向光学玻璃反光
  const glare = ctx.createLinearGradient(x, y, x + w * 0.85, y + h * 0.6)
  glare.addColorStop(0, 'rgba(255,255,255,0.04)')
  glare.addColorStop(0.42, 'rgba(255,255,255,0.01)')
  glare.addColorStop(0.43, 'rgba(255,255,255,0)')
  glare.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = glare
  ctx.fillRect(x, y, w, h)

  ctx.restore()
}

/**
 * 在指定 19.5:9 手机屏幕区域内绘制真实的「Tab 1: 极简巨幕测速界面」
 */
function drawMinimalDashboardScreen(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  speedInt: string,
  speedDec: string,
  maxSpd: string,
  alt: string,
  dist: string,
  mach?: string
) {
  const s = w / 520
  drawSlenderIphoneShell(ctx, x, y, w, h)

  // 顶部导航栏: 左信号点 + 右 [极简 | 表盘] [HUD]
  const topY = y + 72 * s
  drawRoundRect(ctx, x + 32 * s, topY, 38 * s, 38 * s, 19 * s)
  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + 51 * s, topY + 19 * s, 5 * s, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()

  drawRoundRect(ctx, x + w - 216 * s, topY, 122 * s, 38 * s, 19 * s)
  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  ctx.fill()
  drawRoundRect(ctx, x + w - 213 * s, topY + 3 * s, 58 * s, 32 * s, 16 * s)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.textAlign = 'center'
  ctx.fillStyle = '#000000'
  ctx.font = `600 ${Math.round(14.5 * s)}px "Inter", "PingFang SC", sans-serif`
  ctx.fillText('极简', x + w - 184 * s, topY + 24 * s)
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = `500 ${Math.round(14.5 * s)}px "Inter", "PingFang SC", sans-serif`
  ctx.fillText('表盘', x + w - 126 * s, topY + 24 * s)

  drawRoundRect(ctx, x + w - 84 * s, topY, 52 * s, 38 * s, 19 * s)
  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.font = `600 ${Math.round(13.5 * s)}px "JetBrains Mono", monospace`
  ctx.fillText('HUD', x + w - 58 * s, topY + 24 * s)

  // 中央巨幕速度数字
  const centerY = y + 435 * s
  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffffff'
  ctx.font = `200 ${Math.round((speedInt.length >= 3 ? 135 : 170) * s)}px "Outfit", "Inter", sans-serif`
  ctx.fillText(speedInt, x + w / 2 - 12 * s, centerY)

  ctx.fillStyle = 'rgba(255,255,255,0.32)'
  ctx.font = `200 ${Math.round(44 * s)}px "Outfit", sans-serif`
  ctx.fillText(`.${speedDec}`, x + w / 2 + (speedInt.length >= 3 ? 128 : 108) * s, centerY)

  // 单位胶囊与马赫数
  const pillY = centerY + 36 * s
  drawRoundRect(ctx, x + w / 2 - (mach ? 115 : 58) * s, pillY, 116 * s, 38 * s, 19 * s)
  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.stroke()
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.font = `500 ${Math.round(15 * s)}px "JetBrains Mono", monospace`
  ctx.fillText('KM/H ▾', x + w / 2 - (mach ? 57 : 0) * s, pillY + 24 * s)

  if (mach) {
    drawRoundRect(ctx, x + w / 2 + 10 * s, pillY, 114 * s, 38 * s, 19 * s)
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.font = `500 ${Math.round(14 * s)}px "JetBrains Mono", monospace`
    ctx.fillText(mach, x + w / 2 + 67 * s, pillY + 24 * s)
  }

  // 底部速度微流线 + 三列核心指标 + 状态控制栏
  const footY = y + h - 305 * s
  ctx.beginPath()
  ctx.moveTo(x + 32 * s, footY)
  ctx.bezierCurveTo(x + w * 0.35, footY - 4 * s, x + w * 0.65, footY - 32 * s, x + w - 32 * s, footY - 28 * s)
  ctx.strokeStyle = 'rgba(255,255,255,0.32)'
  ctx.lineWidth = 2 * s
  ctx.stroke()

  const gridY = footY + 18 * s
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 1.2 * s
  ctx.beginPath()
  ctx.moveTo(x + 32 * s, gridY)
  ctx.lineTo(x + w - 32 * s, gridY)
  ctx.stroke()

  const cols = [
    { l: '最高速度', v: maxSpd, u: 'km/h', cx: x + 32 * s, align: 'left' as const },
    { l: '海拔高度', v: alt, u: 'm', cx: x + w / 2, align: 'center' as const },
    { l: '累计里程', v: dist, u: 'km', cx: x + w - 32 * s, align: 'right' as const }
  ]
  cols.forEach((c) => {
    ctx.textAlign = c.align
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = `500 ${Math.round(15 * s)}px "Inter", "PingFang SC", sans-serif`
    ctx.fillText(c.l, c.cx, gridY + 34 * s)
    ctx.fillStyle = '#ffffff'
    ctx.font = `300 ${Math.round(38 * s)}px "Outfit", sans-serif`
    ctx.fillText(c.v, c.cx, gridY + 78 * s)
    ctx.fillStyle = 'rgba(255,255,255,0.38)'
    ctx.font = `400 ${Math.round(14 * s)}px "JetBrains Mono", monospace`
    ctx.fillText(c.u, c.cx, gridY + 102 * s)
  })

  // 行程控制胶囊栏
  const sessY = gridY + 122 * s
  drawRoundRect(ctx, x + 32 * s, sessY, w - 64 * s, 54 * s, 22 * s)
  ctx.fillStyle = 'rgba(255,255,255,0.055)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.stroke()
  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.font = `400 ${Math.round(15 * s)}px "JetBrains Mono", "PingFang SC", sans-serif`
  ctx.fillText('均速 812   ·   用时 01:32', x + 54 * s, sessY + 33 * s)

  drawAuthenticBottomTabBar(ctx, x, y, w, h, 'dashboard')
}

/**
 * 在指定 19.5:9 手机屏幕区域内绘制真实的「Tab 2: 实景速度认证证书界面」
 */
function drawCertificateScreen(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const s = w / 520
  drawSlenderIphoneShell(ctx, x, y, w, h)

  // 顶部控制栏: [曜石 | 钛金 | 暖砂 | 📷实景] + [换词] [↓保存]
  const topY = y + 72 * s
  drawRoundRect(ctx, x + 28 * s, topY, 274 * s, 38 * s, 19 * s)
  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  ctx.fill()
  drawRoundRect(ctx, x + 224 * s, topY + 3 * s, 74 * s, 32 * s, 16 * s)
  ctx.fillStyle = '#ffffff'
  ctx.fill()

  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = `500 ${Math.round(14 * s)}px "Inter", "PingFang SC", sans-serif`
  ctx.fillText('曜石    钛金    暖砂', x + 44 * s, topY + 24 * s)
  ctx.textAlign = 'center'
  ctx.fillStyle = '#000000'
  ctx.font = `600 ${Math.round(14 * s)}px "Inter", "PingFang SC", sans-serif`
  ctx.fillText('📷 实景', x + 261 * s, topY + 24 * s)

  drawRoundRect(ctx, x + w - 182 * s, topY, 72 * s, 38 * s, 19 * s)
  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.font = `500 ${Math.round(14 * s)}px "Inter", "PingFang SC", sans-serif`
  ctx.fillText('换词', x + w - 146 * s, topY + 24 * s)

  drawRoundRect(ctx, x + w - 102 * s, topY, 74 * s, 38 * s, 19 * s)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.fillStyle = '#000000'
  ctx.font = `600 ${Math.round(14 * s)}px "Inter", "PingFang SC", sans-serif`
  ctx.fillText('↓ 保存', x + w - 65 * s, topY + 24 * s)

  // 证书大卡片 (撑满中间区域直到 TabBar 上方)
  const cX = x + 28 * s
  const cY = topY + 52 * s
  const cW = w - 56 * s
  const cH = h - 232 * s

  ctx.save()
  drawRoundRect(ctx, cX, cY, cW, cH, 36 * s)
  ctx.clip()

  // 高空舷窗平流层暮色实景光影衬底
  const skyGrad = ctx.createLinearGradient(cX, cY, cX, cY + cH)
  skyGrad.addColorStop(0, '#0d1424')
  skyGrad.addColorStop(0.38, '#1b2538')
  skyGrad.addColorStop(0.54, '#433835')
  skyGrad.addColorStop(0.65, '#15151b')
  skyGrad.addColorStop(1, '#07070a')
  ctx.fillStyle = skyGrad
  ctx.fillRect(cX, cY, cW, cH)

  const horizonGlow = ctx.createRadialGradient(
    x + w / 2,
    cY + cH * 0.48,
    10 * s,
    x + w / 2,
    cY + cH * 0.48,
    290 * s
  )
  horizonGlow.addColorStop(0, 'rgba(240, 208, 172, 0.25)')
  horizonGlow.addColorStop(0.55, 'rgba(155, 175, 215, 0.08)')
  horizonGlow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = horizonGlow
  ctx.fillRect(cX, cY, cW, cH)
  ctx.restore()

  drawRoundRect(ctx, cX, cY, cW, cH, 36 * s)
  ctx.strokeStyle = 'rgba(255,255,255,0.16)'
  ctx.lineWidth = 1.5 * s
  ctx.stroke()

  // 卡片顶栏
  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(255,255,255,0.62)'
  ctx.font = `600 ${Math.round(13.5 * s)}px "JetBrains Mono", monospace`
  ctx.fillText('● VELOCITY · FOUNDER', cX + 30 * s, cY + 44 * s)

  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.font = `400 ${Math.round(17.5 * s)}px "Inter", "PingFang SC", sans-serif`
  ctx.fillText('CA1501 · 万米高空巡航', cX + 30 * s, cY + 74 * s)

  drawRoundRect(ctx, cX + cW - 148 * s, cY + 32 * s, 118 * s, 36 * s, 18 * s)
  ctx.fillStyle = 'rgba(255,255,255,0.1)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.22)'
  ctx.stroke()
  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffffff'
  ctx.font = `500 ${Math.round(15 * s)}px "Inter", "PingFang SC", sans-serif`
  ctx.fillText('万米高空VIP', cX + cW - 89 * s, cY + 55 * s)

  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.beginPath()
  ctx.moveTo(cX + 30 * s, cY + 98 * s)
  ctx.lineTo(cX + cW - 30 * s, cY + 98 * s)
  ctx.stroke()

  // 中央大数字 885 KM/H
  ctx.fillStyle = 'rgba(255,255,255,0.48)'
  ctx.font = `500 ${Math.round(14 * s)}px "JetBrains Mono", monospace`
  ctx.fillText('今日最高速度', x + w / 2, cY + 195 * s)

  ctx.fillStyle = '#ffffff'
  ctx.font = `200 ${Math.round(140 * s)}px "Outfit", "Inter", sans-serif`
  ctx.fillText('885', x + w / 2 - 22 * s, cY + 335 * s)
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = `400 ${Math.round(23 * s)}px "JetBrains Mono", monospace`
  ctx.fillText('KM/H', x + w / 2 + 124 * s, cY + 335 * s)

  // 走心金句
  ctx.fillStyle = '#ffffff'
  ctx.font = `500 ${Math.round(20.5 * s)}px "Inter", "PingFang SC", sans-serif`
  ctx.fillText('今日速度超越了全球 99.94% 的人类', x + w / 2, cY + 435 * s)
  ctx.fillText('正在一万米高空优雅地喝加冰可乐', x + w / 2, cY + 470 * s)

  ctx.fillStyle = 'rgba(255,255,255,0.58)'
  ctx.font = `400 ${Math.round(16.5 * s)}px "Inter", "PingFang SC", sans-serif`
  ctx.fillText('窗外零下 50°C、时速近千公里', x + w / 2, cY + 516 * s)
  ctx.fillText('地面的鸡毛蒜皮，在云层上连像素都不算', x + w / 2, cY + 544 * s)

  // 底部四联数据
  const gTop = cY + cH - 156 * s
  const gBot = cY + cH - 64 * s
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.beginPath()
  ctx.moveTo(cX + 30 * s, gTop)
  ctx.lineTo(cX + cW - 30 * s, gTop)
  ctx.moveTo(cX + 30 * s, gBot)
  ctx.lineTo(cX + cW - 30 * s, gBot)
  ctx.stroke()

  const stats = [
    { l: '平均速度', v: '812 km/h' },
    { l: '最高海拔', v: '10600 m' },
    { l: '累计里程', v: '1240 km' },
    { l: '有效时长', v: '01:32' }
  ]
  const colW = (cW - 60 * s) / 4
  stats.forEach((st, i) => {
    const sx = cX + 30 * s + colW * i + colW / 2
    ctx.fillStyle = 'rgba(255,255,255,0.48)'
    ctx.font = `400 ${Math.round(14 * s)}px "Inter", "PingFang SC", sans-serif`
    ctx.fillText(st.l, sx, gTop + 34 * s)
    ctx.fillStyle = '#ffffff'
    ctx.font = `500 ${Math.round(17.5 * s)}px "JetBrains Mono", monospace`
    ctx.fillText(st.v, sx, gTop + 68 * s)
  })

  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(255,255,255,0.38)'
  ctx.font = `500 ${Math.round(13.5 * s)}px "JetBrains Mono", monospace`
  ctx.fillText('2026.11.23 18:42', cX + 30 * s, cY + cH - 26 * s)
  ctx.textAlign = 'right'
  ctx.fillText('VELOCITY', cX + cW - 30 * s, cY + cH - 26 * s)

  drawAuthenticBottomTabBar(ctx, x, y, w, h, 'reports')
}

function renderSlideToDataUrl(index: number): string {
  const canvas = document.createElement('canvas')
  const W = 1242
  const H = 1656
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  // 1. 深邃摄影棚暗调背景
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#0e0e12')
  bg.addColorStop(0.5, '#070709')
  bg.addColorStop(1, '#020203')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  const glow = ctx.createRadialGradient(W / 2, 460, 40, W / 2, 540, 720)
  glow.addColorStop(0, 'rgba(255, 255, 255, 0.08)')
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  // 2. 顶部极简一句话标题
  const headers = [
    {
      eyebrow: 'VELOCITY   ·   REAL-TIME GPS & ALTIMETER',
      title: '万米高空，飞行模式下的真实速度',
      sub: '实时卫星测速与实景速度卡片  ·  100% 离线可用'
    },
    {
      eyebrow: 'CHRONOGRAPH   ·   60FPS KALMAN ENGINE',
      title: '像一块安静的机械表',
      sub: '极简数字与瑞士表盘双形态  ·  静止零漂移，移动自动计时'
    },
    {
      eyebrow: 'OPTICAL HUD   ·   MIRROR PROJECTION',
      title: '夜间行车，平放即投影',
      sub: '光学白与香槟金双色温  ·  前挡风玻璃与舷窗反射成正像'
    },
    {
      eyebrow: 'FOUNDER EDITION   ·   LIMITED 100',
      title: '留了 100 个创始内测席位',
      sub: '纯离线  ·  零广告  ·  零轨迹上传  ·  专属海报编号刻印'
    }
  ][index]

  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.42)'
  ctx.font = '500 20px "JetBrains Mono", monospace'
  ctx.fillText(headers.eyebrow, W / 2, 118)

  ctx.fillStyle = '#ffffff'
  ctx.font = '500 56px "Inter", "PingFang SC", sans-serif'
  ctx.fillText(headers.title, W / 2, 206)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.font = '400 26px "Inter", "PingFang SC", sans-serif'
  ctx.fillText(headers.sub, W / 2, 264)

  // ==================== 01: 双机 19.5:9 全景首图 (左: 极简测速页 + 右: 实景证书页) ====================
  if (index === 0) {
    // 后方左侧修长 iPhone 16 Pro (460 x 988, 严格 1:2.15 比例)
    drawMinimalDashboardScreen(
      ctx,
      118,
      410,
      460,
      988,
      '885',
      '4',
      '892',
      '10600',
      '1240',
      'MACH 0.82'
    )

    // 前方右侧修长 iPhone 16 Pro (500 x 1075, 严格 1:2.15 比例)
    drawCertificateScreen(ctx, 618, 365, 500, 1075)
  } else if (index === 1) {
    // ==================== 02: 单机 19.5:9 特写 (瑞士 60 刻度计时表盘真实界面) ====================
    // 严格 520 x 1118 (1:2.15 修长 iPhone 16 Pro 比例，居中完整呈现)
    const pW = 520
    const pH = 1118
    const pX = (W - pW) / 2
    const pY = 365

    drawSlenderIphoneShell(ctx, pX, pY, pW, pH)

    // 顶栏: 左信号点 + 右 [极简 | 表盘] [HUD]
    const topY = pY + 72
    drawRoundRect(ctx, pX + 32, topY, 38, 38, 19)
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(pX + 51, topY + 19, 5, 0, Math.PI * 2)
    ctx.fillStyle = '#ffffff'
    ctx.fill()

    drawRoundRect(ctx, pX + pW - 216, topY, 122, 38, 19)
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.fill()
    drawRoundRect(ctx, pX + pW - 155, topY + 3, 58, 32, 16)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = '500 14.5px "Inter", "PingFang SC", sans-serif'
    ctx.fillText('极简', pX + pW - 184, topY + 24)
    ctx.fillStyle = '#000000'
    ctx.font = '600 14.5px "Inter", "PingFang SC", sans-serif'
    ctx.fillText('表盘', pX + pW - 126, topY + 24)

    drawRoundRect(ctx, pX + pW - 84, topY, 52, 38, 19)
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.font = '600 13.5px "JetBrains Mono", monospace'
    ctx.fillText('HUD', pX + pW - 58, topY + 24)

    // 中央瑞士 60 刻度计时表盘
    const cx = W / 2
    const cy = pY + 415
    const outerR = 188

    ctx.beginPath()
    ctx.arc(cx, cy, outerR + 14, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    const totalTicks = 60
    const startDeg = 135
    const sweepDeg = 270
    const activeCount = 52
    for (let i = 0; i <= totalTicks; i++) {
      const isMajor = i % 5 === 0
      const rad = ((startDeg + (i / totalTicks) * sweepDeg) * Math.PI) / 180
      const r1 = isMajor ? outerR - 24 : outerR - 15
      const r2 = outerR
      ctx.beginPath()
      ctx.moveTo(cx + r1 * Math.cos(rad), cy + r1 * Math.sin(rad))
      ctx.lineTo(cx + r2 * Math.cos(rad), cy + r2 * Math.sin(rad))
      ctx.strokeStyle =
        i <= activeCount
          ? '#ffffff'
          : isMajor
            ? 'rgba(255,255,255,0.28)'
            : 'rgba(255,255,255,0.09)'
      ctx.lineWidth = isMajor ? 3.5 : 2
      ctx.lineCap = 'round'
      ctx.stroke()
    }

    ctx.beginPath()
    ctx.arc(cx, cy, 142, 0, Math.PI * 2)
    ctx.setLineDash([4, 8])
    ctx.strokeStyle = 'rgba(255,255,255,0.14)'
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.setLineDash([])

    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = '600 15px "JetBrains Mono", monospace'
    ctx.fillText('285° 西北', cx, cy - 72)

    ctx.fillStyle = '#ffffff'
    ctx.font = '200 106px "Outfit", "Inter", sans-serif'
    ctx.fillText('348', cx - 10, cy + 28)
    ctx.fillStyle = 'rgba(255,255,255,0.32)'
    ctx.font = '200 36px "Outfit", sans-serif'
    ctx.fillText('.4', cx + 96, cy + 28)

    drawRoundRect(ctx, cx - 50, cy + 54, 100, 32, 16)
    ctx.fillStyle = 'rgba(255,255,255,0.07)'
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.font = '500 15px "JetBrains Mono", monospace'
    ctx.fillText('KM/H ▾', cx, cy + 75)

    // 推背感胶囊
    drawRoundRect(ctx, cx - 68, cy + 225, 136, 34, 17)
    ctx.fillStyle = 'rgba(255,255,255,0.07)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.14)'
    ctx.stroke()
    ctx.fillStyle = '#ffffff'
    ctx.font = '500 14px "JetBrains Mono", "PingFang SC", sans-serif'
    ctx.fillText('推背感 +0.18 G', cx, cy + 247)

    // 底部轨迹流线 + 三列指标 + 行程栏 + TabBar
    const footY = pY + pH - 305
    ctx.beginPath()
    ctx.moveTo(pX + 32, footY)
    ctx.bezierCurveTo(pX + pW * 0.35, footY - 4, pX + pW * 0.65, footY - 32, pX + pW - 32, footY - 28)
    ctx.strokeStyle = 'rgba(255,255,255,0.32)'
    ctx.lineWidth = 2
    ctx.stroke()

    const gridY = footY + 18
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.beginPath()
    ctx.moveTo(pX + 32, gridY)
    ctx.lineTo(pX + pW - 32, gridY)
    ctx.stroke()

    const cols = [
      { l: '最高速度', v: '351', u: 'km/h', cx: pX + 32, align: 'left' as const },
      { l: '海拔高度', v: '164', u: '↑0.6m/s · m', cx: W / 2, align: 'center' as const },
      { l: '累计里程', v: '528.6', u: 'km', cx: pX + pW - 32, align: 'right' as const }
    ]
    cols.forEach((c) => {
      ctx.textAlign = c.align
      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      ctx.font = '500 15px "Inter", "PingFang SC", sans-serif'
      ctx.fillText(c.l, c.cx, gridY + 34)
      ctx.fillStyle = '#ffffff'
      ctx.font = '300 38px "Outfit", sans-serif'
      ctx.fillText(c.v, c.cx, gridY + 78)
      ctx.fillStyle = 'rgba(255,255,255,0.38)'
      ctx.font = '400 14px "JetBrains Mono", monospace'
      ctx.fillText(c.u, c.cx, gridY + 102)
    })

    const sessY = gridY + 122
    drawRoundRect(ctx, pX + 32, sessY, pW - 64, 54, 22)
    ctx.fillStyle = 'rgba(255,255,255,0.055)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.stroke()
    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(255,255,255,0.65)'
    ctx.font = '400 15px "JetBrains Mono", "PingFang SC", sans-serif'
    ctx.fillText('均速 292   ·   用时 01:48:20', pX + 54, sessY + 33)

    drawAuthenticBottomTabBar(ctx, pX, pY, pW, pH, 'dashboard')
  } else if (index === 2) {
    // ==================== 03: 双机对照 (左: 极简测速实机 + 右: 全屏光学白 HUD 镜像实机) ====================
    // 左侧修长 iPhone 16 Pro: 夜间驾车极简测速页 (118.5 km/h)
    drawMinimalDashboardScreen(
      ctx,
      118,
      410,
      460,
      988,
      '118',
      '5',
      '124',
      '420',
      '68.4'
    )

    // 右侧修长 iPhone 16 Pro (500 x 1075): 展示真实的 HudMode.vue 界面 (光学白 + 镜像翻转开启)
    const pX = 618
    const pY = 365
    const pW = 500
    const pH = 1075
    const s = pW / 520

    drawSlenderIphoneShell(ctx, pX, pY, pW, pH)

    // HUD 顶部控制栏: [镜像投影开启 ●] [光学白] + [X]
    const topY = pY + 76 * s
    drawRoundRect(ctx, pX + 32 * s, topY, 152 * s, 40 * s, 20 * s)
    ctx.fillStyle = 'rgba(255,255,255,0.07)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.stroke()
    ctx.textAlign = 'left'
    ctx.fillStyle = '#ffffff'
    ctx.font = `500 ${Math.round(14.5 * s)}px "Inter", "PingFang SC", sans-serif`
    ctx.fillText('镜像投影开启', pX + 50 * s, topY + 25 * s)
    ctx.beginPath()
    ctx.arc(pX + 162 * s, topY + 20 * s, 5 * s, 0, Math.PI * 2)
    ctx.fillStyle = '#ffffff'
    ctx.fill()

    drawRoundRect(ctx, pX + 194 * s, topY, 82 * s, 40 * s, 20 * s)
    ctx.fillStyle = 'rgba(255,255,255,0.07)'
    ctx.fill()
    ctx.textAlign = 'center'
    ctx.fillStyle = '#ffffff'
    ctx.font = `500 ${Math.round(14.5 * s)}px "Inter", "PingFang SC", sans-serif`
    ctx.fillText('光学白', pX + 235 * s, topY + 25 * s)

    drawRoundRect(ctx, pX + pW - 72 * s, topY, 40 * s, 40 * s, 20 * s)
    ctx.fillStyle = 'rgba(255,255,255,0.07)'
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.font = `500 ${Math.round(18 * s)}px "Inter", sans-serif`
    ctx.fillText('✕', pX + pW - 52 * s, topY + 26 * s)

    // 上方示意：前挡玻璃反射出的正向光学白大字
    drawRoundRect(ctx, pX + 32 * s, pY + 165 * s, pW - 64 * s, 290 * s, 28 * s)
    ctx.fillStyle = 'rgba(255,255,255,0.03)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.stroke()

    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255,255,255,0.42)'
    ctx.font = `500 ${Math.round(14 * s)}px "Inter", "PingFang SC", sans-serif`
    ctx.fillText('▲ 玻璃反射正向成像效果', pX + pW / 2, pY + 210 * s)

    ctx.save()
    ctx.shadowColor = 'rgba(255,255,255,0.35)'
    ctx.shadowBlur = 24
    ctx.fillStyle = '#ffffff'
    ctx.font = `200 ${Math.round(135 * s)}px "Outfit", "Inter", sans-serif`
    ctx.fillText('118.5', pX + pW / 2, pY + 345 * s)
    ctx.restore()

    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = `400 ${Math.round(18 * s)}px "JetBrains Mono", monospace`
    ctx.fillText('KM/H  ·  ALT 420 m  ·  310°', pX + pW / 2, pY + 398 * s)

    // 下方：手机屏幕实际的水平镜像翻转显示 (scaleX(-1))
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = `500 ${Math.round(14 * s)}px "Inter", "PingFang SC", sans-serif`
    ctx.fillText('▼ 手机屏幕实际镜像画面', pX + pW / 2, pY + 545 * s)

    ctx.save()
    ctx.translate(pX + pW / 2, pY + 695 * s)
    ctx.scale(-1, 1)
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255,255,255,0.75)'
    ctx.font = `200 ${Math.round(135 * s)}px "Outfit", "Inter", sans-serif`
    ctx.fillText('118.5', 0, 0)
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.font = `400 ${Math.round(18 * s)}px "JetBrains Mono", monospace`
    ctx.fillText('KM/H  ·  ALT 420 m  ·  310°', 0, 52 * s)
    ctx.restore()

    // 底部说明文字 (与真机 HudMode.vue 一致)
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.font = `400 ${Math.round(15 * s)}px "Inter", "PingFang SC", sans-serif`
    ctx.fillText('将手机平放于前挡风玻璃或舷窗下', pX + pW / 2, pY + pH - 86 * s)
    ctx.fillText('通过玻璃反射即可观看正向数字', pX + pW / 2, pY + pH - 60 * s)

    // 底部 Home 白条
    drawRoundRect(ctx, pX + (pW - 150 * s) / 2, pY + pH - 13 * s, 150 * s, 5.5 * s, 2.75 * s)
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.fill()
  } else {
    // ==================== 04: 单机 19.5:9 特写 (真实的「Tab 3: 设置与创始内测官界面」) ====================
    const pW = 520
    const pH = 1118
    const pX = (W - pW) / 2
    const pY = 365

    drawSlenderIphoneShell(ctx, pX, pY, pW, pH)

    // 页面标题: 设置 + v2.4 · OFFLINE
    ctx.textAlign = 'left'
    ctx.fillStyle = '#ffffff'
    ctx.font = '600 32px "Inter", "PingFang SC", sans-serif'
    ctx.fillText('设置', pX + 36, pY + 108)
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.font = '400 16px "Inter", "PingFang SC", sans-serif'
    ctx.fillText('仪器偏好、专属权益与传感器诊断', pX + 36, pY + 136)

    drawRoundRect(ctx, pX + pW - 154, pY + 92, 118, 34, 17)
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.stroke()
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.font = '500 14px "JetBrains Mono", monospace'
    ctx.fillText('v2.4 · OFFLINE', pX + pW - 95, pY + 114)

    // 模块 0: Velocity Pro · 创始内测官卡片 (2x2 矩阵)
    const proY = pY + 164
    drawRoundRect(ctx, pX + 36, proY, pW - 72, 225, 26)
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.16)'
    ctx.stroke()

    drawRoundRect(ctx, pX + 58, proY + 24, 48, 28, 8)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    ctx.textAlign = 'center'
    ctx.fillStyle = '#000000'
    ctx.font = '700 14px "JetBrains Mono", monospace'
    ctx.fillText('PRO', pX + 82, proY + 43)

    ctx.textAlign = 'left'
    ctx.fillStyle = '#ffffff'
    ctx.font = '600 20px "Inter", sans-serif'
    ctx.fillText('Velocity Pro', pX + 118, proY + 44)
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = '400 16px "Inter", "PingFang SC", sans-serif'
    ctx.fillText('· 创始内测官 #001', pX + 240, proY + 44)

    drawRoundRect(ctx, pX + pW - 146, proY + 20, 88, 36, 18)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    ctx.textAlign = 'center'
    ctx.fillStyle = '#000000'
    ctx.font = '600 15px "Inter", "PingFang SC", sans-serif'
    ctx.fillText('已激活 ✓', pX + pW - 102, proY + 43)

    // 2x2 权益胶囊
    const perks = ['✦ 纯净零广告', '✦ 实景相机水印', '✦ 高定证书材质', '✦ 挡风玻璃 HUD']
    perks.forEach((pk, idx) => {
      const col = idx % 2
      const row = Math.floor(idx / 2)
      const gx = pX + 58 + col * 206
      const gy = proY + 76 + row * 64
      drawRoundRect(ctx, gx, gy, 196, 52, 16)
      ctx.fillStyle = 'rgba(0,0,0,0.4)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.stroke()
      ctx.textAlign = 'left'
      ctx.fillStyle = 'rgba(255,255,255,0.88)'
      ctx.font = '500 16px "Inter", "PingFang SC", sans-serif'
      ctx.fillText(pk, gx + 20, gy + 32)
    })

    // 模块 1: 通用偏好设置卡片 (1:1 还原真实设置列表)
    const prefY = proY + 252
    drawRoundRect(ctx, pX + 36, prefY, pW - 72, 365, 26)
    ctx.fillStyle = '#151519'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.09)'
    ctx.stroke()

    const rows = [
      { l: '界面语言', rightType: 'seg', val: '中文' },
      { l: '速度单位', rightType: 'unit', val: 'km/h' },
      { l: '保持屏幕常亮', sub: '测速期间防止手机自动锁屏', rightType: 'switch', on: true },
      { l: 'HUD 默认镜像', sub: '开启时自动水平翻转投影画面', rightType: 'switch', on: true },
      { l: '轻触震动反馈', sub: '切换单位与突破时速时轻微震动', rightType: 'switch', on: true }
    ]

    rows.forEach((r, i) => {
      const ry = prefY + i * 73
      if (i > 0) {
        ctx.strokeStyle = 'rgba(255,255,255,0.06)'
        ctx.beginPath()
        ctx.moveTo(pX + 58, ry)
        ctx.lineTo(pX + pW - 58, ry)
        ctx.stroke()
      }
      ctx.textAlign = 'left'
      ctx.fillStyle = '#ffffff'
      ctx.font = '500 18px "Inter", "PingFang SC", sans-serif'
      ctx.fillText(r.l, pX + 58, ry + (r.sub ? 32 : 43))
      if (r.sub) {
        ctx.fillStyle = 'rgba(255,255,255,0.4)'
        ctx.font = '400 14px "Inter", "PingFang SC", sans-serif'
        ctx.fillText(r.sub, pX + 58, ry + 54)
      }

      if (r.rightType === 'switch') {
        drawRoundRect(ctx, pX + pW - 122, ry + 20, 64, 36, 18)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(pX + pW - 76, ry + 38, 14, 0, Math.PI * 2)
        ctx.fillStyle = '#000000'
        ctx.fill()
      } else if (r.rightType === 'seg') {
        drawRoundRect(ctx, pX + pW - 178, ry + 18, 120, 38, 12)
        ctx.fillStyle = '#09090b'
        ctx.fill()
        drawRoundRect(ctx, pX + pW - 174, ry + 22, 58, 30, 9)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
        ctx.textAlign = 'center'
        ctx.fillStyle = '#000000'
        ctx.font = '600 15px "Inter", "PingFang SC", sans-serif'
        ctx.fillText('中文', pX + pW - 145, ry + 43)
        ctx.fillStyle = 'rgba(255,255,255,0.45)'
        ctx.fillText('EN', pX + pW - 87, ry + 43)
      } else if (r.rightType === 'unit') {
        drawRoundRect(ctx, pX + pW - 262, ry + 18, 204, 38, 12)
        ctx.fillStyle = '#09090b'
        ctx.fill()
        drawRoundRect(ctx, pX + pW - 258, ry + 22, 56, 30, 9)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
        ctx.textAlign = 'center'
        ctx.fillStyle = '#000000'
        ctx.font = '600 14px "JetBrains Mono", monospace'
        ctx.fillText('km/h', pX + pW - 230, ry + 42)
        ctx.fillStyle = 'rgba(255,255,255,0.45)'
        ctx.fillText('mph   kt   m/s', pX + pW - 126, ry + 42)
      }
    })

    // 模块 2: 传感器状态与添加到桌面
    const satY = prefY + 386
    drawRoundRect(ctx, pX + 36, satY, pW - 72, 72, 24)
    ctx.fillStyle = '#151519'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.09)'
    ctx.stroke()
    ctx.textAlign = 'left'
    ctx.fillStyle = '#ffffff'
    ctx.font = '500 18px "Inter", "PingFang SC", sans-serif'
    ctx.fillText('卫星定位', pX + 58, satY + 43)
    ctx.textAlign = 'right'
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.fillText('● 信号良好   +', pX + pW - 58, satY + 43)

    drawAuthenticBottomTabBar(ctx, pX, pY, pW, pH, 'settings')
  }

  return canvas.toDataURL('image/png')
}

function selectSlide(idx: number) {
  playTactileTick(true)
  activeSlide.value = idx
  previewDataUrl.value = renderSlideToDataUrl(idx)
}

function downloadCurrentSlide() {
  playTactileTick(true)
  const url = previewDataUrl.value || renderSlideToDataUrl(activeSlide.value)
  const link = document.createElement('a')
  link.download = `Velocity_App_0${activeSlide.value + 1}.png`
  link.href = url
  link.click()
}

async function downloadAllSlides() {
  if (isDownloadingAll.value) return
  playTactileTick(true)
  isDownloadingAll.value = true
  try {
    for (let i = 0; i < slides.length; i++) {
      activeSlide.value = i
      const url = renderSlideToDataUrl(i)
      previewDataUrl.value = url
      const link = document.createElement('a')
      link.download = `Velocity_App_0${i + 1}.png`
      link.href = url
      link.click()
      await new Promise((r) => setTimeout(r, 380))
    }
  } finally {
    isDownloadingAll.value = false
  }
}

async function copyPostCopywriting() {
  playTactileTick(true)
  try {
    await navigator.clipboard.writeText(activeCopywriting.value)
    copiedText.value = true
    setTimeout(() => {
      copiedText.value = false
    }, 2500)
  } catch {
    copiedText.value = true
  }
}

onMounted(() => {
  previewDataUrl.value = renderSlideToDataUrl(0)
})
</script>
