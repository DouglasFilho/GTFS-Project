<template>
  <q-page padding>
    <div class="row justify-center">
      <div style="max-width: 700px; width: 100%">
        <q-card>
          <q-card-section>
            <div class="text-h6">Carregando dados GTFS (BHTrans)</div>
            <div class="text-subtitle2">Processando automaticamente o arquivo embutido</div>
          </q-card-section>
          <q-separator />
          <q-card-section class="row items-center q-gutter-sm">
            <q-spinner v-if="loading" color="primary" size="2em" />
            <div v-if="loading">Processando... isso pode levar alguns segundos</div>
            <div v-if="error" class="text-negative">{{ error }}</div>
          </q-card-section>
          <q-card-actions align="right" v-if="error">
            <q-btn color="primary" label="Tentar novamente" @click="processEmbedded" />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { loadGtfsFromUrl } from '../services/gtfs'
import { useGtfsStore } from '../stores/gtfs'

const error = ref<string | null>(null)
const store = useGtfsStore()
const router = useRouter()
const loading = ref(false)

async function processEmbedded() {
  error.value = null
  loading.value = true
  try {
    store.loading = true
    const data = await loadGtfsFromUrl('/GTFSBHTRANS.zip')
    store.setAll({ ...data, fileName: data.fileName })
    await router.push('/map')
  } catch (e: any) {
    error.value = e?.message || String(e)
    // eslint-disable-next-line no-console
    console.error('GTFS embedded load error:', e)
  } finally {
    store.loading = false
    loading.value = false
  }
}

onMounted(() => {
  processEmbedded()
})
</script>
