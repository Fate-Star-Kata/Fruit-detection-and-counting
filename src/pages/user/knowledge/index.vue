<template>
  <div class="min-h-screen bg-base-100 text-base-content flex flex-col">
    <!-- Hero：知识库标题 -->
    <section class="pt-24 pb-16 flex items-center justify-center">
      <div class="max-w-4xl w-full px-4 text-center space-y-6">
        <RevealMotion :delay="0">
          <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight">
            知识库
          </h1>
        </RevealMotion>

        <RevealMotion :delay="0.1">
          <p class="text-lg md:text-xl opacity-70">
            探索丰富的知识内容，提升您的技能与见解
          </p>
        </RevealMotion>

        <RevealMotion :delay="0.2">
          <div class="flex items-center justify-center gap-3 pt-2">
            <div class="form-control w-full max-w-md">
              <div class="join w-full">
                <input type="text" placeholder="搜索文章..." class="input input-bordered join-item flex-1"
                  v-model="searchQuery" @input="handleSearch" />
                <button class="btn btn-primary join-item">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </RevealMotion>
      </div>
    </section>

    <!-- 分类标签 -->
    <section class="py-8 bg-base-200">
      <div class="max-w-6xl mx-auto px-4">
        <RevealMotion :delay="0">
          <div class="flex flex-wrap justify-center gap-2">
            <button v-for="category in categories" :key="category" class="btn btn-sm rounded-full"
              :class="selectedCategory === category ? 'btn-primary' : 'btn-outline'" @click="selectCategory(category)"
              :disabled="loading">
              {{ category }}
            </button>
          </div>
        </RevealMotion>
      </div>
    </section>

    <!-- 文章列表 -->
    <section class="py-16">
      <div class="max-w-6xl mx-auto px-4">
        <!-- 加载状态 -->
        <div v-if="loading" class="flex justify-center py-12">
          <span class="loading loading-spinner loading-lg"></span>
        </div>

        <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <RevealMotion v-for="(article, i) in filteredArticles" :key="article.id" :delay="i * 0.08">
            <div
              class="card bg-base-100 shadow-sm hover:shadow-md transition rounded-2xl cursor-pointer transform hover:scale-105"
              @click="openArticle(article)">
              <figure class="px-6 pt-6">
                <div class="w-full h-48 rounded-xl overflow-hidden">
                  <img 
                    v-if="getImageUrl(article.image)" 
                    :src="getImageUrl(article.image) || ''" 
                    :alt="article.title"
                    class="w-full h-full object-cover"
                    @error="($event.target as HTMLElement)?.style && (($event.target as HTMLElement).style.display = 'none'); ($event.target as HTMLElement)?.nextElementSibling && (($event.target as HTMLElement).nextElementSibling as HTMLElement).style && ((($event.target as HTMLElement).nextElementSibling as HTMLElement).style.display = 'flex')"
                  />
                  <div
                    :class="[
                      'w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center',
                      getImageUrl(article.image) ? 'hidden' : 'flex'
                    ]">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 opacity-50" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </figure>
              <div class="card-body">
                <h3 class="card-title text-base">{{ article.title }}</h3>
                <p class="opacity-70 text-sm line-clamp-3">{{ article.summary }}</p>
                <div class="card-actions justify-between items-center mt-4">
                  <div class="flex gap-1">
                    <span class="badge badge-outline badge-sm">{{ article.category_name }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <button @click.stop="toggleLike(article.id)" class="btn btn-ghost btn-xs">
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clip-rule="evenodd" />
                      </svg>
                      {{ article.like_count || 0 }}
                    </button>
                    <div class="text-xs opacity-50">{{ new Date(article.created_at).toLocaleDateString() }}</div>
                  </div>
                </div>
              </div>
            </div>
          </RevealMotion>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && filteredArticles.length === 0" class="text-center py-16">
          <RevealMotion :delay="0">
            <div class="opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p class="text-lg mb-2">暂无文章</p>
              <p class="text-sm">{{ searchQuery ? '没有找到相关文章，请尝试其他关键词' : '该分类下暂无文章' }}</p>
            </div>
          </RevealMotion>
        </div>
      </div>
    </section>

    <!-- 文章详情弹窗 -->
    <dialog ref="articleModal" class="modal" @click="closeModal">
      <div class="modal-box w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto" @click.stop>
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>

        <div v-if="selectedArticle" class="space-y-6">
          <!-- 文章头图 -->
          <div v-if="getImageUrl(selectedArticle.image)" class="w-full h-64 rounded-lg overflow-hidden">
            <img 
              :src="getImageUrl(selectedArticle.image) || ''" 
              :alt="selectedArticle.title"
              class="w-full h-full object-cover"
            />
          </div>
          
          <div class="space-y-2">
            <h3 class="font-bold text-2xl">{{ selectedArticle.title }}</h3>
            <div class="flex items-center gap-4 text-sm opacity-70">
              <span class="badge badge-outline">{{ selectedArticle.category_name }}</span>
              <span>{{ new Date(selectedArticle.created_at).toLocaleDateString() }}</span>
              <span v-if="selectedArticle.author_name">作者: {{ selectedArticle.author_name }}</span>
            </div>
          </div>

          <!-- 文章统计和操作 -->
          <div class="flex items-center justify-between p-4 bg-base-200 rounded-lg" style="">
            <div class="flex items-center gap-4 text-sm">
              <span v-if="selectedArticle.view_count">阅读: {{ selectedArticle.view_count }}</span>
              <span>点赞: {{ selectedArticle.like_count || 0 }}</span>
              <span v-if="selectedArticle.is_featured" class="badge badge-warning badge-sm">精选</span>
            </div>
            <div class="flex items-center gap-2">
              <button @click="toggleLike(selectedArticle.id)" :class="[
                'btn btn-sm',
                selectedArticle.is_liked ? 'btn-primary' : 'btn-outline btn-primary'
              ]">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clip-rule="evenodd" />
                </svg>
                {{ selectedArticle.is_liked ? '已点赞' : '点赞' }}
              </button>
            </div>
          </div>

          <!-- 标签 -->
          <div v-if="selectedArticle.tags_list && selectedArticle.tags_list.length > 0" class="flex gap-2">
            <div v-for="tag in selectedArticle.tags_list" :key="tag" class="badge badge-outline badge-sm">
              {{ tag }}
            </div>
          </div>

          <div class="divider"></div>

          <div class="prose max-w-none">
            <div v-html="parsedContent"></div>
          </div>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { h, defineComponent, onMounted, onBeforeUnmount, ref, computed } from "vue";
