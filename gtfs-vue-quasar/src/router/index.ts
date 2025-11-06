import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import FileUpload from '../components/FileUpload.vue'
import MapView from '../components/MapView.vue'
import LineTable from '../components/LineTable.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'upload', component: FileUpload },
  { path: '/map', name: 'map', component: MapView },
  { path: '/lines', name: 'lines', component: LineTable },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
