<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'
import InfoAboutPerson from '@/components/InfoAboutPerson.vue'
import ImageModal from '@/components/ImageModal.vue'
import PostCard from '@/components/PostCard.vue'
const props = defineProps({
  id: [String, Number],
})

const router = useRouter()
const route = useRoute()

const userId = ref(Number(props.id))
const year = ref(new Date().getFullYear())
const posts = ref([])
const comments = ref([])
const selectedImage = ref(null)
const commentsVisible = ref({})
const avatar = ref(null)
const isLoading = ref(false)

const goToDetails = (userID) => {
  router.push(`/person/${userID}`)
}

const fetchPosts = async () => {
  try {
    isLoading.value = true

    // Загружаем аватар
    avatar.value = `http://historical-social-network.ru/api/persons/${userId.value}/avatar`

    // Получаем посты
    const postsResponse = await axios.get(`http://historical-social-network.ru/api/posts`)
    posts.value = postsResponse.data
      .map((post) => {
        const formattedDate = formatDateRussian(post.publication_date)
        return {
          ...post,
          formattedDate,
          year: new Date(post.publication_date).getFullYear(),
        }
      })
      .sort((a, b) => new Date(b.publication_date) - new Date(a.publication_date)) // Сортировка по дате
  } catch (error) {
    console.error('Ошибка при получении данных:', error)
    avatar.value = '/default-avatar.jpg'
    posts.value = []
  } finally {
    isLoading.value = false
  }
}

const fetchComments = async () => {
  try {
    const commentsResponse = await axios.get(`http://historical-social-network.ru/api/comments`)
    const rawComments = commentsResponse.data

    // Уникальные author_id
    const authorIds = [...new Set(rawComments.map((comment) => comment.author_id))]

    // Получаем данные о пользователях
    const authorMap = {}
    await Promise.all(
      authorIds.map(async (id) => {
        try {
          const response = await axios.get(`http://historical-social-network.ru/api/persons/${id}`)
          authorMap[id] = response.data.full_name
        } catch (error) {
          console.error(`Ошибка при получении имени автора ${id}:`, error)
          authorMap[id] = `Пользователь #${id}` // fallback
        }
      }),
    )

    // Обогащаем комментарии именами
    comments.value = rawComments.map((comment) => ({
      ...comment,
      author_name: authorMap[comment.author_id] || `Пользователь #${comment.author_id}`,
    }))
  } catch (error) {
    console.error('Ошибка при получении комментариев:', error)
    comments.value = []
  }
}

const filteredPosts = computed(() => {
  return posts.value.filter((post) => {
    return (
      Number(post.year) === Number(year.value) && Number(post.author_id) === Number(userId.value)
    )
  })
})

const getCommentsForPost = (postId) => {
  return comments.value.filter((comment) => comment.post_id === postId)
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

  const date = new Date(dateStr)
  return `${date.getDate()} ${months[date.getMonth()]}`
}

const showAddPostModal = ref(false)
const newPost = ref({
  secretKey: '', // Новое поле для секретного ключа
  title: '',
  text: '',
  file: null,
  year: '',
  month: '',
  day: '',
})

const errorMessage = ref('') // Объявляем переменную для хранения сообщения об ошибке

