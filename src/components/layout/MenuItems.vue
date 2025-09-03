<script setup lang="ts">
import type { MenuItem } from '@/types/components/header'
import { inject } from 'vue'

interface Props {
  menuItems: MenuItem[]
}

defineProps<Props>()
// 注入菜单状态管理函数
const isMenuExpanded = inject<(id: string) => boolean>('isMenuExpanded')!
const toggleSubmenu = inject<(id: string) => void>('toggleSubmenu')!
</script>

<template>
  <template v-for="item in menuItems" :key="item.id">
    <!-- 无子菜单的项目 -->
    <li v-if="!item.children" v-show="!item.hide">
      <RouterLink :to="item.href as string" class="flex items-center">
        <i v-if="typeof item.icon === 'string'" v-text="item.icon" class="mr-2" />
        <component v-else-if="item.icon !== null" :is="item.icon" class="mr-2" />
        {{ item.label }}
      </RouterLink>
    </li>
    <!-- 有子菜单的项目 -->
    <li v-else v-show="!item.hide">
      <details :open="isMenuExpanded(item.id)">
        <summary class="flex items-center" @click.prevent="toggleSubmenu(item.id)">
          <i v-if="typeof item.icon === 'string'" v-text="item.icon" class="mr-2" />
          <component v-else-if="item.icon !== null" :is="item.icon" class="mr-2" />
          {{ item.label }}
        </summary>
        <ul style="width: max-content;z-index: 999;">
          <template v-for="child in item.children" :key="child.id">
            <!-- 二级菜单无子项 -->
            <li v-if="!child.children" v-show="!child.hide">
              <RouterLink :to="child.href as string">{{ child.label }}</RouterLink>
            </li>
            <!-- 二级菜单有子项 -->
            <li v-else v-show="!child.hide">
              <details :open="isMenuExpanded(child.id)">
                <summary @click.prevent="toggleSubmenu(child.id)">
                  {{ child.label }}
                </summary>
                <ul>
                  <li v-for="grandchild in child.children" :key="grandchild.id" v-show="!grandchild.hide">
                    <RouterLink :to="grandchild.href as string">
                      {{ grandchild.label }}
                    </RouterLink>
                  </li>
                </ul>
              </details>
            </li>
          </template>
        </ul>
      </details>
    </li>
  </template>
</template>
