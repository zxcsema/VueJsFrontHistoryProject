<template>
  <div class="relative card p-6 rounded-2xl shadow text-gray-800 bg-white animate-slide-in z-13">
    <p class="font-bold text-black mb-2">Исторический контекст: {{ post.title }}</p>
    <!-- Кнопка + -->
    <button
      class="absolute top-3 right-3 bg-transparent text-black rounded-full w-8 h-8 flex items-center justify-center text-lg hover:cursor-pointer z-10"
      @click="showModal = true"
    >
      +
    </button>

    <!-- Текст поста -->
    <p class="post-text mb-2">{{ post.text }}</p>

    <!-- Изображение -->
    <img
      v-if="imageUrl"
      :src="imageUrl"
      alt="Изображение поста"
      class="w-full max-h-64 object-contain cursor-pointer hover:opacity-90 transition mb-2 rounded-2xl"
      @click="$emit('image-click', imageUrl)"
    />

    <!-- Кнопка показа комментариев -->
    <div class="mt-6 flex items-center cursor-pointer text-gray-800" @click="toggleComments">
      <img src="/commentIcon.png" alt="Комментарии" class="w-5 h-5 mr-2" />
      <span class="text-lg underline">
        {{ commentsVisible ? 'Скрыть комментарии' : 'Комментарии' }}
      </span>
    </div>

    <!-- Дата -->
    <p class="text-right text-sm italic text-gray-500 font-semibold">
      {{ post.publication_date ? formatDateRussian(post.publication_date) : 'Дата неизвестна' }}
    </p>

    <!-- Список комментариев -->
    <div v-if="commentsVisible" class="mt-4 space-y-4">
      <p v-if="comments.length === 0" class="text-center text-sm italic text-gray-500">
        К этому посту нет комментариев
      </p>
      <div
        v-else
        v-for="comment in comments"
        :key="comment.id"
        class="bg-card-color p-4 rounded-lg shadow-md"
      >
        <span
          class="text-gray-800 font-bold hover:underline cursor-pointer"
          @click="$emit('user-click', comment.author_id)"
        >
          {{ comment.author_name }}
        </span>
        <p class="text-gray-800">{{ comment.text }}</p>
      </div>
    </div>

    <!-- Модальное окно -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-1481"
      >
        <div
          class="content-window modal-content text-black p-6 rounded-2xl w-[90%] max-w-xl shadow-lg relative animate-slide-in"
        >
          <h2 class="text-2xl font-bold mb-4 text-center">Добавить комментарий</h2>

          <!-- Поле ввода секретного ключа -->
          <label class="block mb-2 text-lg">Секретный ключ</label>
          <input
            v-model="secureSlug"
            type="password"
            placeholder="Введите секретный ключ"
            class="card w-full p-2 border rounded mb-4"
          />

          <!-- Поле ввода ID автора -->
          <label class="block mb-2 text-lg">ID автора</label>
          <input
            v-model="authorId"
            type="number"
            placeholder="Введите ID автора"
            class="card w-full p-2 border rounded mb-4"
          />

          <!-- Поле ввода текста комментария -->
          <label class="block mb-2 text-lg">Текст комментария</label>
          <textarea
            v-model="commentText"
            placeholder="Введите текст комментария"
            rows="4"
            class="card w-full p-2 border rounded resize-none"
          ></textarea>

          <!-- Сообщение об ошибке -->
          <p v-if="errorMessage" class="text-red-500 text-sm mt-4 text-center">
            {{ errorMessage }}
          </p>

          <!-- Кнопки -->
          <div class="flex justify-end space-x-4 pt-4">
            <button
              @click="showModal = false"
              class="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded transition"
            >
              Отмена
            </button>
            <button
              @click="submitComment"
              class="bg-card-color hover:cursor-pointer hover:brightness-90 text-black px-4 py-2 rounded"
            >
              Отправить
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  post: Object,
})

const imageUrl = ref(null)
const showModal = ref(false)
const secureSlug = ref('')
const authorId = ref('')
const commentText = ref('')
const errorMessage = ref('')

const comments = ref([])
const commentsVisible = ref(false)
const persons = ref([])

async function fetchPersons() {
  try {
    const response = await axios.get('http://historical-social-network.ru/api/persons')
    persons.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки данных о пользователях:', error)
  }
}
function getAuthorName(authorId) {
  const person = persons.value.find((person) => person.id === authorId)
  return person ? person.full_name : 'Неизвестный автор'
}
onMounted(async () => {
  try {
    const response = await axios.get(
      `http://historical-social-network.ru/api/posts/${props.post.id}/image`,
      { responseType: 'blob' },
    )
    imageUrl.value = URL.createObjectURL(response.data)

    // Загружаем данные о пользователях
    await fetchPersons()
  } catch (error) {
    console.error('Ошибка загрузки изображения поста или данных о пользователях:', error)
  }
})

async function fetchComments() {
  try {
    // Загружаем все комментарии с API
    const commentsResponse = await axios.get('http://historical-social-network.ru/api/comments')
    const rawComments = commentsResponse.data.filter((comment) => comment.post_id === props.post.id)

    // Загружаем данные о пользователях
    const personsResponse = await axios.get('http://historical-social-network.ru/api/persons')
    const personsMap = personsResponse.data.reduce((map, person) => {
      map[person.id] = person.full_name
      return map
    }, {})

    // Добавляем имя автора к каждому комментарию
    comments.value = rawComments.map((comment) => ({
      ...comment,
      author_name: personsMap[comment.author_id] || 'Неизвестный автор',
    }))
  } catch (error) {
    console.error('Ошибка загрузки комментариев или данных о пользователях:', error)
  }
}

