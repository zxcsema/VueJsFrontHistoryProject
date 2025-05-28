<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// Принимаем id как пропс
const props = defineProps({
  id: Number,
})

const userInfo = ref(null)

const fetchUserInfo = async () => {
  try {
    // Делаем запрос к API с подстановкой id
    const res = await axios.get(`http://historical-social-network.ru/api/persons/${props.id}`)
    userInfo.value = res.data // Сохраняем данные пользователя
  } catch (err) {
    console.error('Ошибка при получении данных:', err)
  }
}

onMounted(fetchUserInfo)
</script>

<template>
  <div v-if="userInfo" class="card rounded-xl p-6 shadow-xl max-w-xl mx-auto mt-10">
    <p class="info-text"><strong>Имя:</strong> {{ userInfo.full_name }}</p>
    <p class="info-text"><strong>Страна:</strong> {{ userInfo.country }}</p>
    <p class="info-text"><strong>Годы жизни:</strong> {{ userInfo.life_cycle }}</p>
  </div>

  <div v-else class="text-center mt-10 text-gray-500">Загрузка данных...</div>
</template>

<style scoped>
.content-window {
  background-color: rgb(74, 57, 46);
  color: white; /* Белый текст */
  padding-bottom: 2.5rem; /* Увеличиваем нижний отступ */
}

.info-text {
  font-style: italic; /* Курсивный текст */
  font-size: 1 rem; /* Размер текста (18px) */
  line-height: 1.5; /* Межстрочный интервал */
  color: rgb(50, 50, 50); /* Цвет текста из .card */
}

.card {
  background-color: rgb(240, 224, 200); /* Бежевый */
  color: rgb(50, 50, 50); /* Тёмный текст */
}
</style>
