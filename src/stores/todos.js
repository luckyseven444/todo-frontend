import { ref } from 'vue'
import { defineStore } from 'pinia'


export const useTodosTokenStore = defineStore('token', () => {
  const token = ref(null)


  function setToken(responseToken) {
    token.value = responseToken
  }

  return { token, setToken }
})
