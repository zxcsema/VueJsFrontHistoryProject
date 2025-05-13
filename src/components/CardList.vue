<script setup>
import Card from './Card.vue'

defineProps({
  items: Array,
})
</script>

<template>
  <div class="grid grid-cols-4 gap-4 mr-4">
    <Card
      v-for="item in items"
      :key="item.id"
      :id="item.id"
      :title="item.title"
      :imageUrl="item.imageUrl"
      :price="item.price"
    />
  </div>
</template>
