<script setup>
import { ref, onBeforeMount } from 'vue'
import { useTodosTokenStore } from '../stores/todos'

const todos = ref(null)
const token = ref(null)
const todosTokenStore = useTodosTokenStore()

onBeforeMount(async () => {
  // Retrieve Bearer token from the store
  token.value = todosTokenStore.token

  //fetch todo list from server
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/todos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token.value}`,
      },
    })

    if (!response.ok) {
      // Parse the error response if the server sends JSON
      const errorDetails = await response.json()
      console.log('Validation Error first:', errorDetails)

      // Throw to exit the function early
      throw new Error(`Error: ${response.status}`)
    }

    // Parse the success response
    const result = await response.json()
    //assign server response todo list to todos reactive variable
    todos.value = result.data
    formRef.value.reset() // Reset the form
  } catch (error) {
    console.log('Error end:', error)
    //alert('Failed to submit the form. Please try again.');
  }
})

const title = ref(null)
const formRef = ref(null)

const handleTodoCreateForm = async (event) => {
  event.preventDefault()

  const formData = {
    title: title.value,
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      // Parse the error response if the server sends JSON
      const errorDetails = await response.json()
      console.log('Validation Error first:', errorDetails)

      // Throw to exit the function early
      throw new Error(`Error: ${response.status}`)
    }

    // Parse the success response
    const result = await response.json()
    todos.value.push(result.data) //append new todo to todos array
    formRef.value.reset() // Reset the form
  } catch (error) {
    console.log('Error end:', error)
  }
}
</script>
<template>
  <table>
    <thead>
      <th>id</th>
      <th>Title</th>
      <th>Status</th>
      <th>Actions</th>
    </thead>
    <tbody>
      <tr v-for="todo in todos" :key="todo.id">
        <td>{{ todo.id }}</td>
        <td>{{ todo.title }}</td>
        <td>{{ todo.id }}</td>
        <td>{{ todo.id }}</td>
      </tr>
    </tbody>
  </table>
  <form ref="formRef" @submit="handleTodoCreateForm">
    <input type="text" v-model="title" placeholder="title" required />

    <button type="submit">Add todo</button>
  </form>
</template>
