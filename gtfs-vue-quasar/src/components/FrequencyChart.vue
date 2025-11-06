<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-subtitle1">Frequência de partidas por hora</div>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <canvas ref="canvas" height="200"></canvas>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { storeToRefs } from 'pinia'
import { useGtfsStore } from '../stores/gtfs'
import { toHour } from '../utils/time'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const canvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

const store = useGtfsStore()
const { stopTimes, frequencyByHour, frequencyByRoute, } = storeToRefs(store)
const selectedRouteId = storeToRefs(store).selectedRouteId

function buildData() {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  // If a route is selected and we have per-route aggregation from worker, use it
  if (selectedRouteId.value !== null && frequencyByRoute.value) {
    const arr = frequencyByRoute.value[String(selectedRouteId.value)]
    if (arr && arr.length === 24) return { hours, counts: arr }
  }

  if (selectedRouteId.value === null && frequencyByHour.value && frequencyByHour.value.length === 24) {
    return { hours, counts: frequencyByHour.value }
  }
  // Fallback: compute from sample stopTimes on the client
  const counts = new Array(24).fill(0)
  const max = Math.min(stopTimes.value.length, 50000)
  if (selectedRouteId.value !== null) {
    // Build trip set for selected route from store getter
    const trips = store.tripsByRoute.get(selectedRouteId.value) || []
    const tripIds = new Set(trips.map((t) => t.trip_id))
    for (let i = 0; i < max; i++) {
      const t = stopTimes.value[i]
      if (!t?.departure_time || !tripIds.has(t.trip_id)) continue
      const h = toHour(t.departure_time)
      counts[h]++
    }
    return { hours, counts }
  } else {
    for (let i = 0; i < max; i++) {
      const t = stopTimes.value[i]
      if (!t?.departure_time) continue
      const h = toHour(t.departure_time)
      counts[h]++
    }
    return { hours, counts }
  }
}

function render() {
  if (!canvas.value) return
  const { hours, counts } = buildData()
  chart?.destroy()
  chart = new Chart(canvas.value.getContext('2d')!, {
    type: 'bar',
    data: {
      labels: hours.map((h) => h.toString().padStart(2, '0')),
      datasets: [
        { label: 'Partidas', data: counts, backgroundColor: '#42a5f5' },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } },
    },
  })
}

onMounted(render)
watch([stopTimes, frequencyByHour, frequencyByRoute, selectedRouteId], render)
onBeforeUnmount(() => chart?.destroy())
</script>
