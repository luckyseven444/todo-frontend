<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router';
import { useTodosTokenStore } from '../stores/todos'

const todosTokenStore = useTodosTokenStore()
const router = useRouter();
const email = ref("")
const password = ref("")
const formRef = ref(null)

const handleForm = async (event) => {
  event.preventDefault();

  const formData = {
    email: email.value,
    password: password.value,
    device_name: 'vue', // Specify a device name for token creation
  };

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
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
    todosTokenStore.setToken(result.token); // Store the token in Pinia
    console.log('Token stored in Pinia:', result.token);
    router.push({ name: 'todos' }); // Redirect to the dashboard route
    formRef.value.reset(); // Reset the form
  } catch (error) {
    console.log('Error end:', error);
    //alert('Failed to submit the form. Please try again.');
  }
};

</script>

<template>
  <form ref="formRef" @submit="handleForm">
    <input type="email" v-model="email" placeholder="Email" required>
    <input type="password" v-model="password" placeholder="Password" required>
    <button type="submit">Login</button>
  </form>
</template>
