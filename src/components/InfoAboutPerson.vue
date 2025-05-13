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
    const res = await axios.get('https://3c6913f881d257e6.mokky.dev/info')
    console.log(props.id)
    userInfo.value = res.data.find((item) => item.id === Number(props.id))
  } catch (err) {
    console.error('Ошибка при получении данных:', err)
  }
}

onMounted(fetchUserInfo)
</script>

<template>
  <div v-if="userInfo" class="card rounded-xl p-6 shadow-xl max-w-xl mx-auto mt-10">
    <p class="info-text"><strong>Имя:</strong> {{ userInfo['Имя'] }}</p>
    <p class="info-text"><strong>Страна:</strong> {{ userInfo['Страна'] }}</p>
    <p class="info-text"><strong>Годы жизни:</strong> {{ userInfo['ГодыЖизни'] }}</p>
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
  font-family: 'Cursive', 'Brush Script MT', cursive; /* Каллиграфический шрифт */
  font-size: 1.125rem; /* Размер текста (18px) */
  line-height: 1.5; /* Межстрочный интервал */
  color: rgb(50, 50, 50); /* Цвет текста из .card */
}

body.modal-open {
  overflow: hidden;
}

.card {
  background-color: rgb(240, 224, 200); /* Бежевый */
  color: rgb(50, 50, 50); /* Тёмный текст */
}

.font-cursive {
  font-family: 'Cursive', 'Brush Script MT', cursive; /* Каллиграфический шрифт */
}

.post-text {
  font-family: 'Cursive', 'Brush Script MT', cursive; /* Каллиграфический шрифт для текста постов */
  font-size: 1.125rem; /* Увеличенный размер текста (18px) */
  line-height: 1.5; /* Межстрочный интервал */
}
</style>
