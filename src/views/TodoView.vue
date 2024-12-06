<script setup>
import { ref } from 'vue'
import { useTodosTokenStore } from '../stores/todos'

const todosTokenStore = useTodosTokenStore();

const title = ref(null);
const formRef = ref(null);

const handleForm = async (event) => {
  event.preventDefault();

  const formData = {
    title: title.value,
  };
 // Retrieve Bearer token from the store
 const token = todosTokenStore.token;
console.log('token===', token)
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData),

    });

    if (!response.ok) {
      // Parse the error response if the server sends JSON
      const errorDetails = await response.json();
      console.log('Validation Error first:', errorDetails);

      // Throw to exit the function early
      throw new Error(`Error: ${response.status}`);
    }

    // Parse the success response
    const result = await response.json();
    console.log('====result', result);
    formRef.value.reset(); // Reset the form
  } catch (error) {
    console.log('Error end:', error);
    //alert('Failed to submit the form. Please try again.');
  }
};

</script>
<template>
 <form ref="formRef" @submit="handleForm">
    <input type="text" v-model="title" placeholder="title" required>

    <button type="submit">Add todo</button>
  </form>
</template>
