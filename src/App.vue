<script setup>
import Header from './components/Header.vue'
</script>

<template>
  <div class="app-container">
    <div class="content-window w-4/5 m-auto rounded-xl shadow-xl mt-14 pb-10">
      <Header />
      <div class="mt-10">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content-window {
  background-color: rgb(74, 57, 46);
  color: white; /* Белый текст */
  padding-bottom: 2.5rem; /* Увеличиваем нижний отступ */
}

.app-container {
  background: url('/background.jpg') no-repeat center center fixed; /* Фиксируем фон */
  background-size: cover; /* Масштабируем изображение, чтобы оно покрывало весь экран */
  min-height: 100vh; /* Задаём высоту на весь экран */
  display: flex;
  justify-content: center;
  align-items: flex-start; /* Центрируем содержимое сверху */
}
</style>
