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
              小红书 / App Store 极简真机宣传图工坊
            </h3>
          </div>
          <p class="text-xs text-zinc-400 mt-1">
            参考 Apple 与 Leica 杂志画册排版：大幅留白、3D 钛金属真机光影、每张图仅保留一句话
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
          <div class="w-full max-w-[340px] aspect-[3/4] rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl relative">
            <img
              v-if="previewDataUrl"
              :src="previewDataUrl"
              alt="Promo Poster Preview"
              class="w-full h-full object-contain select-auto"
            />
          </div>
          <span class="text-[11px] text-zinc-500 mt-2">
            1242 × 1656 px (3:4 满屏画册比例 · 手机可直接长按图片存相册)
          </span>
        </div>

        <!-- 右侧控制面板与真人语气文案 (5列) -->
        <div class="md:col-span-5 flex flex-col justify-between space-y-4">
          <!-- 4 张真机宣传图切换 -->
          <div>
            <div class="text-xs font-medium text-zinc-400 mb-2">选择画册页（共 4 张）：</div>
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
              <span>下载当前画册图 (0{{ activeSlide + 1 }})</span>
            </button>

            <button
              type="button"
              @click="downloadAllSlides"
              :disabled="isDownloadingAll"
              class="w-full py-2.5 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white font-medium text-xs btn-spring cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Sparkles class="w-3.5 h-3.5 stroke-[1.8]" />
              <span>{{ isDownloadingAll ? '正在依次导出 4 张画册...' : '一键导出全部 4 张套图' }}</span>
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
  { id: 'flight', name: '01 · 万米高空，飞行模式下的真实速度' },
  { id: 'dial', name: '02 · 像一块安静的机械表（瑞士表盘）' },
  { id: 'hud', name: '03 · 夜间行车，平放即投影（光学白 HUD）' },
  { id: 'founder', name: '04 · 留了 100 个创始内测席位（黑金卡）' }
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
 * 绘制高质感 3D 拉丝钛金属 iPhone 硬件外壳与屏幕玻璃高光
 */
function drawTitaniumHardwareFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save()

  // 1. 深邃摄影棚底部投影
  ctx.shadowColor = 'rgba(0, 0, 0, 0.95)'
  ctx.shadowBlur = 95
  ctx.shadowOffsetY = 36
  drawRoundRect(ctx, x - 18, y - 18, w + 36, h + 36, 92)
  ctx.fillStyle = '#0a0a0d'
  ctx.fill()
  ctx.restore()

  // 2. 侧面物理钛金属按键 (左侧操作键+音量键，右侧电源键)
  ctx.fillStyle = '#3a3a44'
  drawRoundRect(ctx, x - 22, y + 180, 4, 48, 2)
  ctx.fill()
  drawRoundRect(ctx, x - 22, y + 265, 4, 92, 2)
  ctx.fill()
  drawRoundRect(ctx, x - 22, y + 375, 4, 92, 2)
  ctx.fill()
  drawRoundRect(ctx, x + w + 18, y + 295, 4, 130, 2)
  ctx.fill()

  // 3. 外层拉丝钛金属中框 (多段高光金属反射渐变)
  const metalGrad = ctx.createLinearGradient(x - 18, y - 18, x + w + 18, y + h + 18)
  metalGrad.addColorStop(0, '#52525e')
  metalGrad.addColorStop(0.18, '#27272f')
  metalGrad.addColorStop(0.5, '#3f3f4a')
  metalGrad.addColorStop(0.82, '#1c1c22')
  metalGrad.addColorStop(1, '#464652')

  drawRoundRect(ctx, x - 18, y - 18, w + 36, h + 36, 92)
  ctx.fillStyle = metalGrad
  ctx.fill()

  // 外框 1px 金属高光倒角切边
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
  ctx.lineWidth = 2
  ctx.stroke()

  // 4. 内层黑色屏幕玻璃黑边 (Bezel)
  drawRoundRect(ctx, x - 10, y - 10, w + 20, h + 20, 84)
  ctx.fillStyle = '#030304'
  ctx.fill()

  // 5. 屏幕显示区基底
  drawRoundRect(ctx, x, y, w, h, 76)
  ctx.fillStyle = '#050507'
  ctx.fill()

  // 6. 顶部灵动岛硬件开孔與真实状态栏 (9:41 + 信号电池)
  drawRoundRect(ctx, x + w / 2 - 96, y + 26, 192, 46, 23)
  ctx.fillStyle = '#000000'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // 镜头微反光点
  ctx.beginPath()
  ctx.arc(x + w / 2 + 64, y + 49, 8, 0, Math.PI * 2)
  ctx.fillStyle = '#11131a'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + w / 2 + 62, y + 47, 2.5, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.fill()

  // 状态栏时间与右侧图标
  ctx.textAlign = 'left'
  ctx.fillStyle = '#ffffff'
  ctx.font = '600 24px "Inter", -apple-system, sans-serif'
  ctx.fillText('09:41', x + 58, y + 57)

  // 信号柱与电池图标
  const bx = x + w - 105
  const by = y + 38
  for (let i = 0; i < 4; i++) {
    const bh = 8 + i * 3.5
    drawRoundRect(ctx, bx - 44 + i * 8, by + 18 - bh, 5, bh, 1.5)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
  }
  drawRoundRect(ctx, bx, by + 2, 42, 20, 5)
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'
  ctx.lineWidth = 2
  ctx.stroke()
  drawRoundRect(ctx, bx + 4, by + 6, 30, 12, 2.5)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
}

