<template>
  <aside class="w-64 content-window p-6 z-10">
    <div class="card rounded-xl p-6 shadow-md">
      <img :src="avatar" alt="Аватар" class="w-40 h-40 rounded-full mb-4 object-cover mx-auto" />
      <InfoAboutPerson :id="userId" :key="userId" />
    </div>
  </aside>
</template>

<script setup>
defineProps({
  avatar: String,
  userId: Number,
})

import InfoAboutPerson from './InfoAboutPerson.vue'
</script>
