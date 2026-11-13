<template>
  <nav class="w-full bg-[#0c0c0f]/90 backdrop-blur-2xl border-t border-white/[0.07] px-6 py-1.5 flex items-center justify-around z-40 select-none safe-bottom">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      @click="onSelect(tab.id)"
      class="flex-1 flex flex-col items-center justify-center py-1 transition-all duration-200 cursor-pointer active:scale-95 relative"
      :class="currentTab === tab.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'"
      :aria-label="tab.label"
    >
      <!-- 顶部微光激活指示点 -->
      <span
        class="w-4 h-0.5 rounded-full mb-1 transition-all duration-200"
        :class="currentTab === tab.id ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] opacity-100' : 'opacity-0'"
      ></span>

      <!-- 定制级精密线性图标 -->
      <svg
        v-if="tab.id === 'dashboard'"
        class="w-5 h-5 transition-transform duration-200"
        :class="currentTab === tab.id ? 'scale-105' : ''"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        :stroke-width="currentTab === tab.id ? '2' : '1.6'"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M4.93 19.07a10 10 0 1 1 14.14 0" />
        <path d="M12 12l4.5-4.5" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>

      <svg
        v-else-if="tab.id === 'reports'"
        class="w-5 h-5 transition-transform duration-200"
        :class="currentTab === tab.id ? 'scale-105' : ''"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        :stroke-width="currentTab === tab.id ? '2' : '1.6'"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="4" y="3" width="16" height="18" rx="3" />
        <path d="M8 14l2.5-2.5 2.5 2 3-3.5" />
        <path d="M8 8h4" />
        <path d="M8 17.5h8" />
      </svg>

      <svg
        v-else
        class="w-5 h-5 transition-transform duration-200"
        :class="currentTab === tab.id ? 'scale-105' : ''"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        :stroke-width="currentTab === tab.id ? '2' : '1.6'"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="4" y1="7" x2="20" y2="7" />
        <line x1="4" y1="17" x2="20" y2="17" />
        <circle cx="9" cy="7" r="2.5" fill="#0c0c0f" />
        <circle cx="15" cy="17" r="2.5" fill="#0c0c0f" />
      </svg>

      <span
        class="text-[10px] tracking-tight mt-1 whitespace-nowrap transition-colors duration-200"
        :class="currentTab === tab.id ? 'font-medium text-white' : 'font-normal text-zinc-500'"
      >
        {{ tab.label }}
      </span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AppTab, AppLanguage } from '../types'
import { useI18n } from '../services/i18n'

const props = defineProps<{
  currentTab: AppTab
  lang?: AppLanguage
}>()

const emit = defineEmits<{
  (e: 'update:currentTab', tab: AppTab): void
}>()

const t = computed(() => useI18n(props.lang || 'zh'))

function onSelect(id: AppTab) {
  emit('update:currentTab', id)
}

const tabs = computed(() => [
  { id: 'dashboard' as AppTab, label: t.value.tabDashboard },
  { id: 'reports' as AppTab, label: t.value.tabReports },
  { id: 'settings' as AppTab, label: t.value.tabSettings }
])
</script>
