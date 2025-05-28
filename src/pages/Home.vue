<script setup>
import CardList from '../components/CardList.vue'
import { reactive, ref, onMounted, watch } from 'vue'
import axios from 'axios'

const filters = reactive({
  sortBy: 'full_name',
  searchQuery: '',
})

const allItems = ref([])
const items = ref([])

const isModalOpen = ref(false)
const errorMessage = ref('')
const newPerson = reactive({
  slug: '',
  full_name: '',
  country: '',
  birth_year: '',
  death_year: '',
  file: null,
})

const fetchItems = async () => {
  try {
    const { data } = await axios.get(`http://historical-social-network.ru/api/persons`)
    allItems.value = data
    applyFilters()
  } catch (e) {
    console.log(e)
  }
}

const applyFilters = () => {
  let filtered = [...allItems.value]

  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase()
    filtered = filtered.filter((item) => item.full_name.toLowerCase().includes(query))
  }

  if (filters.sortBy === 'title') {
    filtered.sort((a, b) => a.full_name.localeCompare(b.full_name))
  }

  items.value = filtered
}

const onChangeSelect = (event) => {
  filters.sortBy = event.target.value
}

const onChangeSearchInput = (event) => {
  filters.searchQuery = event.target.value
}

const handleFileChange = (event) => {
  newPerson.file = event.target.files[0]
}

const submitForm = async () => {
  // Минимальная валидация
  if (!newPerson.slug || !newPerson.full_name || !newPerson.country) {
    errorMessage.value = 'Пожалуйста, заполните все обязательные поля'
    return
  }

  // Формируем life_cycle
  const lifeCycle = `${newPerson.birth_year || ''}-${newPerson.death_year || ''}`

  const formData = new FormData()
  formData.append('full_name', newPerson.full_name)
  formData.append('year_of_death', 123) // Пустое значение
  formData.append('info', '123') // Пустое значение
  formData.append('file', newPerson.file)

  formData.append('country', newPerson.country)

  formData.append('life_cycle', lifeCycle)

  try {
    const response = await axios.post(`http://historical-social-network.ru/api/persons`, formData, {
      params: {
        slug: newPerson.slug, // Секретный ключ
      },
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
      },
    })

    console.log('Добавлено успешно:', response.data)
    fetchItems()
    isModalOpen.value = false
    errorMessage.value = ''
    Object.assign(newPerson, {
      slug: '',
      full_name: '',
      country: '',
      birth_year: '',
      death_year: '',
      file: null,
    })
  } catch (e) {
    if (e.response?.status === 403) {
      errorMessage.value = 'Секретный ключ неверный'
    } else {
      console.error('Ошибка при добавлении:', e.response?.data || e.message)
    }
  }
}

onMounted(fetchItems)
watch(filters, applyFilters)
</script>

<template>
  <div>
    <!-- Заголовок -->
    <div class="flex justify-between items-center">
      <h2 class="text-3xl font-bold ml-10">Профиля исторических личностей</h2>
      <div class="flex gap-5 items-center mr-10">
        <div class="relative">
          <img class="absolute left-2 top-3" src="/search.svg" />
          <input
            @input="onChangeSearchInput"
            class="border rounded-md py-2 pl-8 pr-4 outline-none focus:border-gray-400"
            placeholder="поиск..."
          />
        </div>
        <button
          @click="isModalOpen = true"
          class="w-10 h-10 flex items-center justify-center text-black text-2xl content-window rounded-lg"
        >
          <span class="relative top-[17px]">+</span>
        </button>
      </div>
    </div>

    <!-- Карточки -->
    <div class="mt-10 ml-5">
      <template v-if="items.length > 0">
        <CardList :items="items" />
      </template>
      <template v-else>
        <p class="text-center text-gray-500 text-xl">Таких исторических личностей не найдено</p>
      </template>
    </div>

    <!-- Модальное окно -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-149"
    >
      <div
        class="content-window relative rounded-xl w-full max-w-md px-6 py-4 animate-slide-in shadow-lg"
      >
        <!-- Крестик для закрытия -->
        <button
          @click="isModalOpen = false"
          class="absolute top-2 right-2 hover: brightness-90 cursor-pointer transition duration-300"
        >
          ✖
        </button>

        <h3 class="text-2xl font-bold mb-4 text-center">Добавить личность</h3>

        <!-- Поля ввода -->
        <input
          v-model="newPerson.slug"
          type="password"
          placeholder="Секретный ключ"
          class="input-field mb-3"
        />
        <input v-model="newPerson.full_name" placeholder="Полное имя" class="input-field mb-3" />
        <input v-model="newPerson.country" placeholder="Страна" class="input-field mb-3" />
        <div class="flex gap-3 mb-3">
          <input
            v-model="newPerson.birth_year"
            type="number"
            placeholder="Год рождения"
            class="input-field w-1/2"
          />
          <input
            v-model="newPerson.death_year"
            type="number"
            placeholder="Год смерти"
            class="input-field w-1/2"
          />
        </div>
        <input type="file" @change="handleFileChange" class="input-field mb-5" />

        <!-- Сообщение об ошибке -->
        <p v-if="errorMessage" class="text-red-500 text-sm mb-3">{{ errorMessage }}</p>

        <!-- Кнопки -->
        <div class="flex justify-end gap-3">
          <button
            @click="isModalOpen = false"
            class="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 active:scale-95 transition-all duration-200"
          >
            Отмена
          </button>
          <button
            @click="submitForm"
            class="bg-card-color text-black px-4 py-2 rounded hover:brightness-90 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  </div>

  <footer class="bg-gray-100 text-gray-700 p-6 text-center shadow-md">
    <p class="text-lg font-semibold">Создатели проекта:</p>
    <p>Паршуков Семён</p>
    <p>Карнажицкий Максим</p>
    <p class="mt-4">
      Если вы заметили историческую неточность, пожалуйста, напишите нам на:
      <a href="mailto:historyproject@example.com" class="text-blue-500 underline">
        historyproject@example.com
      </a>
    </p>
  </footer>
</template>

<style scoped>
footer {
  background-color: rgb(247, 217, 171); /* Бежевый фон */
  color: rgb(50, 50, 50); /* Тёмный текст */
  padding: 1.5rem; /* Отступы */
  margin-top: 2rem; /* Отступ сверху */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Лёгкая тень */
}

footer a {
  color: rgb(74, 57, 46); /* Цвет ссылки */
  text-decoration: underline; /* Подчёркивание для ссылок */
}

footer a:hover {
  color: rgb(50, 50, 50); /* Изменение цвета при наведении */
}
/* Стили для кнопок */
button {
  transition: all 0.2s ease-in-out; /* Плавный переход для всех изменений */
}

button:active {
  transform: scale(0.95); /* Лёгкое уменьшение при нажатии */
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

.input-field::placeholder {
  color: rgba(0, 0, 0, 0.5); /* Полупрозрачный чёрный цвет */
  font-style: italic; /* Курсив для большей незаметности */
}

/* Универсальные поля */
.input-field {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  border: none;
  outline: none;
  font-size: 1rem;
  background-color: rgb(240, 224, 200);
  color: black;
}

.input-field::placeholder {
  color: rgba(0, 0, 0, 0.5); /* Полупрозрачный чёрный цвет */
  font-style: italic; /* Курсив для большей незаметности */
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

/* Универсальные поля */
.input-field {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  border: none;
  outline: none;
  font-size: 1rem;
  background-color: rgb(240, 224, 200);
  color: black;
}
</style>
