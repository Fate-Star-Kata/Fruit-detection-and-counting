<template>
  <div class="h-[90vh] bg-base-100 text-base-content flex flex-col overflow-hidden">
    <!-- 主要内容区域 -->
    <div class="flex-1 flex flex-col justify-center items-center px-4">
      <!-- 标题区域 -->
      <div class="text-center space-y-6 mb-8">
        <RevealMotion :delay="0">
          <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight">
            水果识别计数系统
          </h1>
        </RevealMotion>

        <RevealMotion :delay="0.1">
          <p class="text-lg md:text-xl opacity-70">
            基于YOLO深度学习的智能水果检测与计数平台
          </p>
        </RevealMotion>

        <RevealMotion :delay="0.2">
          <div class="flex items-center justify-center gap-3 pt-2">
            <a class="btn btn-primary rounded-full px-6">开始检测</a>
            <a class="btn btn-outline rounded-full px-6">功能介绍</a>
          </div>
        </RevealMotion>
      </div>

      <!-- 功能亮点：紧凑布局 -->
      <div class="max-w-4xl w-full">
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <RevealMotion v-for="(f, i) in features" :key="i" :delay="i * 0.08">
            <div class="card bg-base-200 shadow-sm hover:shadow-md transition rounded-xl">
              <div class="card-body p-4">
                <h3 class="card-title text-sm">{{ f.title }}</h3>
                <p class="opacity-70 text-xs">{{ f.desc }}</p>
              </div>
            </div>
          </RevealMotion>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <footer class="border-t border-base-200 py-4 text-center text-sm opacity-70">
      {{ footerText }}
    </footer>
  </div>
</template>

<script setup lang="ts">
/**
 * 动画说明：
 * - 使用你指定的 motion-v：import { Motion } from 'motion-v'
 * - RevealMotion 组件内部用 IntersectionObserver 监听进入视口
 * - 初始：opacity 0 + y 16；进入：opacity 1 + y 0
 */
import { h, defineComponent, onMounted, onBeforeUnmount, ref, computed } from "vue";
import { Motion } from "motion-v";

const footerText = import.meta.env.VITE_APP_FOOTER || "版权所有 © 2025 水果识别计数系统";

type RevealProps = { delay?: number };
const RevealMotion = defineComponent<RevealProps>({
  name: "RevealMotion",
  props: { delay: { type: Number, default: 0 } },
  setup(props, { slots }) {
    const el = ref<HTMLElement | null>(null);
    const inView = ref(false);
    let io: IntersectionObserver | null = null;

    // 使用 computed 来确保响应式更新
    const animateProps = computed(() => {
      return inView.value
        ? { opacity: 1, y: 0, transition: { duration: 0.6, delay: props.delay } }
        : { opacity: 0, y: 16 };
    });

    onMounted(() => {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              inView.value = true;
              // 只动画一次，注释掉下一行可反复触发
              io?.unobserve(e.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      if (el.value) io.observe(el.value);
    });

    onBeforeUnmount(() => io?.disconnect());

    return () =>
      h(
        "div",
        {
          ref: el,
        },
        [
          h(
            // Motion 组件：用 initial + animate
            Motion as any,
            {
              initial: { opacity: 0, y: 16 },
              animate: animateProps.value,
            },
            slots
          )
        ]
      );
  },
});

// 水果识别计数系统功能特点
const features = [
  { title: "智能识别", desc: "基于YOLO算法的高精度水果检测。" },
  { title: "实时计数", desc: "快速准确的水果数量统计分析。" },
  { title: "多种水果", desc: "支持苹果、橙子、香蕉等多种水果。" },
  { title: "批量处理", desc: "支持图片批量上传和检测处理。" },
  { title: "结果导出", desc: "检测结果可视化展示和数据导出。" },
  { title: "响应式设计", desc: "适配桌面端、平板和移动设备。" },
];
</script>

<style scoped>
/* 禁用滚动 */
html,
body {
  overflow: hidden;
}

</style>