import { Motion } from "motion-v";
import { marked } from 'marked';
import { getKnowledgeCategories, getKnowledgeArticles, getKnowledgeArticleDetail, likeKnowledgeArticle } from '@/api/user/knowledge'
import type { KnowledgeCategory, KnowledgeArticle, KnowledgeArticleDetail } from '@/types/factory'

// 获取服务器路径
const serverPath = import.meta.env.VITE_SERVER_PATH || ''

// RevealMotion 组件定义（复用首页的动画组件）
type RevealProps = { delay?: number };
const RevealMotion = defineComponent<RevealProps>({
  name: "RevealMotion",
  props: { delay: { type: Number, default: 0 } },
  setup(props, { slots }) {
    const el = ref<HTMLElement | null>(null);
    const inView = ref(false);
    let io: IntersectionObserver | null = null;

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
        { ref: el },
        [
          h(
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

// 响应式数据
const searchQuery = ref('');
const selectedCategory = ref('全部');
const selectedArticle = ref<KnowledgeArticleDetail | null>(null);
const articleModal = ref<HTMLDialogElement | null>(null);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// API数据
const articles = ref<KnowledgeArticle[]>([]);
const categoriesData = ref<KnowledgeCategory[]>([]);

// 分类数据（包含API数据和默认选项）
const categories = computed(() => {
  const apiCategories = categoriesData.value.map(cat => cat.name);
  return ['全部', ...apiCategories];
});


// 加载分类数据
const loadCategories = async () => {
  try {
    const response = await getKnowledgeCategories()
    if (response.code === 200) {
      categoriesData.value = response.data
    }
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 加载文章数据
const loadArticles = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      ...(selectedCategory.value !== '全部' && {
        category_id: categoriesData.value.find(cat => cat.name === selectedCategory.value)?.id
      }),
      ...(searchQuery.value.trim() && {
        search: searchQuery.value.trim()
      })
    }

    const response = await getKnowledgeArticles(params)
    if (response.code === 200) {
      articles.value = response.data.articles
      total.value = response.data.total
    }
  } catch (error) {
    console.error('加载文章失败:', error)

  } finally {
    loading.value = false
  }
}

// 获取完整图片URL的函数
const getImageUrl = (imagePath: string | null) => {
  if (!imagePath) return null
  if (imagePath.startsWith('http')) return imagePath
  return `${serverPath}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
}

// 计算属性：过滤后的文章
  const filteredArticles = computed(() => {
    return articles.value.filter(article => {
      const matchesSearch = !searchQuery.value ||
        article.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.value.toLowerCase())

      const matchesCategory = selectedCategory.value === '全部' ||
        article.category_name === selectedCategory.value

      return matchesSearch && matchesCategory
    })
  })

// 格式化日期函数
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

  // 配置marked选项
  marked.setOptions({
    breaks: true,
    gfm: true,
  })

  // 计算属性：解析markdown内容
  const parsedContent = computed(() => {
    if (!selectedArticle.value?.content) return ''
    try {
      return marked(selectedArticle.value.content)
    } catch (error) {
      console.error('Markdown解析错误:', error)
      return selectedArticle.value.content
    }
  })

// 方法
const selectCategory = (category: string) => {
  selectedCategory.value = category;
  currentPage.value = 1;
  loadArticles();
};

const handleSearch = () => {
  currentPage.value = 1;
  loadArticles();
};

const openArticle = async (article: KnowledgeArticle) => {
  try {
    loading.value = true;
    const response = await getKnowledgeArticleDetail(article.id);
    if (response.code === 200) {
      selectedArticle.value = response.data;
      articleModal.value?.showModal();
    }
  } catch (error) {
    console.error('加载文章详情失败:', error);
    // 使用模拟数据作为备用
    // 由于此页面不维护本地模拟数据，回退为最小详情结构，避免类型错误
    selectedArticle.value = {
      ...article,
      content: '文章内容加载失败，请稍后重试。',
      category: 0,
      author: 0,
      tags: '',
      sort_order: 0,
      is_liked: false
    } as KnowledgeArticleDetail;
    articleModal.value?.showModal();
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  selectedArticle.value = null;
  articleModal.value?.close();
};

// 文章点赞
const toggleLike = async (articleId: number) => {
  try {
    const response = await likeKnowledgeArticle(articleId);
    if (response.code === 200) {
      // 更新文章点赞状态
      const article = articles.value.find(a => a.id === articleId);
      if (article) {
        article.like_count = response.data.like_count;
      }
      // 如果当前打开的是这篇文章，也更新详情
      if (selectedArticle.value && selectedArticle.value.id === articleId) {
        selectedArticle.value.like_count = response.data.like_count;
        selectedArticle.value.is_liked = response.data.is_liked;
      }
    }
  } catch (error) {
    console.error('点赞失败:', error);
  }
};

// 页面初始化
onMounted(async () => {
  await loadCategories();
  await loadArticles();
});
</script>

<style scoped>
/* 保持干净的滚动体验 */
html,
body {
  scroll-behavior: smooth;
}

/* 文本截断样式 */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 代码块样式 */
.prose pre {
  background-color: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}

.prose code {
  background-color: #f3f4f6;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}
</style>
