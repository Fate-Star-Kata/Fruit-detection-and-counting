<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2>{{ t('menu.navigation') }}</h2>
    </div>
    <nav class="sidebar-nav">
      <ul class="nav-list">
        <li class="nav-item">
          <a href="#" class="nav-link active">
            <span class="nav-icon">🏠</span>
            {{ t('menu.dashboard') }}
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link">
            <span class="nav-icon">👥</span>
            {{ t('menu.users') }}
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link">
            <span class="nav-icon">📊</span>
            {{ t('menu.reports') }}
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link">
            <span class="nav-icon">⚙️</span>
            {{ t('menu.settings') }}
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link">
            <span class="nav-icon">❓</span>
            {{ t('common.help') }}
          </a>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { useI18n } from '@/utils/useI18n'

const { t } = useI18n()
</script>

<style scoped>
.sidebar {
  width: 250px;
  background: #34495e;
  color: white;
  height: 100%;
  overflow-y: auto;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #2c3e50;
  background: #2c3e50;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #3498db;
}

.sidebar-nav {
  padding: 1rem 0;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: #bdc3c7;
  text-decoration: none;
  transition: all 0.3s;
  border-left: 3px solid transparent;
}

.nav-link:hover {
  background: #2c3e50;
  color: white;
  border-left-color: #3498db;
}

.nav-link.active {
  background: #2c3e50;
  color: white;
  border-left-color: #3498db;
}

.nav-icon {
  margin-right: 0.75rem;
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }

  .nav-link {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .sidebar-header {
    padding: 1rem;
  }
}
</style>