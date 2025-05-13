<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50"
    @click.self="$emit('close')"
  >
    <div class="max-w-4xl max-h-[90vh] p-4 rounded-xl shadow-lg overflow-auto">
      <img
        :src="imageSrc"
        alt="Увеличенное изображение"
        class="w-full h-auto object-contain rounded-lg"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  imageSrc: String,
})
</script>
