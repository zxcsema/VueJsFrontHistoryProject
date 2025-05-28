<template>
  <aside class="w-64 content-window p-6 z-10">
    <div class="card rounded-xl p-6 shadow-md">
      <!-- Динамическая загрузка изображения -->
      <img
        v-if="avatarUrl"
        :src="avatarUrl"
        alt="Аватар"
        class="w-40 h-40 rounded-full mb-4 object-cover mx-auto"
      />
      <div v-else class="w-40 h-40 rounded-full mb-4 bg-gray-300 mx-auto"></div>
      <InfoAboutPerson :id="userId" :key="userId" />
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import InfoAboutPerson from './InfoAboutPerson.vue'

defineProps({
  userId: Number,
})

const avatarUrl = ref(null)

const fetchAvatar = async () => {
  try {
    const response = await fetch(`http://historical-social-network.ru/api/persons/${userId}/avatar`)
    console.log(userId.value)
    const blob = await response.blob() // Получаем бинарные данные
    avatarUrl.value = URL.createObjectURL(blob) // Преобразуем в URL
  } catch (error) {
    console.error('Ошибка при загрузке аватара:', error)
  }
}

onMounted(() => {
  fetchAvatar()
})
</script>
