/// <reference lib="webworker" />
import JSZip from 'jszip'
import Papa from 'papaparse'

type WorkerIn = { buffer: ArrayBuffer; fileName: string }

self.onmessage = async (e: MessageEvent<WorkerIn>) => {
  try {
    const { buffer, fileName } = e.data
    const zip = await JSZip.loadAsync(buffer)
    const required = ['stops.txt', 'routes.txt', 'trips.txt', 'stop_times.txt']
    for (const name of required) {
      if (!zip.file(name)) {
        throw new Error(`Arquivo obrigatório ausente: ${name}`)
      }
    }

    const readText = async (name: string) => {
      const f = zip.file(name)
      if (!f) throw new Error(`Arquivo não encontrado: ${name}`)
      return await f.async('text')
    }

    const parseCsv = <T = any>(text: string): T[] => {
      const res = Papa.parse<T>(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      })
      if (res.errors?.length) {
        throw new Error(`Erro ao parsear ${res.errors[0].row}: ${res.errors[0].message}`)
      }
      // Filter out undefined/empty rows that can appear with header:true
      return (res.data as any[]).filter((r) => r && Object.keys(r).length > 0) as T[]
    }

    const [stopsTxt, routesTxt, tripsTxt, stopTimesTxt] = await Promise.all([
      readText('stops.txt'),
      readText('routes.txt'),
      readText('trips.txt'),
      readText('stop_times.txt'),
    ])

    const stops = parseCsv(stopsTxt)
    const routes = parseCsv(routesTxt)
    const trips = parseCsv(tripsTxt)

    // Stream-like parse for stop_times: build frequency counts and keep only a sample
    const frequencyByHour = new Array(24).fill(0)
    const frequencyByRoute: Record<string, number[]> = {}

    // Map trip_id -> route_id for fast lookup while streaming stop_times
    const tripToRoute = new Map<string | number, string | number>()
    for (const t of trips as any[]) tripToRoute.set(t.trip_id, t.route_id)
    const sample: any[] = []
    Papa.parse<any>(stopTimesTxt, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      step: (row) => {
        const st = row.data as any
        if (st && st.departure_time) {
          const hStr = String(st.departure_time).split(':')[0]
          const hNum = Number(hStr)
          const hour = isFinite(hNum) ? ((hNum % 24) + 24) % 24 : 0
          frequencyByHour[hour]++
          const routeId = tripToRoute.get(st.trip_id)
          if (routeId !== undefined) {
            const key = String(routeId)
            const arr = (frequencyByRoute[key] ||= new Array(24).fill(0))
            arr[hour]++
          }
        }
        if (sample.length < 50000) {
          st.stop_sequence = typeof st.stop_sequence === 'string' ? Number(st.stop_sequence) : st.stop_sequence
          sample.push(st)
        }
      },
    })

    ;(self as any).postMessage({ fileName, stops, routes, trips, stopTimes: sample, frequencyByHour, frequencyByRoute })
  } catch (error: any) {
    ;(self as any).postMessage({ error: String(error?.message || error) })
  }
}
