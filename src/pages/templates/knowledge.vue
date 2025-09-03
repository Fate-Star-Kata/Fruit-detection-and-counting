<template>
  <div class="min-h-full w-full">
    <!-- Page Header -->
    <section class="relative overflow-hidden">
      <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div class="flex items-center gap-4">
          <div
            class="rounded-full w-14 h-14 bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
            <el-icon class="text-3xl">
              <Collection />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold tracking-tight">分类知识</h1>
            <p class="text-gray-500 mt-1 text-sm">学习垃圾分类指南、环保小贴士与政策法规，提升环保意识与行动力</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Tabs -->
    <section class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-10">
      <el-tabs v-model="activeTab" type="border-card" class="rounded-xl overflow-hidden">
        <!-- 分类指南 -->
        <el-tab-pane label="分类指南" name="guide">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <article v-for="cat in categories" :key="cat.key"
              class="rounded-xl border border-gray-100/60 bg-white/80 backdrop-blur p-5 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex items-center gap-4">
                <div class="rounded-full w-14 h-14 flex items-center justify-center flex-shrink-0 shadow-sm"
                  :class="cat.color">
                  <el-icon class="text-3xl">
                    <component :is="cat.icon" />
                  </el-icon>
                </div>
                <div class="min-w-0">
                  <h3 class="text-lg font-semibold leading-tight">{{ cat.title }}</h3>
                  <p class="text-gray-500 text-sm mt-0.5">定义：{{ cat.definition }}</p>
                </div>
              </div>

              <div class="mt-4">
                <h4 class="font-medium mb-2 text-gray-700">包含物品</h4>
                <ul class="space-y-2">
                  <li v-for="(it, idx) in cat.items" :key="idx" class="flex items-center gap-2 text-gray-700">
                    <el-icon class="text-emerald-500 flex-shrink-0">
                      <CircleCheckFilled />
                    </el-icon>
                    <span class="leading-6">{{ it }}</span>
                  </li>
                </ul>
              </div>

              <div class="mt-4 border-t pt-4">
                <div class="flex items-center gap-2 text-amber-600">
                  <el-icon class="flex-shrink-0 text-xl">
                    <BellFilled />
                  </el-icon>
                  <p class="font-medium">投放提示</p>
                </div>
                <p class="text-gray-700 mt-1 leading-6">{{ cat.tip }}</p>
              </div>
            </article>
          </div>
        </el-tab-pane>

        <!-- 环保小贴士 -->
        <el-tab-pane label="环保小贴士" name="tips">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <article v-for="(t, idx) in ecoTips" :key="idx"
              class="group rounded-xl border border-gray-100/60 bg-white/80 backdrop-blur p-5 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex items-center gap-3">
                <div
                  class="rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 shadow-sm bg-sky-100 text-sky-600">
                  <el-icon class="text-2xl">
                    <component :is="t.icon" />
                  </el-icon>
                </div>
                <h3 class="text-base font-semibold leading-tight">{{ t.title }}</h3>
              </div>
              <p class="text-gray-700 mt-3 leading-6">{{ t.desc }}</p>
            </article>
          </div>
        </el-tab-pane>

        <!-- 政策法规 -->
        <el-tab-pane label="政策法规" name="policy">
          <div class="space-y-4">
            <article v-for="(p, idx) in policies" :key="idx"
              class="rounded-xl border border-gray-100/60 bg-white/80 backdrop-blur p-5 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex items-center gap-3">
                <div
                  class="rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 shadow-sm bg-purple-100 text-purple-600">
                  <el-icon class="text-2xl">
                    <Document />
                  </el-icon>
                </div>
                <div class="min-w-0">
                  <h3 class="text-base font-semibold leading-tight">{{ p.title }}</h3>
                  <p class="text-gray-500 text-sm mt-0.5">{{ p.date }}</p>
                </div>
              </div>
              <p class="text-gray-700 mt-3 leading-6">{{ p.desc }}</p>
            </article>
          </div>
        </el-tab-pane>
      </el-tabs>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Collection,
  Refresh,
  TakeawayBox,
  WarningFilled,
  DeleteFilled,
  CircleCheckFilled,
  BellFilled,
  GoodsFilled,
  RefreshRight,
  GobletSquareFull,
  MagicStick,
  Document,
} from '@element-plus/icons-vue'

