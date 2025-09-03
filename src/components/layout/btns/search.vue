<script lang='ts' setup>
import { useCommonStore } from '@/stores/common'

const userStore = useCommonStore()

function handleSearch() {
  console.log(userStore.GlobalKeyWord)
}
</script>

<!-- <template>
  <label class="input search-input">
    <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </g>
    </svg>
    <input v-model="userStore.GlobalKeyWord" type="search" required placeholder="Search" @keyup.enter="handleSearch">
  </label>
</template> -->

<style scoped>
.search-input {
  width: 200px;
  transition: width 0.3s ease-in-out;
  /* outline: none; */
}

.search-input:focus-within {
  width: 300px;
}
</style>
