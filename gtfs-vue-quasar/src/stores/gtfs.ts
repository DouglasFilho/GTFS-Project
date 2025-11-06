import { defineStore } from 'pinia'

export interface Stop {
  stop_id: string
  stop_name?: string
  stop_lat: number
  stop_lon: number
}

export interface Route {
  route_id: string | number
  route_short_name?: string
  route_long_name?: string
}

export interface Trip {
  trip_id: string | number
  route_id: string | number
}

export interface StopTime {
  trip_id: string | number
  arrival_time?: string
  departure_time?: string
  stop_id: string
  stop_sequence: number
}

interface State {
  loading: boolean
  fileName: string | null
  stops: Stop[]
  routes: Route[]
  trips: Trip[]
  stopTimes: StopTime[]
  frequencyByHour: number[] | null
  selectedRouteId: string | number | null
  frequencyByRoute: Record<string, number[]> | null
}

export const useGtfsStore = defineStore('gtfs', {
  state: (): State => ({
    loading: false,
    fileName: null,
    stops: [],
    routes: [],
    trips: [],
    stopTimes: [],
    frequencyByHour: null,
    selectedRouteId: null,
    frequencyByRoute: null,
  }),
  getters: {
    stopsById: (state) => {
      const map = new Map<string, Stop>()
      for (const s of state.stops) map.set(String(s.stop_id), s)
      return map
    },
    routesById: (state) => {
      const map = new Map<string | number, Route>()
      for (const r of state.routes) map.set(r.route_id, r)
      return map
    },
    tripsByRoute: (state) => {
      const map = new Map<string | number, Trip[]>()
      for (const t of state.trips) {
        const arr = map.get(t.route_id) || []
        arr.push(t)
        map.set(t.route_id, arr)
      }
      return map
    },
  },
  actions: {
    setAll(payload: Partial<State> & {
      stops: Stop[]
      routes: Route[]
      trips: Trip[]
      stopTimes: StopTime[]
      fileName?: string | null
    }) {
      this.stops = payload.stops
      this.routes = payload.routes
      this.trips = payload.trips
      this.stopTimes = payload.stopTimes
      if (payload.frequencyByHour) this.frequencyByHour = payload.frequencyByHour
      if (payload.frequencyByRoute) this.frequencyByRoute = payload.frequencyByRoute
      if (payload.fileName !== undefined) this.fileName = payload.fileName
    },
    selectRoute(routeId: string | number | null) {
      this.selectedRouteId = routeId
    },
  },
})