const activeTab = ref<'guide' | 'tips' | 'policy'>('guide')

type Category = {
  key: string
  title: string
  definition: string
  items: string[]
  tip: string
  icon: any
  color: string // bg/text color classes for the icon circle
}

const categories: Category[] = [
  {
    key: 'recyclable',
    title: '可回收垃圾',
    definition: '可以再生循环的垃圾',
    items: ['塑料瓶/塑料袋', '纸张/纸箱', '金属罐/易拉罐', '玻璃瓶', '旧衣物/鞋子'],
    tip: '投放前请清洗干净，压扁节省空间，分类投放至蓝色回收桶',
    icon: Refresh,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    key: 'kitchen',
    title: '厨余垃圾',
    definition: '易腐烂的生物质废料',
    items: ['剩菜剩饭', '蔬菜水果皮', '肉骨头/鱼刺', '蛋壳/茶叶渣', '过期食品'],
    tip: '沥干水分后投放，避免渗漏与异味，可使用可降解垃圾袋',
    icon: TakeawayBox,
    color: 'bg-green-100 text-green-600',
  },
  {
    key: 'hazardous',
    title: '有害垃圾',
    definition: '对环境有害的垃圾，需要特殊处理',
    items: ['废电池/充电宝', '废灯管/节能灯', '过期药品', '油漆/农药', '温度计/血压计'],
    tip: '请密封后投放至红色有害垃圾箱，切勿与其他垃圾混投',
    icon: WarningFilled,
    color: 'bg-red-100 text-red-600',
  },
  {
    key: 'other',
    title: '其他垃圾',
    definition: '除上述之外的垃圾',
    items: ['烟蒂/烟灰', '污染纸张', '破碎陶瓷', '猫砂/尿不湿', '一次性餐具'],
    tip: '请尽量减量化，密封投放，统一焚烧或卫生填埋处理',
    icon: DeleteFilled,
    color: 'bg-gray-100 text-gray-600',
  },
]

type EcoTip = { title: string; desc: string; icon: any }

const ecoTips: EcoTip[] = [
  {
    title: '减少使用一次性用品',
    desc: '外出自备餐具、水杯与购物袋，减少一次性塑料制品使用，降低白色污染。',
    icon: GoodsFilled,
  },
  {
    title: '纸箱/包装重复利用',
    desc: '将完好的纸箱与包装材料二次利用或规范回收，提高资源使用效率。',
    icon: RefreshRight,
  },
  {
    title: '电池规范回收',
    desc: '将废旧电池集中收集并投放至有害垃圾回收点，避免重金属污染。',
    icon: null,
  },
  {
    title: '饮料瓶正确处理',
    desc: '清洗、去盖、压扁后投放至可回收物，提高回收效率与空间利用率。',
    icon: GobletSquareFull,
  },
  {
    title: '以旧换新与维修优先',
    desc: '耐用品尽量维修延寿或以旧换新，减少资源浪费与碳排放。',
    icon: MagicStick,
  },
  {
    title: '源头减量与分类存放',
    desc: '家庭中设置分类桶，源头精细化分类，降低后端处理压力。',
    icon: Collection,
  },
]

type Policy = { title: string; date: string; desc: string }

const policies: Policy[] = [
  {
    title: '《生活垃圾分类管理条例》',
    date: '2019年6月发布',
    desc: '明确生活垃圾分类管理要求与责任主体，规范分类投放、收集、运输与处理等环节。',
  },
  {
    title: '《固体废物污染环境防治法》',
    date: '2020年9月实施',
    desc: '从源头减量、分类投放与资源化利用等方面提出要求，完善固体废物污染防治制度体系。',
  },
]
</script>

<style scoped>
/* 简单的卡片过渡优化 */
:deep(.el-tabs--border-card) {
  border-radius: 0.75rem;
}
</style>