/**
 * 屏幕表面斜向光学玻璃微反光与底部 iOS Home 指示条
 */
function drawScreenGlassOverlay(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save()
  drawRoundRect(ctx, x, y, w, h, 76)
  ctx.clip()

  // 斜向极柔和玻璃光泽
  const glare = ctx.createLinearGradient(x, y, x + w * 0.85, y + h * 0.65)
  glare.addColorStop(0, 'rgba(255, 255, 255, 0.045)')
  glare.addColorStop(0.42, 'rgba(255, 255, 255, 0.012)')
  glare.addColorStop(0.43, 'rgba(255, 255, 255, 0.0)')
  glare.addColorStop(1, 'rgba(255, 255, 255, 0.0)')
  ctx.fillStyle = glare
  ctx.fillRect(x, y, w, h)

  // 底部 Home Indicator 白条
  drawRoundRect(ctx, x + w / 2 - 110, y + h - 22, 220, 8, 4)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.32)'
  ctx.fill()

  ctx.restore()
}

function renderSlideToDataUrl(index: number): string {
  const canvas = document.createElement('canvas')
  const W = 1242
  const H = 1656
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  // 1. 徕卡暗房级深邃背景
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#0e0e12')
  bg.addColorStop(0.45, '#070709')
  bg.addColorStop(1, '#020203')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // 柔和顶部背光轮廓灯
  const glow = ctx.createRadialGradient(W / 2, 420, 50, W / 2, 520, 720)
  glow.addColorStop(0, 'rgba(255, 255, 255, 0.075)')
  glow.addColorStop(0.6, 'rgba(214, 199, 178, 0.02)')
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  // 2. 极简杂志级顶栏：只保留一行大标题 + 一行小字，大量留白，绝不堆砌字块
  const headers = [
    {
      eyebrow: 'VELOCITY   ·   OFFLINE INSTRUMENT',
      title: '万米高空，飞行模式下的真实速度',
      sub: '贴近客舱舷窗即可直连卫星  ·  无需任何网络'
    },
    {
      eyebrow: 'CHRONOGRAPH   ·   KALMAN 60FPS',
      title: '像一块安静的机械表',
      sub: '极简巨幕与瑞士表盘双形态  ·  静止零漂移，移动自动计时'
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
  ctx.font = '500 21px "JetBrains Mono", monospace'
  ctx.fillText(headers.eyebrow, W / 2, 130)

  ctx.fillStyle = '#ffffff'
  ctx.font = '500 58px "Inter", "PingFang SC", "Hiragino Sans GB", sans-serif'
  ctx.fillText(headers.title, W / 2, 224)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.font = '400 27px "Inter", "PingFang SC", sans-serif'
  ctx.fillText(headers.sub, W / 2, 286)

  // 3. 主视觉舞台
  if (index === 0) {
    // ==================== P1: 3D 钛金属 iPhone 展示「万米高空实景速度证书」 ====================
    const pX = 206
    const pY = 380
    const pW = 830
    const pH = 1220

    drawTitaniumHardwareFrame(ctx, pX, pY, pW, pH)

    // 手机内顶栏 (曜石 | 钛金 | 暖砂 | 实景 + 保存)
    const barY = pY + 102
    drawRoundRect(ctx, pX + 48, barY, 370, 52, 26)
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.fill()
    drawRoundRect(ctx, pX + 312, barY + 4, 102, 44, 22)
    ctx.fillStyle = '#ffffff'
    ctx.fill()

    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = '500 20px "Inter", "PingFang SC", sans-serif'
    ctx.fillText('曜石      钛金      暖砂', pX + 180, barY + 33)
    ctx.fillStyle = '#000000'
    ctx.font = '600 20px "Inter", "PingFang SC", sans-serif'
    ctx.fillText('📷 实景', pX + 363, barY + 33)

    // 右侧换词 + 保存胶囊
    drawRoundRect(ctx, pX + pW - 156, barY, 108, 52, 26)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    ctx.fillStyle = '#000000'
    ctx.font = '600 20px "Inter", "PingFang SC", sans-serif'
    ctx.fillText('↓ 保存', pX + pW - 102, barY + 33)

    // 证书主卡片 (带高空暮色云海氛围光影衬底)
    const cX = pX + 48
    const cY = pY + 180
    const cW = pW - 96
    const cH = 955

    ctx.save()
    drawRoundRect(ctx, cX, cY, cW, cH, 48)
    ctx.clip()

    // 模拟万米高空舷窗暮色地平线摄影渐变衬底
    const skyGrad = ctx.createLinearGradient(cX, cY, cX, cY + cH)
    skyGrad.addColorStop(0, '#0d1322')
    skyGrad.addColorStop(0.38, '#1a2234')
    skyGrad.addColorStop(0.54, '#3d3533')
    skyGrad.addColorStop(0.62, '#16161c')
    skyGrad.addColorStop(1, '#08080b')
    ctx.fillStyle = skyGrad
    ctx.fillRect(cX, cY, cW, cH)

    // 远方地平线柔光带 (模拟平流层晨昏线)
    const horizonGlow = ctx.createRadialGradient(
      W / 2,
      cY + 470,
      10,
      W / 2,
      cY + 470,
      460
    )
    horizonGlow.addColorStop(0, 'rgba(235, 205, 170, 0.22)')
    horizonGlow.addColorStop(0.5, 'rgba(160, 175, 210, 0.08)')
    horizonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = horizonGlow
    ctx.fillRect(cX, cY, cW, cH)

    ctx.restore()

    drawRoundRect(ctx, cX, cY, cW, cH, 48)
    ctx.strokeStyle = 'rgba(255,255,255,0.16)'
    ctx.lineWidth = 2
    ctx.stroke()

    // 证书顶部品牌与航班备注
    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = '600 19px "JetBrains Mono", monospace'
    ctx.fillText('● VELOCITY · FOUNDER', cX + 46, cY + 64)

    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.font = '400 25px "Inter", "PingFang SC", sans-serif'
    ctx.fillText('CA1501 · 万米平流层巡航', cX + 46, cY + 106)

    // 右上角标签
    drawRoundRect(ctx, cX + cW - 220, cY + 48, 174, 48, 24)
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.22)'
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.textAlign = 'center'
    ctx.fillStyle = '#ffffff'
    ctx.font = '500 21px "Inter", "PingFang SC", sans-serif'
    ctx.fillText('万米高空VIP', cX + cW - 133, cY + 80)

    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.beginPath()
    ctx.moveTo(cX + 46, cY + 140)
    ctx.lineTo(cX + cW - 46, cY + 140)
    ctx.stroke()

    // 中央大数字 885 KM/H
    ctx.fillStyle = 'rgba(255,255,255,0.48)'
    ctx.font = '500 19px "JetBrains Mono", monospace'
    ctx.fillText('今日最高速度', W / 2, cY + 235)

    ctx.fillStyle = '#ffffff'
    ctx.font = '200 215px "Outfit", "Inter", sans-serif'
    ctx.fillText('885', W / 2 - 34, cY + 435)
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = '400 32px "JetBrains Mono", monospace'
    ctx.fillText('KM/H', W / 2 + 188, cY + 435)

    // 走心金句 (严格语义断行)
    ctx.fillStyle = '#ffffff'
    ctx.font = '500 29px "Inter", "PingFang SC", sans-serif'
    ctx.fillText('今日速度超越了全球 99.94% 的人类', W / 2, cY + 540)
    ctx.fillText('正在一万米高空优雅地喝加冰可乐', W / 2, cY + 586)

    ctx.fillStyle = 'rgba(255,255,255,0.58)'
    ctx.font = '400 23px "Inter", "PingFang SC", sans-serif'
    ctx.fillText('窗外零下 50°C、时速近千公里', W / 2, cY + 644)
    ctx.fillText('地面的鸡毛蒜皮，在云层上连像素都不算', W / 2, cY + 682)

    // 底部四联数据栏
    const gTop = cY + 750
    const gBot = cY + 865
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.beginPath()
    ctx.moveTo(cX + 46, gTop)
    ctx.lineTo(cX + cW - 46, gTop)
    ctx.moveTo(cX + 46, gBot)
    ctx.lineTo(cX + cW - 46, gBot)
    ctx.stroke()

    const stats = [
      { l: '平均速度', v: '812 km/h' },
      { l: '最高海拔', v: '10600 m' },
      { l: '累计里程', v: '1240 km' },
      { l: '有效时长', v: '01:32' }
    ]
    const colW = (cW - 92) / 4
    stats.forEach((s, i) => {
      const sx = cX + 46 + colW * i + colW / 2
      ctx.fillStyle = 'rgba(255,255,255,0.48)'
      ctx.font = '400 19px "Inter", "PingFang SC", sans-serif'
      ctx.fillText(s.l, sx, gTop + 44)
      ctx.fillStyle = '#ffffff'
      ctx.font = '500 25px "JetBrains Mono", monospace'
      ctx.fillText(s.v, sx, gTop + 86)
    })

    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(255,255,255,0.38)'
    ctx.font = '500 18px "JetBrains Mono", monospace'
    ctx.fillText('2026.11.23 18:42', cX + 46, cY + 915)
    ctx.textAlign = 'right'
    ctx.fillText('VELOCITY', cX + cW - 46, cY + 915)

    drawScreenGlassOverlay(ctx, pX, pY, pW, pH)
  } else if (index === 1) {
    // ==================== P2: 3D 钛金属 iPhone 展示「瑞士精密单色计时表盘」 ====================
    const pX = 206
    const pY = 380
    const pW = 830
    const pH = 1220

    drawTitaniumHardwareFrame(ctx, pX, pY, pW, pH)

    // 顶部状态胶囊与极简/表盘切换
    const barY = pY + 105
    drawRoundRect(ctx, pX + 54, barY, 52, 52, 26)
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(pX + 80, barY + 26, 7, 0, Math.PI * 2)
    ctx.fillStyle = '#ffffff'
    ctx.fill()

    drawRoundRect(ctx, pX + pW - 310, barY, 168, 52, 26)
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.fill()
    drawRoundRect(ctx, pX + pW - 224, barY + 4, 78, 44, 22)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = '500 20px "Inter", "PingFang SC", sans-serif'
    ctx.fillText('极简', pX + pW - 266, barY + 33)
    ctx.fillStyle = '#000000'
    ctx.font = '600 20px "Inter", "PingFang SC", sans-serif'
    ctx.fillText('表盘', pX + pW - 185, barY + 33)

    drawRoundRect(ctx, pX + pW - 128, barY, 74, 52, 26)
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.font = '600 18px "JetBrains Mono", monospace'
    ctx.fillText('HUD', pX + pW - 91, barY + 32)

    // 中央瑞士 60 刻度计时表盘
    const cx = W / 2
    const cy = pY + 515
    const outerR = 295

    ctx.beginPath()
    ctx.arc(cx, cy, outerR + 24, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'
    ctx.lineWidth = 2
    ctx.stroke()

    const totalTicks = 60
    const startDeg = 135
    const sweepDeg = 270
    const activeCount = 52
    for (let i = 0; i <= totalTicks; i++) {
      const isMajor = i % 5 === 0
      const rad = ((startDeg + (i / totalTicks) * sweepDeg) * Math.PI) / 180
      const r1 = isMajor ? outerR - 36 : outerR - 22
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
      ctx.lineWidth = isMajor ? 5 : 3
      ctx.lineCap = 'round'
      ctx.stroke()
    }

    // 内圈罗盘虚线环
    ctx.beginPath()
    ctx.arc(cx, cy, 222, 0, Math.PI * 2)
    ctx.setLineDash([5, 11])
    ctx.strokeStyle = 'rgba(255,255,255,0.14)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.setLineDash([])

    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.font = '600 22px "JetBrains Mono", monospace'
    ctx.fillText('285° 西北', cx, cy - 108)

    ctx.fillStyle = '#ffffff'
    ctx.font = '200 165px "Outfit", "Inter", sans-serif'
    ctx.fillText('348', cx - 16, cy + 42)
    ctx.fillStyle = 'rgba(255,255,255,0.32)'
    ctx.font = '200 54px "Outfit", sans-serif'
    ctx.fillText('.4', cx + 148, cy + 42)

    drawRoundRect(ctx, cx - 76, cy + 82, 152, 46, 23)
    ctx.fillStyle = 'rgba(255,255,255,0.07)'
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.font = '500 22px "JetBrains Mono", monospace'
    ctx.fillText('KM/H', cx, cy + 113)

    // 底部实时速度轨迹曲线与三列指标
    const bY = pY + 905
    ctx.beginPath()
    ctx.moveTo(pX + 58, bY - 28)
    ctx.bezierCurveTo(pX + 240, bY - 32, pX + 420, bY - 75, pX + pW - 58, bY - 68)
    ctx.strokeStyle = 'rgba(255,255,255,0.38)'
    ctx.lineWidth = 3
    ctx.stroke()

    ctx.strokeStyle = 'rgba(255,255,255,0.09)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(pX + 58, bY)
    ctx.lineTo(pX + pW - 58, bY)
    ctx.stroke()

    const bStats = [
      { l: '最高速度', v: '351', u: 'KM/H', x: pX + 125, align: 'left' as const },
      { l: '海拔高度', v: '164', u: 'm', x: W / 2, align: 'center' as const },
      { l: '累计里程', v: '528.6', u: 'km', x: pX + pW - 125, align: 'right' as const }
    ]
    bStats.forEach((b) => {
      ctx.textAlign = b.align
      ctx.fillStyle = 'rgba(255,255,255,0.42)'
      ctx.font = '500 21px "Inter", "PingFang SC", sans-serif'
      ctx.fillText(b.l, b.x, bY + 46)
      ctx.fillStyle = '#ffffff'
      ctx.font = '300 56px "Outfit", sans-serif'
      ctx.fillText(b.v, b.x, bY + 108)
      ctx.fillStyle = 'rgba(255,255,255,0.38)'
      ctx.font = '400 19px "JetBrains Mono", monospace'
      ctx.fillText(b.u, b.x, bY + 142)
    })

    drawScreenGlassOverlay(ctx, pX, pY, pW, pH)
  } else if (index === 2) {
    // ==================== P3: 光学纯白与香槟金前挡 HUD (彻底摒弃廉价绿色) ====================
    const boxX = 136
    const boxY = 390
    const boxW = W - 272
    const boxH = 1090

    // 挡风玻璃夜航暗调取景框
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.9)'
    ctx.shadowBlur = 80
    drawRoundRect(ctx, boxX, boxY, boxW, boxH, 56)
    const glassBg = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxH)
    glassBg.addColorStop(0, '#121318')
    glassBg.addColorStop(0.55, '#08080b')
    glassBg.addColorStop(1, '#040406')
    ctx.fillStyle = glassBg
    ctx.fill()
    ctx.restore()

    drawRoundRect(ctx, boxX, boxY, boxW, boxH, 56)
    ctx.strokeStyle = 'rgba(255,255,255,0.16)'
    ctx.lineWidth = 2
    ctx.stroke()

    // 上半部：前挡风玻璃光学纯白虚像反射 (带柔和铂金散景光晕)
    const hudGlow = ctx.createRadialGradient(W / 2, boxY + 290, 20, W / 2, boxY + 290, 390)
    hudGlow.addColorStop(0, 'rgba(255, 255, 255, 0.11)')
    hudGlow.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = hudGlow
    ctx.fillRect(boxX, boxY, boxW, 560)

    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '500 20px "JetBrains Mono", "Inter", sans-serif'
    ctx.fillText('WINDSHIELD REFLECTION  ·  前挡玻璃光学反射成像', W / 2, boxY + 86)

    // 光学纯白巨幕投影数字
    ctx.save()
    ctx.shadowColor = 'rgba(255, 255, 255, 0.32)'
    ctx.shadowBlur = 32
    ctx.fillStyle = '#ffffff'
    ctx.font = '200 235px "Outfit", "Inter", sans-serif'
    ctx.fillText('118', W / 2 - 28, boxY + 330)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
    ctx.font = '200 72px "Outfit", sans-serif'
    ctx.fillText('.5', W / 2 + 190, boxY + 330)
    ctx.restore()

    ctx.font = '400 28px "JetBrains Mono", monospace'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)'
    ctx.fillText('KM/H    ·    ALT 420 m    ·    310° NW', W / 2, boxY + 412)

    // 仪表台光学反射基准线
    const lineGrad = ctx.createLinearGradient(boxX + 80, 0, boxX + boxW - 80, 0)
    lineGrad.addColorStop(0, 'rgba(255,255,255,0)')
    lineGrad.addColorStop(0.5, 'rgba(255,255,255,0.22)')
    lineGrad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.strokeStyle = lineGrad
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(boxX + 80, boxY + 530)
    ctx.lineTo(boxX + boxW - 80, boxY + 530)
    ctx.stroke()

    // 下半部：平放于仪表台的钛金属手机 (呈现水平镜像翻转 scaleX(-1))
    const flatX = W / 2 - 330
    const flatY = boxY + 610
    const flatW = 660
    const flatH = 320

    drawRoundRect(ctx, flatX - 6, flatY - 6, flatW + 12, flatH + 12, 48)
    ctx.fillStyle = '#2d2d35'
    ctx.fill()
    drawRoundRect(ctx, flatX, flatY, flatW, flatH, 42)
    ctx.fillStyle = '#030304'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'
    ctx.stroke()

    ctx.save()
    ctx.translate(W / 2, flatY + 185)
    ctx.scale(-1, 1)
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
    ctx.font = '200 145px "Outfit", "Inter", sans-serif'
    ctx.fillText('118.5', 0, 0)
    ctx.font = '400 22px "JetBrains Mono", monospace'
    ctx.fillText('KM/H  ·  ALT 420 m', 0, 50)
    ctx.restore()

    // 底部三档高定光学色温 (光学白 / 钛金属 / 香槟金)
    const tones = [
      { label: '● 光学白 WHITE', color: '#ffffff' },
      { label: '● 钛金属 TITANIUM', color: '#d4d4d8' },
      { label: '● 香槟金 CHAMPAGNE', color: '#e2c799' }
    ]
    tones.forEach((tn, idx) => {
      const tx = boxX + 205 + idx * 280
      const ty = boxY + 1015
      ctx.fillStyle = tn.color
      ctx.font = '500 20px "JetBrains Mono", "Inter", sans-serif'
      ctx.fillText(tn.label, tx, ty)
    })
  } else {
    // ==================== P4: 高定拉丝黑钛「FOUNDER PASS 创始内测官实体通行证」 ====================
    // 不再堆砌 4 个文字框，而是绘制一张极具收藏感的 Apple Wallet / Leica 风格黑钛金属实体卡
    const cardW = 920
    const cardH = 580
    const cardX = (W - cardW) / 2
    const cardY = 470

    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.95)'
    ctx.shadowBlur = 95
    ctx.shadowOffsetY = 40
    drawRoundRect(ctx, cardX, cardY, cardW, cardH, 48)
    const metalCard = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH)
    metalCard.addColorStop(0, '#23242a')
    metalCard.addColorStop(0.35, '#121216')
    metalCard.addColorStop(0.7, '#19191f')
    metalCard.addColorStop(1, '#0b0b0e')
    ctx.fillStyle = metalCard
    ctx.fill()
    ctx.restore()

    // 金属卡片斜向光泽与高光边框
    drawRoundRect(ctx, cardX, cardY, cardW, cardH, 48)
    const borderGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH)
    borderGrad.addColorStop(0, 'rgba(255,255,255,0.38)')
    borderGrad.addColorStop(0.5, 'rgba(255,255,255,0.1)')
    borderGrad.addColorStop(1, 'rgba(214,199,178,0.32)')
    ctx.strokeStyle = borderGrad
    ctx.lineWidth = 2.5
    ctx.stroke()

    // 卡片左上角品牌与右上角席位编号
    ctx.textAlign = 'left'
    ctx.fillStyle = '#ffffff'
    ctx.font = '600 26px "JetBrains Mono", monospace'
    ctx.fillText('● VELOCITY', cardX + 68, cardY + 86)

    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.font = '400 20px "JetBrains Mono", monospace'
    ctx.fillText('INSTRUMENT  ·  LIFETIME PASS', cardX + 68, cardY + 122)

    drawRoundRect(ctx, cardX + cardW - 245, cardY + 58, 178, 52, 26)
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.22)'
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.textAlign = 'center'
    ctx.fillStyle = '#e2c799'
    ctx.font = '600 21px "JetBrains Mono", monospace'
    ctx.fillText('NO. 001 / 100', cardX + cardW - 156, cardY + 91)

    // 卡片中央蚀刻大字
    ctx.textAlign = 'left'
    ctx.fillStyle = '#ffffff'
    ctx.font = '300 74px "Outfit", "Inter", sans-serif'
    ctx.fillText('FOUNDER EDITION', cardX + 68, cardY + 305)

    ctx.fillStyle = 'rgba(255,255,255,0.58)'
    ctx.font = '400 26px "Inter", "PingFang SC", sans-serif'
    ctx.fillText('首批 100 位创始内测官  ·  永久解锁全部高定材质与实景水印', cardX + 68, cardY + 365)

    // 卡片底部一客一码蚀刻序列号
    ctx.strokeStyle = 'rgba(255,255,255,0.09)'
    ctx.beginPath()
    ctx.moveTo(cardX + 68, cardY + 445)
    ctx.lineTo(cardX + cardW - 68, cardY + 445)
    ctx.stroke()

    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '500 21px "JetBrains Mono", monospace'
    ctx.fillText('PASS KEY   VELO - 8F3A - 9K2M', cardX + 68, cardY + 510)

    ctx.textAlign = 'right'
    ctx.fillStyle = '#ffffff'
    ctx.font = '500 21px "Inter", "PingFang SC", sans-serif'
    ctx.fillText('评论区留言获取专属内测码', cardX + cardW - 68, cardY + 510)

    // 卡片下方极简四项能力标签 (一行排开，克制留白)
    const pills = ['万米离线直测', '实景相册水印', '钛金与暖砂材质', '48 句走心旁白']
    const pillW = 212
    const pillGap = 24
    const totalPillW = pills.length * pillW + (pills.length - 1) * pillGap
    const startPillX = (W - totalPillW) / 2

    pills.forEach((p, idx) => {
      const px = startPillX + idx * (pillW + pillGap)
      const py = cardY + cardH + 110
      drawRoundRect(ctx, px, py, pillW, 64, 32)
      ctx.fillStyle = 'rgba(255,255,255,0.04)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.textAlign = 'center'
      ctx.fillStyle = 'rgba(255,255,255,0.82)'
      ctx.font = '500 23px "Inter", "PingFang SC", sans-serif'
      ctx.fillText(p, px + pillW / 2, py + 40)
    })
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
  link.download = `Velocity_Gallery_0${activeSlide.value + 1}.png`
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
      link.download = `Velocity_Gallery_0${i + 1}.png`
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
