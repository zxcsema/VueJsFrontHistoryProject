<script setup>
import CardList from '../components/CardList.vue'
import { reactive, ref, onMounted, watch } from 'vue'
import axios from 'axios' // Добавьте этот импорт

const filters = reactive({
  sortBy: 'title',
  searchQuery: '',
})

const items = ref([])

const fetchItems = async () => {
  try {
    const params = {
      sortBy: filters.sortBy,
    }
    if (filters.searchQuery) {
      params.title = `*${filters.searchQuery}*`
    }
    const { data } = await axios.get(`https://3c6913f881d257e6.mokky.dev/sneakers`, {
      params,
    })
    items.value = data
  } catch (e) {
    console.log(e)
  }
}

onMounted(fetchItems)

watch(filters, fetchItems)

const onChangeSelect = (event) => {
  filters.sortBy = event.target.value
}

const onChangeSearchInput = (event) => {
  filters.searchQuery = event.target.value
}
</script>

<template>
  <div>
    <!-- Заголовок -->
    <div class="flex justify-between items-center">
      <h2 class="text-3xl font-bold ml-10">Профиля исторических личностей</h2>
      <div class="flex gap-5">
        <div class="relative right-5">
          <img class="absolute left-2 top-3" src="/search.svg" />
          <input
            @input="onChangeSearchInput"
            class="border rounded-md py-2 pl-8 pr-4 outline-none focus:border-gray-400"
            placeholder="поиск..."
          />
        </div>
      </div>
    </div>

    <!-- Карточки -->
    <div class="mt-10 ml-5">
      <template v-if="items.length > 0">
        <CardList :items="items" />
      </template>
      <template v-else>
        <p class="text-center text-gray-500 text-xl">Таких исторических личностей не найдено</p>
      </template>
    </div>
  </div>
</template>
