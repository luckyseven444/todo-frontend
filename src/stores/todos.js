import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useTodosTokenStore = defineStore('token', () => {
  const token = ref(localStorage.getItem('todosToken') || null) // Load token from localStorage

  function setToken(responseToken) {
    token.value = responseToken
    localStorage.setItem('todosToken', responseToken) // Save token to localStorage
  }

  function clearToken() {
    token.value = null
    localStorage.removeItem('todosToken') // Remove token from localStorage
  }

  return { token, setToken, clearToken }
})
