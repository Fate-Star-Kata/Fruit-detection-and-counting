<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

interface Props {
    unreadCount: number
}

defineProps<Props>()

const emit = defineEmits<{
    click: []
}>()

const handleClick = () => {
    emit('click')
}
</script>

<template>
    <div class="relative">
        <button class="btn btn-ghost btn-circle" aria-label="Notifications" @click="handleClick">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
        </button>
        <!-- 未读消息小红点 -->
        <span v-if="unreadCount > 0"
            class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-medium shadow-sm">
            {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
    </div>
</template>

<style scoped>
/* 组件样式 */
</style>

