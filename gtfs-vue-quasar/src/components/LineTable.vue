<template>
  <q-page padding>
    <div class="q-gutter-md">
      <q-input v-model="filter" label="Buscar linha" dense outlined clearable debounce="200" />
      <q-table
        :rows="filtered"
        :columns="columns"
        row-key="route_id"
        flat
        bordered
        :pagination="{ rowsPerPage: 20 }"
        @row-click="onRowClick"
      />
    </div>
  </q-page>
  
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGtfsStore, type Route } from '../stores/gtfs'
import { useRouter } from 'vue-router'

const store = useGtfsStore()
const filter = ref('')
const router = useRouter()

const columns = [
  { name: 'route_id', label: 'ID', field: 'route_id', align: 'left', sortable: true },
  { name: 'route_short_name', label: 'Sigla', field: 'route_short_name', align: 'left', sortable: true },
  { name: 'route_long_name', label: 'Nome', field: 'route_long_name', align: 'left', sortable: true },
]

const filtered = computed<Route[]>(() => {
  const q = filter.value.trim().toLowerCase()
  if (!q) return store.routes as Route[]
  return (store.routes as Route[]).filter((r) =>
    String(r.route_id).toLowerCase().includes(q) ||
    String(r.route_short_name || '').toLowerCase().includes(q) ||
    String(r.route_long_name || '').toLowerCase().includes(q)
  )
})

function onRowClick(_evt: unknown, row: Route) {
  store.selectRoute(row.route_id)
  router.push('/map')
}
</script>