const submitPost = async () => {
  // Валидация полей
  if (!newPost.value.secretKey) {
    errorMessage.value = 'Секретный ключ обязателен'
    return
  }
  if (!newPost.value.title) {
    errorMessage.value = 'Исторический контекст обязателен'
    return
  }
  if (!newPost.value.text) {
    errorMessage.value = 'Текст обязателен'
    return
  }
  if (!newPost.value.year || !newPost.value.month || !newPost.value.day) {
    errorMessage.value = 'Дата обязательна'
    return
  }

  // Проверка диапазонов для дня, месяца и года
  const year = Number(newPost.value.year)
  const month = Number(newPost.value.month)
  const day = Number(newPost.value.day)

  if (month < 1 || month > 12) {
    errorMessage.value = 'Месяц должен быть в диапазоне от 1 до 12'
    return
  }

  const daysInMonth = new Date(year, month, 0).getDate() // Получаем количество дней в месяце
  if (day < 1 || day > daysInMonth) {
    errorMessage.value = `День должен быть в диапазоне от 1 до ${daysInMonth}`
    return
  }

  try {
    const formData = new FormData()
    formData.append('title', newPost.value.title)
    formData.append('text', newPost.value.text)
    formData.append('author_id', userId.value)
    formData.append('publication_date', new Date(year, month - 1, day).toISOString())

    // Проверяем и добавляем файл
    if (newPost.value.file) {
      formData.append('file', newPost.value.file, newPost.value.file.name)
    }

    const response = await axios.post('http://historical-social-network.ru/api/posts', formData, {
      params: { slug: newPost.value.secretKey },
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
      },
    })

    console.log('Пост успешно добавлен:', response.data)

    // Сбрасываем данные формы
    showAddPostModal.value = false
    errorMessage.value = ''
    newPost.value = {
      secretKey: '',
      title: '',
      text: '',
      file: null,
      year: '',
      month: '',
      day: '',
    }

    // Обновляем список постов
    await fetchPosts()
  } catch (error) {
    if (error.response?.status === 422) {
      errorMessage.value =
        'Слишком большой размер файла. Пожалуйста, выберите файл меньшего размера.'
    } else {
      errorMessage.value =
        'Неизвестная ошибка сервера. Попробуйте позже. Возможно размер файла слишком большой'
      console.error('Ошибка при добавлении поста:', error.response?.data || error.message)
    }
  }
}

const toggleComments = (postId) => {
  commentsVisible.value[postId] = !commentsVisible.value[postId]
}

const closeImageModal = () => {
  selectedImage.value = null
}

const openImageModal = (imageUrl) => {
  selectedImage.value = imageUrl
}

const currentYear = new Date().getFullYear()
const yearRange = Array.from({ length: currentYear - 1939 }, (_, i) => 1940 + i)

// Отслеживаем изменения параметров маршрута
watch(
  () => route.params.id,
  async (newId) => {
    userId.value = Number(newId)
    commentsVisible.value = {} // Сбрасываем состояние видимости комментариев
    await fetchPosts()
    await fetchComments()
  },
  { immediate: true },
)

onMounted(async () => {
  await fetchPosts()
  await fetchComments()
})
</script>

