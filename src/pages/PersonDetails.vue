<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'
import InfoAboutPerson from '@/components/InfoAboutPerson.vue'
import ImageModal from '@/components/ImageModal.vue'
import PostCard from '@/components/PostCard.vue'
import InfoCard from '@/components/InfoCard.vue'
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
  router.push(`/sneakers/${userID}`)
}

const fetchPosts = async () => {
  try {
    isLoading.value = true
    const response = await axios.get(
      `https://3c6913f881d257e6.mokky.dev/sneakers?id=${userId.value}`,
    )
    avatar.value = response.data[0]?.imageUrl || '/default-avatar.jpg'

    const postsResponse = await axios.get(`https://3c6913f881d257e6.mokky.dev/posts`)
    posts.value = postsResponse.data.map((post) => ({
      ...post,
      commentID: post.commentID || [],
    }))
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
    const commentsResponse = await axios.get(`https://3c6913f881d257e6.mokky.dev/comments`)
    comments.value = commentsResponse.data
  } catch (error) {
    console.error('Ошибка при получении комментариев:', error)
    comments.value = []
  }
}

const filteredPosts = computed(() => {
  return posts.value.filter((post) => {
    return Number(post.year) === Number(year.value) && post.userId === userId.value
  })
})

const getCommentsForPost = (commentIDs) => {
  return comments.value.filter((comment) => commentIDs.includes(comment.id))
}

const toggleComments = (postId) => {
  commentsVisible.value[postId] = !commentsVisible.value[postId]
}

const closeImageModal = () => {
  selectedImage.value = null
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
  <div class="content-window min-h-screen bg-gray-50 flex relative overflow-hidden">
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
        <!-- Линия со скроллом -->
        <div class="relative">
          <p class="text-center text-2xl font-bold text-white mb-4">
            {{ year }}
          </p>
          <div class="w-full h-2 bg-gray-300 rounded-full mt-6 mb-6 relative">
            <div
              class="absolute top-0 h-2 bg-blue-600 rounded-full transition-all duration-500 ease-in-out"
              :style="{ width: `${((year.value - 1940) / (currentYear - 1940)) * 100}%` }"
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
              :key="`${year}-${index}`"
              :post="post"
              :comments="getCommentsForPost(post.commentID)"
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
    <image-modal
      v-if="selectedImage"
      :imageSrc="selectedImage"
      :key="selectedImage"
      @close="closeImageModal"
    />
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
