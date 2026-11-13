<template>
  <div
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md transition-all duration-300"
    @click.self="$emit('dismiss')"
  >
    <div
      class="w-full max-w-sm bg-[#16161a] border border-white/10 rounded-t-[32px] sm:rounded-[32px] p-6 text-white shadow-2xl relative flex flex-col items-center animate-fade-in"
    >
      <div class="w-10 h-1 bg-white/20 rounded-full mb-4 sm:hidden"></div>

      <button
        type="button"
        @click="$emit('dismiss')"
        class="absolute top-5 right-5 p-1.5 rounded-full text-zinc-500 hover:text-white hover:bg-white/10 transition cursor-pointer"
        aria-label="Close"
      >
        <X class="w-4 h-4" />
      </button>

      <div class="w-14 h-14 rounded-2xl apple-pill flex items-center justify-center mb-4 text-white">
        <Radio class="w-7 h-7 stroke-[1.6]" />
      </div>

      <h3 class="text-xl font-semibold tracking-tight text-center">
        {{ isDenied ? t.permTitleDenied : isReady ? t.permTitleReady : t.permTitleDefault }}
      </h3>
      <p class="text-[12px] text-zinc-400 text-center mt-1.5 px-2 leading-[1.65] whitespace-pre-line">
        {{
          isDenied
            ? t.permDescDenied
            : isReady
            ? t.permDescReady
            : t.permDescDefault
        }}
      </p>

      <div class="w-full my-5 space-y-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-left">
        <div class="flex items-start space-x-3">
          <Gauge class="w-4 h-4 text-white shrink-0 mt-0.5 stroke-[1.8]" />
          <div>
            <div class="text-xs font-semibold text-white">{{ t.benefit1Title }}</div>
            <div class="text-[11px] text-zinc-400 mt-0.5 leading-[1.6] whitespace-pre-line">
              {{ t.benefit1Desc }}
            </div>
          </div>
        </div>

        <div class="flex items-start space-x-3 pt-2.5 border-t border-white/[0.05]">
          <Mountain class="w-4 h-4 text-white shrink-0 mt-0.5 stroke-[1.8]" />
          <div>
            <div class="text-xs font-semibold text-white">{{ t.benefit2Title }}</div>
            <div class="text-[11px] text-zinc-400 mt-0.5 leading-[1.6] whitespace-pre-line">
              {{ t.benefit2Desc }}
            </div>
          </div>
        </div>

        <div class="flex items-start space-x-3 pt-2.5 border-t border-white/[0.05]">
          <ShieldCheck class="w-4 h-4 text-white shrink-0 mt-0.5 stroke-[1.8]" />
          <div>
            <div class="text-xs font-semibold text-white">{{ t.benefit3Title }}</div>
            <div class="text-[11px] text-zinc-400 mt-0.5 leading-[1.6] whitespace-pre-line">
              {{ t.benefit3Desc }}
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="isDenied"
        class="w-full mb-4 px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.12] text-[11px] text-zinc-200 leading-relaxed"
      >
        <div class="font-semibold mb-1">{{ t.recoverTitle }}</div>
        <p>{{ t.recoverStep1 }}</p>
        <p class="mt-0.5">{{ t.recoverStep2 }}</p>
      </div>

      <div class="w-full space-y-2">
        <button
          type="button"
          @click="onRequestPermission"
          class="w-full py-3.5 px-4 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 btn-spring cursor-pointer shadow-lg flex items-center justify-center space-x-2"
        >
          <span>{{ isDenied ? t.btnPermDenied : isReady ? t.btnPermReady : t.btnPermDefault }}</span>
        </button>

        <button
          type="button"
          @click="$emit('dismiss')"
          class="w-full py-2.5 px-4 rounded-xl text-zinc-500 hover:text-zinc-300 text-xs btn-spring cursor-pointer text-center"
        >
          {{ isReady ? t.btnPermDismissReady : t.btnPermDismissDefault }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Radio, Gauge, Mountain, ShieldCheck, X } from 'lucide-vue-next'
import { telemetryService } from '../services/telemetryManager'
import { useI18n } from '../services/i18n'
import type { GpsStatus, AppLanguage } from '../types'

const props = defineProps<{
  gpsStatus: GpsStatus
  lang?: AppLanguage
}>()

const emit = defineEmits<{
  (e: 'dismiss'): void
}>()

const t = computed(() => useI18n(props.lang || 'zh'))

const isDenied = computed(() => props.gpsStatus === 'DENIED')
const isReady = computed(() => props.gpsStatus === 'READY')

async function onRequestPermission() {
  await telemetryService.requestMotionPermission()
  telemetryService.startHardwareSensors()
  emit('dismiss')
}
</script>
