<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  id: Number,
  title: String,
  imageUrl: String,
  price: Number,
  isAdded: Boolean,
  isFavorite: Boolean,
  onClickAdd: Function,
  onClickFavorite: Function,
})

const router = useRouter()

const goToDetails = () => {
  console.log('ID:', props.id)
  router.push(`/person/${props.id}`) // Используем props.id
}
</script>

<template>
  <div
    class="relative card border-slate-100 rounded-3xl pt-5 pb-2 px-5 cursor-pointer transition hover:-translate-y-2 hover:shadow-xl ml-4"
    @click="goToDetails"
  >
    <img :src="imageUrl" alt="PersonPhoto" class="cursor-pointer rounded-lg" />

    <!-- Обновлённый заголовок -->
    <p class="mt-2 font-bold text-lg font-cursive text-center">{{ title }}</p>
  </div>
</template>

<style scoped>
.card {
  background-color: rgb(240, 224, 200); /* Бежевый */
  color: rgb(50, 50, 50); /* Тёмный текст */
}

.font-cursive {
  font-style: italic; /* Курсив для большей незаметности */ /* Каллиграфический шрифт */
}
</style>
