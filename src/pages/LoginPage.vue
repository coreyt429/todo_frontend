<template>
  <q-page class="flex flex-center q-pa-lg">
    <q-card class="q-pa-md" style="min-width: 400px; max-width: 600px; width: 100%">
      <q-card-section>
        <div class="text-h6 text-center">Login</div>
      </q-card-section>

      <q-separator />

      <!-- Enter Existing Key -->
      <q-card-section>
        <q-form @submit.prevent="submitExistingKey">
          <q-input
            filled
            v-model="existingKey"
            label="Enter Existing Key"
            type="text"
            class="q-mb-sm"
            dense
          />
          <q-btn label="Submit Key" color="primary" type="submit" class="full-width" />
        </q-form>
      </q-card-section>

      <q-separator />

      <!-- Create New Key -->
      <q-card-section>
        <div class="text-subtitle1">Create New Key</div>
        <q-form @submit.prevent="submitNewKey">
          <q-input
            filled
            v-model="newKey.user_id"
            label="User ID"
            type="text"
            class="q-mb-sm"
            dense
          />
          <q-input
            filled
            v-model="newKey.shared_secret"
            label="Shared Secret"
            type="password"
            class="q-mb-sm"
            dense
          />
          <q-btn label="Create Key" color="secondary" type="submit" class="full-width" />
        </q-form>
      </q-card-section>

      <q-separator />

      <!-- Social Logins -->
      <q-card-section class="text-center">
        <q-btn
          label="Sign in with Apple"
          color="black"
          text-color="white"
          icon="apple"
          class="q-mb-sm full-width"
          flat
        />
        <q-btn
          label="Sign in with Google"
          color="red-6"
          text-color="white"
          icon="fa-brands fa-google"
          class="full-width"
          flat
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const existingKey = ref('')
const newKey = ref({
  user_id: '',
  shared_secret: '',
})

function submitExistingKey() {
  console.log('Existing Key:', existingKey.value)
  // Handle login with existing key
  localStorage.setItem('auth_token', existingKey.value)
  window.location.href = '/#/'
}

function submitNewKey() {
  console.log('New Key:', newKey.value)
  // Handle creation of new key
}
</script>
