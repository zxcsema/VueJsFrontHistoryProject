<template>
  <div
    class="card p-6 rounded-2xl shadow text-gray-800 transition-transform duration-500 opacity-0 animate-slide-in"
  >
    <p class="post-text mb-2">{{ post.text }}</p>
    <img
      v-if="post.imageUrl"
      :src="post.imageUrl"
      alt="Изображение поста"
      class="w-full max-h-64 object-contain cursor-pointer hover:opacity-90 transition mb-2 rounded-2xl"
      @click="$emit('image-click', post.imageUrl)"
    />
    <p class="text-right text-sm italic text-gray-500 mt-2">{{ post.date }}</p>

    <div
      class="mt+12 flex items-center cursor-pointer text-gray-800"
      @click="$emit('toggle-comments', index)"
    >
      <img src="/commentIcon.png" alt="Комментарии" class="w-5 h-5 mr-2" />
      <span class="underline">
        {{ commentsVisible ? 'Скрыть комментарии' : 'Комментарии' }}
      </span>
    </div>

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
          @click="$emit('user-click', comment.userID)"
        >
          {{ comment.name }}
        </span>
        <p class="text-gray-800">{{ comment.text }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  post: Object,
  comments: Array,
  commentsVisible: Boolean,
  index: Number,
})
</script>