<template>
  <div class="content-window min-h-screen bg-gray-50 flex relative overflow-visible">
    <!-- Левая панель -->
    <aside class="w-64 content-window p-6 z-10">
      <div class="card rounded-xl p-6 shadow-md">
        <img :src="avatar" alt="Аватар" class="w-40 h-40 rounded-full mb-4 object-cover mx-auto" />
        <InfoAboutPerson :id="userId" :key="userId" />
      </div>
    </aside>

    <!-- Контент -->
    <main class="flex-1 p-8 z-10">
      <div v-if="isLoading" class="text-center text-gray-500">Загрузка...</div>
      <div v-else>
        <!-- Кнопка добавления -->
        <div class="flex justify-end items-center mb-6">
          <button
            class="card hover: brightness-90 active:scale-95 transition-all duration-200 cursor-pointer text-white font-bold py-2 px-4 rounded-xl shadow"
            @click="showAddPostModal = true"
          >
            + Добавить пост
          </button>
        </div>

        <!-- Линия со скроллом -->
        <div class="relative">
          <p class="text-center text-2xl font-bold text-white mb-4">
            {{ year }}
          </p>
          <div class="w-full h-2 bg-gray-300 rounded-full mt-6 mb-6 relative">
            <div
              class="absolute top-0 h-2 rounded-full transition-all duration-500 ease-in-out"
              :style="{ width: ((year - 1940) / (currentYear - 1940)) * 100 + '%' }"
            ></div>
            <input
              type="range"
              min="1940"
              :max="currentYear"
              v-model="year"
              class="absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer z-10"
              style="pointer-events: auto"
            />
            <div class="absolute top-3 left-0 w-full flex justify-between text-xl text-black-500">
              <span>1940</span>
              <span>{{ currentYear }}</span>
            </div>
          </div>
        </div>

        <!-- Посты -->
        <div class="space-y-6 max-w-2xl mx-auto">
          <template v-if="filteredPosts.length > 0">
            <PostCard
              v-for="(post, index) in filteredPosts"
              :key="post.id"
              :post="post"
              :comments="getCommentsForPost(post.id)"
              :commentsVisible="commentsVisible[index]"
              :index="index"
              @image-click="selectedImage = $event"
              @toggle-comments="toggleComments"
              @user-click="goToDetails"
            />
          </template>
          <p v-else class="text-center text-gray-500">Постов за {{ year }} год нет.</p>
        </div>
      </div>
    </main>

    <!-- Модальное окно для изображения -->
    <div
      v-if="selectedImage"
      class="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-1488"
      @click="closeImageModal"
    >
      <img
        :src="selectedImage"
        alt="Увеличенное изображение"
        class="max-w-[80%] max-h-[80%] rounded-lg shadow-lg"
      />
    </div>
    <!-- Модальное окно -->
    <Teleport to="body">
      <div
        v-if="showAddPostModal"
        class="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-149"
      >
        <div
          class="content-window modal-content text-black p-6 rounded-2xl w-[90%] max-w-xl shadow-lg relative animate-slide-in"
        >
          <h2 class="text-2xl font-bold mb-4 text-center">Добавить пост</h2>

          <!-- Поле ввода секретного ключа -->
          <label class="block mb-2 text-lg">Секретный ключ</label>
          <input
            v-model="newPost.secretKey"
            type="password"
            class="w-full p-2 border rounded mb-4"
            placeholder="Введите секретный ключ"
          />

          <!-- Поле ввода исторического контекста -->
          <label class="block mb-2 text-lg">Исторический контекст</label>
          <input
            v-model="newPost.title"
            type="text"
            class="w-full p-2 border rounded mb-4"
            placeholder="Введите исторический контекст"
          />

          <!-- Поле ввода текста -->
          <label class="block mb-2 text-lg">Текст</label>
          <textarea
            v-model="newPost.text"
            class="w-full p-2 border rounded mb-4"
            rows="4"
            placeholder="Введите текст поста"
          ></textarea>

          <!-- Поля ввода даты -->
          <label class="block mb-2 text-lg">Дата</label>
          <div class="flex space-x-4 mb-4">
            <input
              v-model="newPost.year"
              type="number"
              class="w-1/3 p-2 border rounded"
              placeholder="Год"
            />
            <input
              v-model="newPost.month"
              type="number"
              class="w-1/3 p-2 border rounded"
              placeholder="Месяц"
            />
            <input
              v-model="newPost.day"
              type="number"
              class="w-1/3 p-2 border rounded"
              placeholder="День"
            />
          </div>

          <!-- Поле загрузки изображения -->
          <label class="block mb-2 text-lg">Изображение</label>
          <input
            type="file"
            @change="(e) => (newPost.file = e.target.files[0])"
            accept="image/*"
            class="mb-4"
          />

          <!-- Кнопки -->
          <div class="flex justify-end space-x-4">
            <button
              class="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
              @click="showAddPostModal = false"
            >
              Отмена
            </button>
            <button
              class="bg-card-color hover:cursor-pointer hover:brightness-90 text-black px-4 py-2 rounded"
              @click="submitPost"
            >
              Опубликовать
            </button>
          </div>

          <!-- Сообщение об ошибке -->
          <p v-if="errorMessage" class="text-red-500 text-sm mt-4 text-center">
            {{ errorMessage }}
          </p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
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
</style>
