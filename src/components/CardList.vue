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
      :title="item.full_name"
      :imageUrl="`http://historical-social-network.ru/api/persons/${item.id}/avatar?timestamp=${Date.now()}`"
      :price="item.price"
    />
  </div>
</template>
