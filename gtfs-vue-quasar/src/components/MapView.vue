<template>
  <q-page padding>
    <div class="row items-center q-gutter-sm q-mb-sm">
      <q-badge v-if="selectedRouteLabel" color="primary" outline>
        Linha selecionada: {{ selectedRouteLabel }}
      </q-badge>
      <q-btn v-if="selectedRouteId !== null" dense flat icon="close" label="Limpar seleção" @click="clearSelection" />
    </div>
    <div id="map" style="height: 70vh; width: 100%"></div>
    <div class="q-mt-md">
      <FrequencyChart />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import * as L from 'leaflet'
import { storeToRefs } from 'pinia'
import { useGtfsStore } from '../stores/gtfs'
import FrequencyChart from './FrequencyChart.vue'

const store = useGtfsStore()
const { stops, stopTimes, selectedRouteId, routes } = storeToRefs(store)

const selectedRouteLabel = computed(() => {
  if (selectedRouteId.value === null) return ''
  const r = routes.value.find((r) => String(r.route_id) === String(selectedRouteId.value))
  return r ? `${r.route_short_name || r.route_id} - ${r.route_long_name || ''}` : String(selectedRouteId.value)
})

const stopsForSelectedRoute = computed(() => {
  if (selectedRouteId.value === null) return null
  const trips = store.tripsByRoute.get(selectedRouteId.value) || []
  if (!trips.length) return [] as any[]
  const tripIds = new Set(trips.map((t) => t.trip_id))
  const stopIdSet = new Set<string>()
  for (const st of stopTimes.value) {
    if (tripIds.has(st.trip_id)) stopIdSet.add(String(st.stop_id))
  }
  const result: any[] = []
  for (const s of stops.value) {
    if (stopIdSet.has(String(s.stop_id))) result.push(s)
  }
  return result
})

const stopsToRender = computed(() => stopsForSelectedRoute.value ?? (stops.value as any[]))

const mapRef = ref<L.Map | null>(null)
const layerRef = ref<L.LayerGroup | null>(null)

function clearSelection() {
  store.selectRoute(null)
}

function renderMarkers() {
  if (!mapRef.value || !layerRef.value) return
  const lg = layerRef.value
  lg.clearLayers()
  const limit = Math.min(stopsToRender.value.length, 2000)
  const bounds: L.LatLngBoundsExpression = []
  for (let i = 0; i < limit; i++) {
    const s = stopsToRender.value[i] as any
    const lat = Number(s.stop_lat)
    const lon = Number(s.stop_lon)
    if (!isFinite(lat) || !isFinite(lon)) continue
    const marker = L.circleMarker([lat, lon], { radius: 3 })
    if (s.stop_name) marker.bindTooltip(String(s.stop_name))
    marker.addTo(lg)
    ;(bounds as any).push([lat, lon])
  }
  if ((bounds as any).length > 0) {
    mapRef.value.fitBounds(bounds as any, { padding: [20, 20] })
  }
}

onMounted(() => {
  const map = L.map('map')
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)
  mapRef.value = map
  layerRef.value = L.layerGroup().addTo(map)
  renderMarkers()
})

watch(stopsToRender, renderMarkers)
</script>
