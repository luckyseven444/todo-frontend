<script setup>
import { ref, onBeforeMount } from 'vue'
import { useTodosTokenStore } from '../stores/todos'

const selectedTodoId = ref(null)
const selectedTodoTitle = ref(null)
const todos = ref(null)
const token = ref(null)
const todosTokenStore = useTodosTokenStore()

//hide the modal function
const hideModal = (id) => {
  const modal = document.getElementById(id)
  modal.classList.remove('show') // Remove the 'show' class
  modal.style.display = 'none' // Hide the modal
  modal.setAttribute('aria-hidden', 'true') // Update accessibility attributes
  document.body.classList.remove('modal-open') // Remove the class from body
  document.querySelector('.modal-backdrop')?.remove() // Remove the backdrop if present
}

// Methods to save data in reactive variable
const saveInfoToReactiveVariablesForEdit = (customerId, title) => {
  selectedTodoId.value = customerId
  selectedTodoTitle.value = title
}

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

//validate customer edit form and submit
const formRefEdit = ref(null)

const validateFormAndSendToServerEditInfo = async (event) => {
  const form = formRefEdit.value

  if (form && !form.checkValidity()) {
    event.preventDefault() // Prevent default submission
    event.stopPropagation() // Stop event propagation
    form.classList.add('was-validated') // Add Bootstrap validation styles
  } else {
    // Form is valid; send the data to the REST API
    event.preventDefault() // Prevent page reload during API call

    // Gather form data
    const formData = {
      id: selectedTodoId.value,
      title: selectedTodoTitle.value,
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/todos/${selectedTodoId.value}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
            Authorization: `Bearer ${token.value}`,
          },
          body: JSON.stringify(formData),
        },
      )

      const result = await response.json()

      if (!response.ok) {
        // Handle non-2xx HTTP status codes
        if (result.status === 422) {
          console.error('Validation Error:', result.errors)
          // Display the error message to the user
          alert(`Error: ${result.message}`)
        } else {
          //throw new Error('Something went wrong.')
          alert(`Error: something went wrong`)
        }
      } else {
        //add new customer to customers array
        const index = todos.value.findIndex((item) => item.id === selectedTodoId.value)

        if (index !== -1) {
          // Directly update the element within the array
          todos.value.splice(index, 1, {
            id: result.data.id,
            title: result.data.title,
          })
        }

        //hide open modal
        hideModal('customerInfoModal')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to submit the form. Please try again.')
    }
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
        <td>
          <button
            type="button"
            data-bs-toggle="modal"
            data-bs-target="#customerInfoModal"
            data-bs-backdrop="false"
            class="btn btn-primary btn-sm me-1"
            @click="saveInfoToReactiveVariablesForEdit(todo.id, todo.title)"
          >
            Edit
          </button>
        </td>
      </tr>
    </tbody>
  </table>
  <form ref="formRef" @submit="handleTodoCreateForm">
    <input type="text" v-model="title" placeholder="title" required />

    <button type="submit">Add todo</button>
  </form>

  <!-- Modal for data edit -->
  <div
    class="modal fade"
    id="customerInfoModal"
    tabindex="-1"
    aria-labelledby="customerInfoModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="customerInfoModalLabel">Edit customer</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>

        <div class="modal-body">
          <form
            class="row g-3 needs-validation"
            novalidate
            ref="formRefEdit"
            @submit="validateFormAndSendToServerEditInfo"
          >
            <div class="col-md-6">
              <label for="name" class="form-label">Title</label>
              <input
                type="text"
                class="form-control"
                id="name"
                v-model="selectedTodoTitle"
                required
              />
              <div class="invalid-feedback">Please enter your name</div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="submit" class="btn btn-primary">Save changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
