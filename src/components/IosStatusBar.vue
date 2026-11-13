<template>
  <div class="w-full h-12 flex items-center justify-between px-7 pt-2 z-40 select-none text-white text-[13px] font-semibold tracking-tight relative shrink-0">
    <!-- 左侧时钟 -->
    <span class="tabular-nums font-medium">{{ currentTime }}</span>

    <!-- 中间灵动岛 (仅在电脑端样机框展示) -->
    <div
      v-if="showDynamicIsland"
      class="absolute left-1/2 -translate-x-1/2 top-2.5 w-24 h-6 rounded-full bg-black border border-white/10 flex items-center justify-end px-2 pointer-events-none"
    >
      <span class="w-2.5 h-2.5 rounded-full bg-[#16161a] border border-white/10"></span>
    </div>

    <!-- 右侧系统状态图标 (信号、Wi-Fi、电池) -->
    <div class="flex items-center space-x-1.5 text-white/90">
      <Signal class="w-3.5 h-3.5 stroke-[2]" />
      <Wifi class="w-3.5 h-3.5 stroke-[2]" />
      <BatteryMedium class="w-4 h-4 stroke-[2]" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Signal, Wifi, BatteryMedium } from 'lucide-vue-next'

defineProps<{
  showDynamicIsland?: boolean
}>()

const currentTime = ref('09:41')

let timer: number | null = null

function updateTime() {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  currentTime.value = `${hours}:${minutes}`
}

onMounted(() => {
  updateTime()
  timer = window.setInterval(updateTime, 10000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
