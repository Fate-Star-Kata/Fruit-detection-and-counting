<template>
  <div class="min-h-screen bg-base-100">
    <!-- 页面标题和用户个人信息 -->
    <div class="mt-0.5 flex py-20 bg-black/5">

      <div class="container mx-auto px-4 text-center relative z-10">
        <div class="max-w-4xl mx-auto">
          <!-- 用户头像和基本信息 -->
          <div class="mb-8" v-motion :initial="{ opacity: 0, scale: 0.8 }"
            :enter="{ opacity: 1, scale: 1, transition: { delay: 100 } }">
            <div class="avatar online mx-auto mb-6">
              <div class="w-24 rounded-full ring ring-white ring-offset-4 ring-offset-transparent">
                <img :src="userStore.getUserAvatar" alt="用户头像" />
              </div>
            </div>
            <h1 class="text-4xl md:text-5xl font-bold mb-3">{{ userProfile.displayName }}</h1>
            <div class="flex items-center justify-center gap-3 text-lg">
              <div class="badge badge-lg badge-outline border-blue-300 text-blue-700 bg-white/60">
                <el-icon class="mr-2">
                  <Calendar />
                </el-icon>
                已加入 {{ userProfile.joinDays }} 天
              </div>
              <div class="badge badge-lg badge-outline border-blue-300 text-blue-700 bg-white/60">
                <el-icon class="mr-2">
                  <Trophy />
                </el-icon>
                等级 {{ userProfile.level }}
              </div>
            </div>
          </div>

          <!-- 核心统计数据 -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8" v-motion :initial="{ opacity: 0, y: 50 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }">
            <div v-for="(stat, index) in coreStats" :key="stat.label" class="text-center" v-motion
              :initial="{ opacity: 0, y: 30 }" :enter="{ opacity: 1, y: 0, transition: { delay: 400 + index * 100 } }">
              <div class="text-3xl md:text-4xl font-bold mb-2">{{ stat.value }}</div>
              <div class="text-sm md:text-base opacity-90">{{ stat.label }}</div>
              <div class="text-xs opacity-75 mt-1">{{ stat.change }}</div>
            </div>
          </div>

          <!-- 经验值进度条 -->
          <div class="max-w-md mx-auto" v-motion :initial="{ opacity: 0, y: 30 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 800 } }">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm">等级 {{ userProfile.level }}</span>
              <span class="text-sm">{{ userProfile.currentExp }}/{{ userProfile.nextLevelExp }} EXP</span>
            </div>
            <div class="w-full bg-white/20 rounded-full h-3">
              <div class="bg-white h-3 rounded-full transition-all duration-1000" :style="{ width: `${expProgress}%` }">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-12 space-y-12">
      <!-- 个人目标和挑战 -->
      <div class="grid md:grid-cols-2 gap-8">
        <!-- 每日目标 -->
        <div class="card bg-base-100 shadow-xl" v-motion :initial="{ opacity: 0, x: -50 }"
          :enter="{ opacity: 1, x: 0, transition: { delay: 500 } }">
          <div class="card-body">
            <h2 class="card-title text-2xl mb-6 flex items-center gap-2">
              <el-icon class="text-orange-500">
                <!-- <Target /> -->
              </el-icon>
              今日目标
            </h2>

            <div class="space-y-6">
              <div v-for="goal in dailyGoals" :key="goal.id" class="space-y-3">
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-3">
                    <div class="text-2xl">{{ goal.icon }}</div>
                    <div>
                      <h4 class="font-semibold">{{ goal.title }}</h4>
                      <p class="text-sm text-base-content/70">{{ goal.description }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-lg font-bold" :class="goal.completed ? 'text-success' : 'text-base-content'">
                      {{ goal.current }}/{{ goal.target }}
                    </div>
                    <div v-if="goal.completed" class="text-success text-sm">✓ 已完成</div>
                  </div>
                </div>
                <div class="w-full bg-base-200 rounded-full h-2">
                  <div class="h-2 rounded-full transition-all duration-1000"
                    :class="goal.completed ? 'bg-success' : 'bg-primary'"
                    :style="{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }"></div>
                </div>
              </div>
            </div>

            <!-- 目标设置 -->
            <div class="divider">设置新目标</div>
            <div class="flex gap-2">
              <input v-model="newGoalInput" type="number" placeholder="目标次数"
                class="input input-bordered input-sm flex-1" min="1" max="50">
              <button @click="setCustomGoal" class="btn btn-primary btn-sm">设置</button>
            </div>
          </div>
        </div>

        <!-- 成就系统 -->
        <div class="card bg-base-100 shadow-xl" v-motion :initial="{ opacity: 0, x: 50 }"
          :enter="{ opacity: 1, x: 0, transition: { delay: 600 } }">
          <div class="card-body">
            <h2 class="card-title text-2xl mb-6 flex items-center gap-2">
              <el-icon class="text-yellow-500">
                <Medal />
              </el-icon>
              成就徽章
              <div class="badge badge-primary">{{ unlockedAchievements.length }}/{{ achievements.length }}</div>
            </h2>

            <div class="grid grid-cols-2 gap-4 max-h-80 overflow-y-auto">
              <div v-for="(achievement, index) in achievements" :key="achievement.id"
                class="card bg-base-200 shadow-lg transition-all duration-300 hover:shadow-xl"
                :class="{ 'opacity-50': !achievement.unlocked }" v-motion :initial="{ opacity: 0, scale: 0.8 }"
                :enter="{ opacity: 1, scale: 1, transition: { delay: 700 + index * 50 } }">
                <div class="card-body text-center p-4">
                  <div class="text-3xl mb-2" :class="{ 'grayscale': !achievement.unlocked }">
                    {{ achievement.icon }}
                  </div>
                  <h3 class="font-bold text-sm">{{ achievement.name }}</h3>
                  <p class="text-xs text-base-content/70">{{ achievement.description }}</p>
                  <div v-if="!achievement.unlocked" class="mt-2">
                    <div class="text-xs text-base-content/50">
                      进度: {{ achievement.currentProgress }}/{{ achievement.requirement }}
                    </div>
                    <div class="w-full bg-base-300 rounded-full h-1 mt-1">
                      <div class="bg-primary h-1 rounded-full"
                        :style="{ width: `${Math.min((achievement.currentProgress / achievement.requirement) * 100, 100)}%` }">
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-xs text-success mt-2">
                    ✅ 已解锁 {{ achievement.unlockedDate }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 详细统计图表 -->
      <div class="grid lg:grid-cols-3 gap-8">
        <!-- 分类统计 -->
        <div class="card bg-base-100 shadow-xl" v-motion :initial="{ opacity: 0, y: 50 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 700 } }">
          <div class="card-body">
            <h2 class="card-title mb-6 flex items-center gap-2">
              <el-icon class="text-2xl text-blue-500">
                <MagicStick />
              </el-icon>
              分类统计
            </h2>

            <div class="space-y-4">
              <div v-for="category in categoryStats" :key="category.name" class="space-y-2">
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-2">
                    <div class="text-2xl">{{ category.icon }}</div>
                    <span class="font-medium">{{ category.name }}</span>
                  </div>
                  <div class="text-right">
                    <div class="text-sm font-semibold">{{ category.count }} 次</div>
                    <div class="text-xs text-base-content/70">{{ category.accuracy }}% 准确率</div>
                  </div>
                </div>
                <div class="w-full bg-base-200 rounded-full h-2">
                  <div class="h-2 rounded-full transition-all duration-1000" :class="category.color"
                    :style="{ width: `${category.percentage}%` }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 每周趋势 -->
        <div class="card bg-base-100 shadow-xl" v-motion :initial="{ opacity: 0, y: 50 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 800 } }">
          <div class="card-body">
            <h2 class="card-title mb-6 flex items-center gap-2">
              <el-icon class="text-purple-500">
                <Calendar />
              </el-icon>
              每周趋势
            </h2>

            <div class="space-y-3">
              <div v-for="day in weeklyStats" :key="day.date" class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="text-sm font-medium w-12">{{ day.dayName }}</div>
                  <div class="flex-1 bg-base-200 rounded-full h-3 max-w-24">
                    <div
                      class="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000"
                      :style="{ width: `${(day.count / maxWeeklyCount) * 100}%` }"></div>
                  </div>
                </div>
                <div class="text-sm text-base-content/70">{{ day.count }}</div>
              </div>
            </div>

            <!-- 周统计摘要 -->
            <div class="divider">本周摘要</div>
            <div class="grid grid-cols-2 gap-4 text-center">
              <div>
                <div class="text-2xl font-bold text-primary">{{ weeklyTotal }}</div>
                <div class="text-xs text-base-content/70">总检测次数</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-success">{{ weeklyAvgAccuracy }}%</div>
                <div class="text-xs text-base-content/70">平均准确率</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 实时排行榜 -->
        <div class="card bg-base-100 shadow-xl" v-motion :initial="{ opacity: 0, y: 50 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 900 } }">
          <div class="card-body">
            <h2 class="card-title mb-6 flex items-center gap-2">
              <el-icon class="text-yellow-500">
                <TrendCharts />
              </el-icon>
              本周排行
            </h2>

            <div class="space-y-3 max-h-64 overflow-y-auto">
              <div v-for="(user, index) in leaderboard" :key="user.id"
                class="flex items-center gap-3 p-3 rounded-lg transition-all duration-300" :class="{
                  'bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30': index === 0,
                  'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800/30 dark:to-gray-700/30': index === 1,
                  'bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30': index === 2,
                  'bg-base-200': index > 2,
                  'ring-2 ring-primary': user.isCurrentUser
                }">
                <div class="text-lg font-bold w-6 text-center">
                  {{ index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}` }} </div>
                    <div class="avatar">
                      <div class="w-8 rounded-full">
                        <img :src="user.avatar" :alt="user.name" />
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="font-medium truncate">
                        {{ user.name }}
                        <span v-if="user.isCurrentUser" class="badge badge-primary badge-xs ml-1">您</span>
                      </div>
                      <div class="text-xs text-base-content/70">{{ user.points }} 积分</div>
                    </div>
                    <div class="text-right">
                      <div class="text-sm font-medium">{{ user.detections }}</div>
                      <div class="text-xs text-base-content/70">{{ user.accuracy }}%</div>
                    </div>
                </div>
              </div>

              <!-- 超越下一名提示 -->
              <div v-if="nextRankUser" class="divider">冲击排名</div>
              <div v-if="nextRankUser" class="bg-info/10 rounded-lg p-3 text-center">
                <p class="text-sm text-info">
                  再检测 <span class="font-bold">{{ nextRankUser.pointsGap }}</span> 次即可超越
                  <span class="font-bold">{{ nextRankUser.name }}</span>！
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 环保影响力仪表板 -->
        <div class="card bg-gradient-to-r from-green-100 via-blue-50 to-emerald-100 shadow-xl">
          <!-- 仪表板内容 -->
        </div>

        <!-- 挑战系统 -->
        <div class="card bg-base-100 shadow-xl" v-motion :initial="{ opacity: 0, y: 50 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 1200 } }">
          <div class="card-body">
            <h2 class="card-title text-2xl mb-6 flex items-center gap-2">
              <el-icon class="text-red-500">
                <Medal />
              </el-icon>
              每周挑战
              <div class="badge badge-secondary">{{ activeChallenge?.timeLeft }}</div>
            </h2>

            <div v-if="activeChallenge"
              class="from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="text-3xl">{{ activeChallenge.icon }}</div>
                  <div>
                    <h3 class="text-lg font-bold text-red-700 dark:text-red-300">{{ activeChallenge.title }}</h3>
                    <p class="text-sm text-red-600 dark:text-red-400">{{ activeChallenge.description }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-red-600">{{ activeChallenge.reward }}积分</div>
                  <div class="text-sm text-red-500">奖励</div>
                </div>
              </div>

              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium">挑战进度</span>
                  <span class="text-sm">{{ activeChallenge.current }}/{{ activeChallenge.target }}</span>
                </div>
                <div class="w-full bg-red-200 dark:bg-red-800 rounded-full h-3">
                  <div class="bg-gradient-to-r from-red-500 to-pink-500 h-3 rounded-full transition-all duration-1000"
                    :style="{ width: `${Math.min((activeChallenge.current / activeChallenge.target) * 100, 100)}%` }">
                  </div>
                </div>
                <div v-if="activeChallenge.completed" class="text-center">
                  <div class="text-success font-semibold mb-2">🎉 挑战完成！</div>
                  <button @click="claimReward" class="btn btn-success btn-sm">领取奖励</button>
                </div>
              </div>
            </div>

            <!-- 历史挑战 -->
            <div class="divider">往期挑战</div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="challenge in pastChallenges" :key="challenge.id"
                class="bg-base-200 rounded-lg p-4 opacity-75">
                <div class="flex items-center gap-3 mb-2">
                  <div class="text-xl">{{ challenge.icon }}</div>
                  <div>
                    <h4 class="font-semibold">{{ challenge.title }}</h4>
                    <p class="text-xs text-base-content/70">{{ challenge.completedDate }}</p>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm">{{ challenge.completed ? '已完成' : '未完成' }}</span>
                  <span class="text-sm font-semibold">{{ challenge.reward }}积分</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Calendar,
  Trophy,
  Medal,
  TrendCharts,
  DataLine
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/auth/user'
const userStore = useUserStore()


// 用户资料接口
interface UserProfile {
  displayName: string
  joinDays: number
  level: number
  currentExp: number
  nextLevelExp: number
}

// 目标接口
interface DailyGoal {
  id: number
  title: string
  description: string
  icon: string
  current: number
  target: number
  completed: boolean
}

// 成就接口
interface Achievement {
  id: number
  name: string
  description: string
  icon: string
  unlocked: boolean
  requirement: number
  currentProgress: number
  unlockedDate?: string
}

// 分类统计接口
interface CategoryStat {
  name: string
  icon: string
  count: number
  percentage: number
  accuracy: number
  color: string
}

// 用户资料
const userProfile = ref<UserProfile>({
  displayName: '环保先锋',
  joinDays: 68,
  level: 7,
  currentExp: 1450,
  nextLevelExp: 2000
})

// 核心统计数据
const coreStats = ref([
  { value: '284', label: '总检测次数', change: '+12 今日' },
  { value: '95.8%', label: '平均准确率', change: '+2.1% 本周' },
  { value: '3,840', label: '环保积分', change: '+156 本周' },
  { value: '#52', label: '全球排名', change: '↑8 本周' }
])

// 经验值进度
const expProgress = computed(() =>
  Math.round((userProfile.value.currentExp / userProfile.value.nextLevelExp) * 100)
)

// 每日目标
const dailyGoals = ref<DailyGoal[]>([
  {
    id: 1,
    title: '检测垃圾',
    description: '完成今日检测目标',
    icon: '🔍',
    current: 8,
    target: 10,
    completed: false
  },
  {
    id: 2,
    title: '准确分类',
    description: '保持高准确率',
    icon: '🎯',
    current: 7,
    target: 8,
    completed: false
  },
  {
    id: 3,
    title: '连续签到',
    description: '坚持每日使用',
    icon: '📅',
    current: 15,
    target: 15,
    completed: true
  }
])

// 自定义目标输入
const newGoalInput = ref(15)

// 设置自定义目标
const setCustomGoal = () => {
  if (newGoalInput.value > 0 && newGoalInput.value <= 50) {
    dailyGoals.value[0].target = newGoalInput.value
    dailyGoals.value[0].completed = dailyGoals.value[0].current >= newGoalInput.value
    ElMessage.success(`已设置新的每日目标：${newGoalInput.value} 次检测`)
  }
}

// 成就系统
const achievements = ref<Achievement[]>([
  {
    id: 1,
    name: '初出茅庐',
    description: '完成首次检测',
    icon: '🌱',
    unlocked: true,
    requirement: 1,
    currentProgress: 284,
    unlockedDate: '2024-11-15'
  },
  {
    id: 2,
    name: '环保新手',
    description: '完成50次检测',
    icon: '🌿',
    unlocked: true,
    requirement: 50,
    currentProgress: 284,
    unlockedDate: '2024-12-01'
  },
  {
    id: 3,
    name: '分类达人',
    description: '完成200次检测',
    icon: '🌳',
    unlocked: true,
    requirement: 200,
    currentProgress: 284,
    unlockedDate: '2024-12-20'
  },
  {
    id: 4,
    name: '准确之星',
    description: '准确率达到95%',
    icon: '⭐',
    unlocked: true,
    requirement: 95,
    currentProgress: 95.8,
    unlockedDate: '2024-12-18'
  },
  {
    id: 5,
    name: '环保专家',
    description: '完成500次检测',
    icon: '🏆',
    unlocked: false,
    requirement: 500,
    currentProgress: 284
  },
  {
    id: 6,
    name: '连续检测王',
    description: '连续30天检测',
    icon: '🔥',
    unlocked: false,
    requirement: 30,
    currentProgress: 18
  },
  {
    id: 7,
    name: '分享大使',
    description: '分享结果25次',
    icon: '📤',
    unlocked: false,
    requirement: 25,
    currentProgress: 12
  },
  {
    id: 8,
    name: '环保大师',
    description: '完成1000次检测',
    icon: '👑',
    unlocked: false,
    requirement: 1000,
    currentProgress: 284
  }
])

// 已解锁成就
const unlockedAchievements = computed(() =>
  achievements.value.filter(achievement => achievement.unlocked)
)

// 分类统计
const categoryStats = ref<CategoryStat[]>([
  {
    name: '可回收垃圾',
    icon: '♻️',
    count: 128,
    percentage: 45.1,
    accuracy: 97.2,
    color: 'bg-blue-500'
  },
  {
    name: '厨余垃圾',
    icon: '🥬',
    count: 89,
    percentage: 31.3,
    accuracy: 94.8,
    color: 'bg-green-500'
  },
  {
    name: '其他垃圾',
    icon: '🗑️',
    count: 51,
    percentage: 18.0,
    accuracy: 96.1,
    color: 'bg-gray-500'
  },
  {
    name: '有害垃圾',
    icon: '☢️',
    count: 16,
    percentage: 5.6,
    accuracy: 93.8,
    color: 'bg-red-500'
  }
])

// 每周统计
const weeklyStats = ref([
  { date: '2025-01-13', dayName: '今日', count: 8 },
  { date: '2025-01-12', dayName: '昨日', count: 12 },
  { date: '2025-01-11', dayName: '周六', count: 15 },
  { date: '2025-01-10', dayName: '周五', count: 11 },
  { date: '2025-01-09', dayName: '周四', count: 9 },
  { date: '2025-01-08', dayName: '周三', count: 13 },
  { date: '2025-01-07', dayName: '周二', count: 7 }
])

// 最大每周检测次数
const maxWeeklyCount = computed(() =>
  Math.max(...weeklyStats.value.map(day => day.count))
)

// 本周总数和平均准确率
const weeklyTotal = computed(() =>
  weeklyStats.value.reduce((sum, day) => sum + day.count, 0)
)

const weeklyAvgAccuracy = computed(() => 95.8)

// 排行榜
const leaderboard = ref([
  {
    id: 1,
    name: '环保小王子',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=prince',
    points: 4280,
    detections: 318,
    accuracy: 98.1,
    isCurrentUser: false
  },
  {
    id: 2,
    name: '绿色生活家',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=green',
    points: 4050,
    detections: 295,
    accuracy: 97.3,
    isCurrentUser: false
  },
  {
    id: 3,
    name: '分类大师',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=master',
    points: 3920,
    detections: 287,
    accuracy: 96.8,
    isCurrentUser: false
  },
  {
    id: 4,
    name: '环保先锋',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
    points: 3840,
    detections: 284,
    accuracy: 95.8,
    isCurrentUser: true
  },
  {
    id: 5,
    name: '垃圾分类王',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=king',
    points: 3650,
    detections: 271,
    accuracy: 94.5,
    isCurrentUser: false
  }
])

// 下一名用户信息
const nextRankUser = computed(() => {
  const currentUserIndex = leaderboard.value.findIndex(user => user.isCurrentUser)
  if (currentUserIndex > 0) {
    const nextUser = leaderboard.value[currentUserIndex - 1]
    const pointsGap = Math.ceil((nextUser.points - leaderboard.value[currentUserIndex].points) / 15)
    return {
      name: nextUser.name,
      pointsGap
    }
  }
  return null
})

// 环保影响力
const environmentalImpacts = ref([
  {
    icon: '🌳',
    value: '5.7',
    label: '相当于种植的树木',
    description: '基于碳减排计算',
    color: 'text-green-600'
  },
  {
    icon: '💧',
    value: '426L',
    label: '节约的水资源',
    description: '回收利用贡献',
    color: 'text-blue-600'
  },
  {
    icon: '⚡',
    value: '227kWh',
    label: '节约的电能',
    description: '减少处理成本',
    color: 'text-yellow-600'
  },
  {
    icon: '🌍',
    value: '12.4kg',
    label: '减少的碳排放',
    description: 'CO₂当量计算',
    color: 'text-purple-600'
  }
])

// 环保等级
const impactLevel = computed(() => {
  const points = 3840
  if (points >= 5000) {
    return {
      name: '环保大使',
      icon: '👑',
      description: '您是真正的环保领袖！',
      progress: 100,
      currentPoints: points,
      nextLevelPoints: '已达顶级',
      badgeClass: 'badge-warning'
    }
  } else if (points >= 3000) {
    return {
      name: '环保专家',
      icon: '🏆',
      description: '您的环保行为令人敬佩！',
      progress: ((points - 3000) / 2000) * 100,
      currentPoints: points,
      nextLevelPoints: 5000,
      badgeClass: 'badge-success'
    }
  } else if (points >= 1500) {
    return {
      name: '环保达人',
      icon: '🌟',
      description: '您正在成为环保专家！',
      progress: ((points - 1500) / 1500) * 100,
      currentPoints: points,
      nextLevelPoints: 3000,
      badgeClass: 'badge-info'
    }
  } else {
    return {
      name: '环保新手',
      icon: '🌱',
      description: '继续努力，保护地球！',
      progress: (points / 1500) * 100,
      currentPoints: points,
      nextLevelPoints: 1500,
      badgeClass: 'badge-primary'
    }
  }
})

// 环保建议
const ecoTips = ref([
  {
    id: 1,
    icon: '🚯',
    title: '减少一次性用品',
    description: '尽量使用可重复使用的物品，减少垃圾产生'
  },
  {
    id: 2,
    icon: '📦',
    title: '纸箱重复利用',
    description: '清洁的纸箱可以重复使用多次后再投入回收'
  },
  {
    id: 3,
    icon: '🔋',
    title: '电池专门回收',
    description: '废电池含有害物质，需要投放到专门的回收点'
  },
  {
    id: 4,
    icon: '🥤',
    title: '饮料瓶清洗',
    description: '回收前请清洗干净，提高回收利用率'
  }
])

// 当前挑战
const activeChallenge = ref({
  icon: '🎯',
  title: '准确达人挑战',
  description: '本周内达到98%的检测准确率',
  current: 95.8,
  target: 98.0,
  reward: 500,
  timeLeft: '3天 12小时',
  completed: false
})

// 历史挑战
const pastChallenges = ref([
  {
    id: 1,
    icon: '🏃',
    title: '检测狂人',
    description: '一周内完成100次检测',
    completed: true,
    reward: 300,
    completedDate: '2024-12-15'
  },
  {
    id: 2,
    icon: '📚',
    title: '学习之星',
    description: '浏览所有分类知识',
    completed: false,
    reward: 200,
    completedDate: '未完成'
  },
  {
    id: 3,
    icon: '🤝',
    title: '分享达人',
    description: '分享检测结果10次',
    completed: true,
    reward: 150,
    completedDate: '2024-12-08'
  }
])

// 领取奖励
const claimReward = () => {
  ElMessage.success(`恭喜获得 ${activeChallenge.value.reward} 环保积分！`)
  // 这里可以添加实际的奖励逻辑
}

// 生命周期
onMounted(() => {
  console.log('统计页面已加载')
})
</script>

<style scoped>
.avatar img {
  object-fit: cover;
}

.grayscale {
  filter: grayscale(100%);
}

.card {
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
}

/* 自定义滚动条 */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>