function toggleComments() {
  commentsVisible.value = !commentsVisible.value
  if (commentsVisible.value) {
    fetchComments() // Загружаем и фильтруем комментарии при открытии
  }
}

async function submitComment() {
  errorMessage.value = ''
  if (!secureSlug.value || !authorId.value || !commentText.value) {
    errorMessage.value = 'Пожалуйста, заполните все поля.'
    return
  }

  try {
    await axios.post(`http://historical-social-network.ru/api/comments?slug=${secureSlug.value}`, {
      post_id: props.post.id,
      author_id: authorId.value,
      text: commentText.value,
    })

    showModal.value = false
    secureSlug.value = ''
    authorId.value = ''
    commentText.value = ''
    await fetchComments()
    commentsVisible.value = true
  } catch (error) {
    if (error.response && error.response.status === 403) {
      errorMessage.value = 'Неверный секретный ключ.'
    } else {
      errorMessage.value = 'Ошибка при добавлении комментария.'
    }
  }
}

function formatDateRussian(dateStr) {
  const months = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
  ]

  // Отрезаем только дату, игнорируя время
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number)

  if (day + 1 > 31) {
    return `${1} ${months[month]} ${year}`
  }
  return `${day + 1} ${months[month - 1]} ${year}`
}
</script>

<style scoped>
textarea,
input {
  background-color: rgb(240, 224, 200); /* Цвет полей ввода совпадает с цветом карточки */
  color: black; /* Цвет текста внутри полей */
  border: 1px solid rgba(0, 0, 0, 0.2); /* Лёгкая рамка */
  border-radius: 0.5rem; /* Закруглённые углы */
  padding: 0.5rem;
}

textarea::placeholder,
input::placeholder {
  color: rgba(0, 0, 0, 0.5); /* Полупрозрачный чёрный цвет для текста placeholder */
  font-style: italic; /* Курсив для placeholder */
}

textarea:focus,
input:focus {
  outline: none;
  border-color: transparent; /* Убираем цвет рамки */
  box-shadow: none; /* Убираем тень */
}
.bg-beige-500 {
  background-color: #f5deb3; /* Бежевый цвет */
}

.bg-beige-600 {
  background-color: #e5cda3; /* Более тёмный бежевый для hover */
}
/* Анимация появления */
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-content {
  color: black; /* Устанавливаем чёрный цвет текста */
}

.animate-slide-in {
  animation: slide-in 0.5s ease-in-out forwards;
}

.content-window {
  background-color: rgb(74, 57, 46);
  color: white;
  padding-bottom: 2.5rem;
}

.card {
  background-color: rgb(240, 224, 200);
  color: rgb(50, 50, 50);
}

.bg-card-color {
  background-color: rgb(240, 224, 200);
}

textarea,
input {
  background-color: #f9f9f9;
}

textarea::placeholder,
input::placeholder {
  color: rgba(0, 0, 0, 0.5);
  font-style: italic;
}

/* Размытие фона */
.backdrop-blur-sm {
  backdrop-filter: blur(5px); /* Размытие фона */
}

/* Анимация появления */
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-content {
  color: black; /* Устанавливаем чёрный цвет текста */
}

.animate-slide-in {
  animation: slide-in 0.5s ease-in-out forwards;
}

.content-window {
  background-color: rgb(74, 57, 46);
  color: white;
  padding-bottom: 2.5rem;
}

.card {
  background-color: rgb(240, 224, 200);
  color: rgb(50, 50, 50);
}

.bg-card-color {
  background-color: rgb(240, 224, 200);
}

/* Размытие фона */
.backdrop-blur-sm {
  backdrop-filter: blur(5px); /* Размытие фона */
}

/* Анимация появления */
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-content {
  color: black; /* Устанавливаем чёрный цвет текста */
}

.animate-slide-in {
  animation: slide-in 0.5s ease-in-out forwards;
}

.content-window {
  background-color: rgb(74, 57, 46);
  color: white;
  padding-bottom: 2.5rem;
}

.card {
  background-color: rgb(240, 224, 200);
  color: rgb(50, 50, 50);
}

.bg-card-color {
  background-color: rgb(240, 224, 200);
}

/* Затемнение фона */
.bg-black {
  background-color: rgba(0, 0, 0, 0.5); /* Полупрозрачный чёрный фон */
}

/* Размытие фона */
.backdrop-blur-sm {
  backdrop-filter: blur(5px); /* Размытие фона */
}

/* Анимация появления */
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-content {
  color: black; /* Устанавливаем чёрный цвет текста */
}

.animate-slide-in {
  animation: slide-in 0.5s ease-in-out forwards;
}

.content-window {
  background-color: rgb(74, 57, 46);
  color: white;
  padding-bottom: 2.5rem;
  border-radius: 1rem;
}

.card {
  background-color: rgb(240, 224, 200);
  color: rgb(50, 50, 50);
}

.bg-card-color {
  background-color: rgb(240, 224, 200);
}
</style>
