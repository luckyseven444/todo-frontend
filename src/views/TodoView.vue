<script setup>
import { ref, onBeforeMount } from 'vue'
import { useTodosTokenStore } from '../stores/todos'

const title = ref(null)
const formRefCreateForm = ref(null)
const createFormValid = ref(true)
const newTodoCreateErrorMessage = ref(null)
const selectedTodoId = ref(null)
const selectedTodoTitle = ref(null)
const todos = ref(null)
const token = ref(null)
const todosTokenStore = useTodosTokenStore()

//hide modal
const hideModal = (id) => {
  const modal = document.getElementById(id)
  if (!modal) return

  // Remove the 'show' class
  modal.classList.remove('show')
  modal.style.display = 'none'
  modal.setAttribute('aria-hidden', 'true')

  // Remove backdrop and body class
  document.body.classList.remove('modal-open')
  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.remove())

  // Reset body overflow
  document.body.style.overflow = ''
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
  } catch (error) {
    console.log('Error end:', error)
  }
})

//form handler for todo create form
const handleTodoCreateForm = async (event) => {
  event.preventDefault() // Prevent default submission
  const form = formRefCreateForm.value

  if (form && !form.checkValidity()) {
    createFormValid.value = false
    event.stopPropagation()
    form.classList.add('was-validated') // Add Bootstrap validation styles
    return
  }

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
      //console.log('Validation Error first:', errorDetails)
      createFormValid.value = false
      newTodoCreateErrorMessage.value = errorDetails.message
      // Throw to exit the function early
      //throw new Error(`Error: ${response.status}`)
    }

    // Parse the success response
    const result = await response.json()
    todos.value.push(result.data) //append new todo to todos array
    // form.reset() // Reset the form
    title.value = null
    createFormValid.value = true
    newTodoCreateErrorMessage.value = null
  } catch (error) {
    console.log('Error end:', error)
  }
}

//validate edit form and submit
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
        } else {
          throw new Error('Something went wrong.')
        }
      } else {
        //add new customer to customers array
        const index = todos.value.findIndex((item) => item.id === selectedTodoId.value)

        if (index !== -1) {
          // Directly update the element within the array
          todos.value.splice(index, 1, {
            id: result.data.id,
            title: result.data.title,
            status: result.data.status,
          })
        }

        //hide open modal
        hideModal('todoInfoEditModal')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }
}
//save data to reactive variables from form
const saveInfoToReactiveVariablesForDelete = (todoId) => {
  selectedTodoId.value = todoId
}

//delete todo
const deleteTodo = async (event) => {
  // Form is valid; send the data to the REST API
  event.preventDefault() // Prevent page reload during API call

  // Gather form data
  const formData = {
    id: selectedTodoId.value,
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/todos/${selectedTodoId.value}`,
      {
        method: 'DELETE',
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
      } else {
        throw new Error('Something went wrong.')
      }
    } else {
      //add new customer to customers array
      const index = todos.value.findIndex((item) => item.id === selectedTodoId.value)

      if (index !== -1) {
        // Directly delete the element within the array
        todos.value.splice(index, 1)
      }

      //hide the delete modal
      hideModal('todoDeleteModal')
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

//handle status change
const handleStatusChange = async (id) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/todos/status/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
        Authorization: `Bearer ${token.value}`,
      },
    })

    const result = await response.json()

    if (!response.ok) {
      // Handle non-2xx HTTP status codes
      if (result.status === 422) {
        console.error('Validation Error:', result.errors)
        // Display the error message to the user
      } else {
        throw new Error('Something went wrong.')
      }
    } else {
      //add new customer to customers array
      const index = todos.value.findIndex((item) => item.id === id)

      if (index !== -1) {
        // Directly update the element within the array
        todos.value.splice(index, 1, {
          id: result.data.id,
          title: result.data.title,
          status: result.data.status,
        })
      }
    }
  } catch (error) {
    console.error('Error:', error)
  }
}
</script>

<template>
  <div class="container">
    <!--  Todo create form -->
    <div class="row mb-3 p-2">
      <!-- New todo create form -->
      <div class="col text-end">
        <form
          class="needs-validation d-inline-block"
          ref="formRefCreateForm"
          @submit="handleTodoCreateForm"
        >
          <div class="row g-2 justify-content-center">
            <div class="col-auto p-1">
              <input
                v-model="title"
                type="text"
                class="form-control"
                :class="{
                  'is-invalid': !createFormValid,
                }"
                id="validationCustom03"
                required
                placeholder="Add todo"
              />
              <div class="invalid-feedback" v-if="!createFormValid">
                {{ newTodoCreateErrorMessage }}
              </div>
            </div>
            <div class="col-auto p-1">
              <button class="btn btn-primary" type="submit">Add</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <h1 class="display-6">Todo list:</h1>
        <table class="table table-striped table-bordered table-hover w-100">
          <thead class="table-light">
            <tr>
              <th>Title</th>
              <th>Done</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="todo in todos" :key="todo.id">
              <td>{{ todo.title }}</td>
              <td class="text-center">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :checked="todo.status === 1"
                    @click="handleStatusChange(todo.id)"
                  />
                </div>
              </td>
              <td class="text-center">
                <button
                  type="button"
                  class="btn btn-primary btn-sm me-1"
                  data-bs-toggle="modal"
                  data-bs-target="#todoInfoEditModal"
                  @click="saveInfoToReactiveVariablesForEdit(todo.id, todo.title)"
                >
                  Edit
                </button>
                <button
                  type="button"
                  class="btn btn-danger btn-sm"
                  data-bs-toggle="modal"
                  data-bs-target="#todoDeleteModal"
                  @click="saveInfoToReactiveVariablesForDelete(todo.id)"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal for data edit -->
    <div
      class="modal fade"
      id="todoInfoEditModal"
      tabindex="-1"
      aria-labelledby="todoInfoEditModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="todoInfoEditModalLabel">Edit customer</h5>
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
                <div class="invalid-feedback">Please enter title</div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                  Close
                </button>
                <button type="submit" class="btn btn-primary">Save changes</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for customer delete -->
    <div
      class="modal fade"
      id="todoDeleteModal"
      tabindex="-1"
      aria-labelledby="todoDeleteModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="todoDeleteModalLabel">Delete todo</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <div class="modal-body">
            <form class="row g-3 needs-validation" @submit="deleteTodo">
              <label for="name" class="form-label">Are want to delete?</label>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                  Cancel
                </button>
                <button type="submit" class="btn btn-danger">Yes</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
