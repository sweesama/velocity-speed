<template>
  <div
    class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto"
    @click.self="$emit('close')"
  >
    <div
      class="w-full max-w-3xl bg-[#121216] border border-white/15 rounded-[28px] p-5 sm:p-6 text-white shadow-2xl flex flex-col animate-fade-in font-sans my-auto"
    >
      <!-- 顶部标题栏 -->
      <div class="flex items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
        <div>
          <div class="flex items-center space-x-2">
            <span class="px-2 py-0.5 rounded bg-white text-black font-mono text-[10px] font-bold uppercase">
              PROMO STUDIO
            </span>
            <h3 class="text-base sm:text-lg font-semibold tracking-tight">
              小红书 / 社媒 3:4 爆款宣传图与文案工坊
            </h3>
          </div>
          <p class="text-xs text-zinc-400 mt-1">
            专为小红书、即刻、朋友圈与 App Store 设计的 4 张 1242×1656 超清宣传套图，一键导出即可直接发帖
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

      <!-- 主体区: 左侧海报预览 + 右侧切换与一键发帖文案 -->
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
            分辨率：1242 × 1656 px (3:4 小红书黄金满屏比例 · 手机可长按保存)
          </span>
        </div>

        <!-- 右侧控制面板与配套爆款文案 (5列) -->
        <div class="md:col-span-5 flex flex-col justify-between space-y-4">
          <!-- 4 张宣传图切换 -->
          <div>
            <div class="text-xs font-medium text-zinc-400 mb-2">选择宣传图（共 4 张套图）：</div>
            <div class="space-y-2">
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
                  P{{ idx + 1 }}
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
              <span>下载当前海报 (P{{ activeSlide + 1 }})</span>
            </button>

            <button
              type="button"
              @click="downloadAllSlides"
              :disabled="isDownloadingAll"
              class="w-full py-2.5 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white font-medium text-xs btn-spring cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Sparkles class="w-3.5 h-3.5 stroke-[1.8]" />
              <span>{{ isDownloadingAll ? '正在依次导出 4 张套图...' : '一键导出全部 4 张小红书套图' }}</span>
            </button>
          </div>

          <!-- 配套小红书/朋友圈高赞文案一键复制 -->
          <div class="p-3.5 rounded-2xl bg-black/50 border border-white/[0.08] space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-semibold text-zinc-300">配套小红书首发爆款文案</span>
              <button
                type="button"
                @click="copyPostCopywriting"
                class="px-2.5 py-1 rounded-lg bg-white text-black text-[11px] font-semibold hover:bg-zinc-200 btn-spring cursor-pointer"
              >
                {{ copiedText ? '已复制全文 ✓' : '一键复制文案' }}
              </button>
            </div>
            <div class="text-[11px] text-zinc-400 leading-relaxed max-h-32 overflow-y-auto pr-1 whitespace-pre-line select-all">
              {{ xhsCopywriting }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Download, Sparkles, X } from 'lucide-vue-next'
import { playTactileTick } from '../services/audioCallouts'

defineEmits<{
  (e: 'close'): void
}>()

const activeSlide = ref(0)
const previewDataUrl = ref<string>('')
const isDownloadingAll = ref(false)
const copiedText = ref(false)

const slides = [
  { id: 'flight', name: '封面 1：万米高空 885 km/h 速度证书' },
  { id: 'dial', name: '配图 2：瑞士精密计时表盘 · 348 km/h 高铁' },
  { id: 'hud', name: '配图 3：前挡风玻璃光学 HUD 镜像投影' },
  { id: 'founder', name: '配图 4：4 大核心亮点与 100 席内测官招募' }
]

const xhsCopywriting = `标题：受够了满屏广告的测速App，我自己写了个徕卡风的 ✈️

一直想找一个干净、好看的实时测速与海拔表，在飞机靠窗、坐高铁或者夜间开车时看一眼真实速度和海拔，结果应用商店下了一圈全是弹窗广告和几十年前的汽配城界面。

干脆自己动手写了一个纯黑钛金属质感的实时测速与海拔仪 —— Velocity。

✨ 几个我自己最喜欢的小细节：
1. 飞机上开「飞行模式」也能测：直接读取手机底层卫星芯片的多普勒频移与几何海拔，坐飞机贴着舷窗就能测出 885 km/h 和 10600 米真实高空海拔。
2. 速度认证证书 + 实景照片水印：内置了 48 句走心社交文案（从工位带薪静止 0 km/h 到万米高空 VIP），还能导入你随手拍的窗外风景合成徕卡风测速海报。
3. 前挡风玻璃 HUD 投影：夜间开车平放在前挡风玻璃下，一键水平镜像翻转，直接把时速反射在玻璃上。
4. 100% 离线与隐私保护：0 服务器上传，添加到手机桌面后断网也能秒开。

🎁 首批 100 位「创始内测官」限免招募：
正式版准备定 ¥18 永久买断，现在刚上线，找 100 位朋友做首批内测官，免费送终身买断席位 + 海报专属「FOUNDER EDITION」激光刻印！

评论区扣 1 或者聊聊你准备在什么交通工具上测速，我私信发你独享的一客一码！

#独立开发 #极简App #飞机测速 #高铁测速 #自驾游 #车载HUD #小众宝藏App #实用工具`

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

function renderSlideToDataUrl(index: number): string {
  const canvas = document.createElement('canvas')
  const W = 1242
  const H = 1656
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  // 全局深邃曜石黑背景
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#0d0d11')
  bg.addColorStop(0.5, '#060608')
  bg.addColorStop(1, '#030304')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // 顶部铂金柔光
  const topGlow = ctx.createRadialGradient(W / 2, 220, 40, W / 2, 220, 680)
  topGlow.addColorStop(0, 'rgba(255,255,255,0.08)')
  topGlow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = topGlow
  ctx.fillRect(0, 0, W, H)

  // 顶部統一胶囊标签
  const topTag =
    index === 0
      ? 'VELOCITY · 首批 100 位创始内测官招募'
      : index === 1
        ? 'SWISS CHRONOGRAPH · 瑞士精密仪表美学'
        : index === 2
          ? 'OPTICAL WINDSHIELD HUD · 前挡光学投影'
          : 'FOUNDER EDITION · 零广告 · 100% 离线隐私'

  ctx.font = '600 24px "JetBrains Mono", "Inter", sans-serif'
  const tagW = ctx.measureText(topTag).width + 64
  drawRoundRect(ctx, (W - tagW) / 2, 86, tagW, 54, 27)
  ctx.fillStyle = 'rgba(255,255,255,0.07)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.16)'
  ctx.lineWidth = 1.5
  ctx.stroke()

  ctx.textAlign = 'center'
  ctx.fillStyle = '#e4e4e7'
  ctx.fillText(topTag, W / 2, 121)

  // 主标题 & 副标题
  const titles = [
    {
      t1: '坐飞机开飞行模式',
      t2: '也能测出 885 km/h？',
      sub: '极简徕卡风实时测速与万米高空海拔仪 · 100% 离线可用'
    },
    {
      t1: '348 km/h 贴地飞行',
      t2: '手里的冰美式纹丝不动',
      sub: '60 帧卡尔曼平滑滤波 · 静止零漂移 · 移动自动开始计时'
    },
    {
      t1: '手机平放前挡风玻璃下',
      t2: '秒变百万豪车光学 HUD',
      sub: '一键开启水平镜像翻转 · 纯白 / 航空翠绿 / 夜航琥珀三色温'
    },
    {
      t1: '受够了满屏广告的测速 App',
      t2: '我自己写了一个纯粹的',
      sub: '无需注册登录 · 零服务器上传 · 48 句走心社交金句'
    }
  ][index]

  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffffff'
  ctx.font = '700 68px "Inter", "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText(titles.t1, W / 2, 235)
  ctx.fillText(titles.t2, W / 2, 322)

  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font = '400 30px "Inter", "PingFang SC", sans-serif'
  ctx.fillText(titles.sub, W / 2, 386)

  // 中央主视觉区 (Y: 450 -> 1460)
  if (index === 0) {
    // 绘制 iPhone 16 Pro 钛金属样机框展示速度证书
    const phoneX = 196
    const phoneY = 445
    const phoneW = 850
    const phoneH = 1020

    drawRoundRect(ctx, phoneX - 14, phoneY - 14, phoneW + 28, phoneH + 28, 76)
    ctx.fillStyle = '#242429'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.22)'
    ctx.lineWidth = 3
    ctx.stroke()

    drawRoundRect(ctx, phoneX, phoneY, phoneW, phoneH, 64)
    const cardGrad = ctx.createLinearGradient(phoneX, phoneY, phoneX, phoneY + phoneH)
    cardGrad.addColorStop(0, '#18191e')
    cardGrad.addColorStop(1, '#08080b')
    ctx.fillStyle = cardGrad
    ctx.fill()

    // 灵动岛
    drawRoundRect(ctx, W / 2 - 90, phoneY + 24, 180, 38, 19)
    ctx.fillStyle = '#000000'
    ctx.fill()

    // 内部证书卡片
    const cX = phoneX + 48
    const cY = phoneY + 95
    const cW = phoneW - 96
    const cH = phoneH - 145
    drawRoundRect(ctx, cX, cY, cW, cH, 44)
    ctx.fillStyle = '#0f1014'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.14)'
    ctx.lineWidth = 2
    ctx.stroke()

    // 证书顶栏
    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.font = '600 20px "JetBrains Mono", monospace'
    ctx.fillText('● VELOCITY · FOUNDER EDITION', cX + 44, cY + 64)

    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.font = '400 26px "Inter", "PingFang SC", sans-serif'
    ctx.fillText('航班 CA1501 · 万米平流层巡航', cX + 44, cY + 106)

    // 右上角勋章
    drawRoundRect(ctx, cX + cW - 230, cY + 48, 186, 50, 25)
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.stroke()
    ctx.textAlign = 'center'
    ctx.fillStyle = '#ffffff'
    ctx.font = '500 22px "Inter", "PingFang SC", sans-serif'
    ctx.fillText('万米高空VIP', cX + cW - 137, cY + 81)

    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.beginPath()
    ctx.moveTo(cX + 44, cY + 138)
    ctx.lineTo(cX + cW - 44, cY + 138)
    ctx.stroke()

    // 中央大数字 885 KM/H
    ctx.fillStyle = 'rgba(255,255,255,0.42)'
    ctx.font = '600 20px "JetBrains Mono", monospace'
    ctx.fillText('今日最高速度', W / 2, cY + 215)

    ctx.fillStyle = '#ffffff'
    ctx.font = '200 210px "Outfit", "Inter", sans-serif'
    ctx.fillText('885', W / 2 - 36, cY + 410)
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.font = '400 34px "JetBrains Mono", monospace'
    ctx.fillText('KM/H', W / 2 + 185, cY + 410)

    // 走心金句 (严格语义断行)
    ctx.fillStyle = '#ffffff'
    ctx.font = '500 30px "Inter", "PingFang SC", sans-serif'
    ctx.fillText('今日速度超越了全球 99.94% 的人类', W / 2, cY + 505)
    ctx.fillText('正在一万米高空优雅地喝加冰可乐', W / 2, cY + 552)

    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = '400 24px "Inter", "PingFang SC", sans-serif'
    ctx.fillText('窗外零下 50°C、时速近千公里', W / 2, cY + 610)
    ctx.fillText('地面的鸡毛蒜皮，在云层上连像素都不算', W / 2, cY + 648)

    // 底部四联数据栏
    const gTop = cY + 705
    const gBot = cY + 820
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.beginPath()
    ctx.moveTo(cX + 44, gTop)
    ctx.lineTo(cX + cW - 44, gTop)
    ctx.moveTo(cX + 44, gBot)
    ctx.lineTo(cX + cW - 44, gBot)
    ctx.stroke()

    const stats = [
      { l: '平均速度', v: '812 km/h' },
      { l: '最高海拔', v: '10600 m' },
      { l: '累计里程', v: '1240.5 km' },
      { l: '有效时长', v: '01:32:15' }
    ]
    const colW = (cW - 88) / 4
    stats.forEach((s, i) => {
      const sx = cX + 44 + colW * i + colW / 2
      ctx.fillStyle = 'rgba(255,255,255,0.45)'
      ctx.font = '400 20px "Inter", "PingFang SC", sans-serif'
      ctx.fillText(s.l, sx, gTop + 44)
      ctx.fillStyle = '#ffffff'
      ctx.font = '600 25px "JetBrains Mono", monospace'
      ctx.fillText(s.v, sx, gTop + 86)
    })
  } else if (index === 1) {
    // 配图 2: 瑞士精密单色计时表盘 (348 km/h)
    const phoneX = 196
    const phoneY = 445
    const phoneW = 850
    const phoneH = 1020

    drawRoundRect(ctx, phoneX - 14, phoneY - 14, phoneW + 28, phoneH + 28, 76)
    ctx.fillStyle = '#242429'
    ctx.fill()
    drawRoundRect(ctx, phoneX, phoneY, phoneW, phoneH, 64)
    ctx.fillStyle = '#070709'
    ctx.fill()

    // 绘制精密表盘
    const cx = W / 2
    const cy = phoneY + 460
    const outerR = 310

    ctx.beginPath()
    ctx.arc(cx, cy, outerR + 22, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
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
            : 'rgba(255,255,255,0.1)'
      ctx.lineWidth = isMajor ? 5.5 : 3
      ctx.lineCap = 'round'
      ctx.stroke()
    }

    // 内圈罗盘虚线环
    ctx.beginPath()
    ctx.arc(cx, cy, 230, 0, Math.PI * 2)
    ctx.setLineDash([6, 12])
    ctx.strokeStyle = 'rgba(255,255,255,0.14)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.setLineDash([])

    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255,255,255,0.65)'
    ctx.font = '600 24px "JetBrains Mono", monospace'
    ctx.fillText('285° 西北', cx, cy - 115)

    ctx.fillStyle = '#ffffff'
    ctx.font = '200 175px "Outfit", "Inter", sans-serif'
    ctx.fillText('348', cx - 18, cy + 45)
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.font = '200 58px "Outfit", sans-serif'
    ctx.fillText('.4', cx + 155, cy + 45)

    drawRoundRect(ctx, cx - 80, cy + 85, 160, 48, 24)
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.font = '500 24px "JetBrains Mono", monospace'
    ctx.fillText('KM/H', cx, cy + 117)

    // 底部三列指标
    const bY = phoneY + 850
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.beginPath()
    ctx.moveTo(phoneX + 64, bY)
    ctx.lineTo(phoneX + phoneW - 64, bY)
    ctx.stroke()

    const bStats = [
      { l: '最高速度', v: '351', u: 'KM/H', x: phoneX + 140 },
      { l: '海拔高度', v: '164', u: '↑0.8m/s · m', x: W / 2 },
      { l: '累计里程', v: '528.6', u: 'km', x: phoneX + phoneW - 140 }
    ]
    bStats.forEach((b) => {
      ctx.fillStyle = 'rgba(255,255,255,0.45)'
      ctx.font = '500 22px "Inter", "PingFang SC", sans-serif'
      ctx.fillText(b.l, b.x, bY + 48)
      ctx.fillStyle = '#ffffff'
      ctx.font = '300 54px "Outfit", sans-serif'
      ctx.fillText(b.v, b.x, bY + 108)
      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      ctx.font = '400 20px "JetBrains Mono", monospace'
      ctx.fillText(b.u, b.x, bY + 142)
    })
  } else if (index === 2) {
    // 配图 3: 前挡风玻璃 HUD 镜像模式展示
    const boxX = 120
    const boxY = 455
    const boxW = W - 240
    const boxH = 980

    drawRoundRect(ctx, boxX, boxY, boxW, boxH, 52)
    ctx.fillStyle = '#050507'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 2.5
    ctx.stroke()

    // 上半部：前挡风玻璃正向虚像投影 (航空翠绿 #00ff66)
    ctx.save()
    const hudGlow = ctx.createRadialGradient(W / 2, boxY + 290, 20, W / 2, boxY + 290, 380)
    hudGlow.addColorStop(0, 'rgba(0, 255, 102, 0.14)')
    hudGlow.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = hudGlow
    ctx.fillRect(boxX, boxY, boxW, 540)

    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.font = '500 24px "Inter", "PingFang SC", sans-serif'
    ctx.fillText('▲ 前挡风玻璃 / 客舱舷窗 光学反射正向成像', W / 2, boxY + 80)

    ctx.fillStyle = '#00ff66'
    ctx.font = '200 230px "Outfit", "Inter", sans-serif'
    ctx.fillText('118', W / 2 - 30, boxY + 315)
    ctx.font = '200 72px "Outfit", sans-serif'
    ctx.fillText('.5', W / 2 + 190, boxY + 315)

    ctx.font = '500 32px "JetBrains Mono", monospace'
    ctx.fillStyle = 'rgba(0, 255, 102, 0.75)'
    ctx.fillText('KM/H   ·   ALT 420 m   ·   310° NW', W / 2, boxY + 390)
    ctx.restore()

    // 中间中控台分界线
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.setLineDash([10, 10])
    ctx.beginPath()
    ctx.moveTo(boxX + 60, boxY + 510)
    ctx.lineTo(boxX + boxW - 60, boxY + 510)
    ctx.stroke()
    ctx.setLineDash([])

    // 下半部：平放的手机屏幕镜像画面 (scaleX(-1))
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.font = '500 24px "Inter", "PingFang SC", sans-serif'
    ctx.fillText('▼ 手机平放于仪表台（开启 HUD 镜像翻转模式）', W / 2, boxY + 575)

    ctx.save()
    ctx.translate(W / 2, boxY + 770)
    ctx.scale(-1, 1)
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(0, 255, 102, 0.45)'
    ctx.font = '200 170px "Outfit", "Inter", sans-serif'
    ctx.fillText('118.5', 0, 0)
    ctx.font = '500 26px "JetBrains Mono", monospace'
    ctx.fillText('KM/H · ALT 420 m', 0, 56)
    ctx.restore()

    // 三色温标签展示
    const themes = [
      { name: '纯白光学 WHITE', color: '#ffffff' },
      { name: '航空翠绿 GREEN', color: '#00ff66' },
      { name: '夜航琥珀 AMBER', color: '#ffb800' }
    ]
    themes.forEach((th, idx) => {
      const tx = boxX + 185 + idx * 315
      const ty = boxY + 910
      drawRoundRect(ctx, tx - 135, ty - 34, 270, 52, 26)
      ctx.fillStyle = 'rgba(255,255,255,0.05)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'
      ctx.stroke()
      ctx.fillStyle = th.color
      ctx.font = '600 22px "JetBrains Mono", "Inter", sans-serif'
      ctx.fillText(th.name, tx, ty)
    })
  } else {
    // 配图 4: 四大核心卖点 2x2 建筑卡片 + 内测官福利
    const cards = [
      {
        num: '01 · OFFLINE GPS',
        title: '万米高空飞行模式直测',
        d1: '无需任何手机流量或 Wi-Fi 网络',
        d2: '通过卫星多普勒频移直测速度与真实海拔'
      },
      {
        num: '02 · PHOTO STUDIO',
        title: '实景相册水印证书合拍',
        d1: '支持导入机舱舷窗、自驾旅途实拍风景',
        d2: '一键合成曜石黑、钛金属、暖砂金高定大片'
      },
      {
        num: '03 · 48 VIRAL QUOTES',
        title: '48 句走心社交段子引擎',
        d1: '从工位带薪静止 0 km/h 到万米高空 900 km/h',
        d2: '中英双语母语级梗库，手工排版绝不断词'
      },
      {
        num: '04 · 100% PRIVATE',
        title: '零广告 · 零服务器上传',
        d1: '无需手机号注册登录，不收集任何轨迹隐私',
        d2: '添加到手机桌面即可获得无边框全屏体验'
      }
    ]

    const startX = 110
    const startY = 460
    const cardW = 495
    const cardH = 380
    const gap = 32

    cards.forEach((c, i) => {
      const col = i % 2
      const row = Math.floor(i / 2)
      const x = startX + col * (cardW + gap)
      const y = startY + row * (cardH + gap)

      drawRoundRect(ctx, x, y, cardW, cardH, 36)
      ctx.fillStyle = '#121318'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.14)'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.textAlign = 'left'
      ctx.fillStyle = 'rgba(255,255,255,0.45)'
      ctx.font = '600 22px "JetBrains Mono", monospace'
      ctx.fillText(c.num, x + 44, y + 72)

      ctx.fillStyle = '#ffffff'
      ctx.font = '700 38px "Inter", "PingFang SC", sans-serif'
      ctx.fillText(c.title, x + 44, y + 145)

      ctx.fillStyle = 'rgba(255,255,255,0.62)'
      ctx.font = '400 25px "Inter", "PingFang SC", sans-serif'
      ctx.fillText(c.d1, x + 44, y + 235)
      ctx.fillText(c.d2, x + 44, y + 282)
    })

    // 底部内测招募大横幅
    const bX = 110
    const bY = 1285
    const bW = W - 220
    const bH = 155
    drawRoundRect(ctx, bX, bY, bW, bH, 36)
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.24)'
    ctx.stroke()

    ctx.textAlign = 'center'
    ctx.fillStyle = '#ffffff'
    ctx.font = '700 34px "Inter", "PingFang SC", sans-serif'
    ctx.fillText('🎁 首批 100 位「创始内测官」限时免费招募中（原价 ¥18 终身买断）', W / 2, bY + 66)
    ctx.fillStyle = 'rgba(255,255,255,0.68)'
    ctx.font = '400 26px "Inter", "PingFang SC", sans-serif'
    ctx.fillText('评论区留言获取独享一客一码 · 解锁海报专属「FOUNDER EDITION」激光刻印', W / 2, bY + 116)
  }

  // 底部统一品牌落款
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255,255,255,0.38)'
  ctx.font = '500 23px "JetBrains Mono", "Inter", sans-serif'
  ctx.fillText('● VELOCITY INSTRUMENT   ·   REAL-TIME GPS SPEEDOMETER & ALTIMETER', W / 2, 1575)

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
  link.download = `Velocity_Promo_P${activeSlide.value + 1}.png`
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
      link.download = `Velocity_Promo_P${i + 1}.png`
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
    await navigator.clipboard.writeText(xhsCopywriting)
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
