import { test, expect } from '@playwright/test'
import JSZip from 'jszip'

async function buildSampleGtfsZip(): Promise<Buffer> {
  const zip = new JSZip()
  const stops = `stop_id,stop_name,stop_lat,stop_lon\nS1,Stop 1,-23.55,-46.63\nS2,Stop 2,-23.56,-46.62\n`
  const routes = `route_id,route_short_name,route_long_name\n1,A,Alpha Line\n`
  const trips = `route_id,trip_id\n1,T1\n1,T2\n`
  const stop_times = `trip_id,arrival_time,departure_time,stop_id,stop_sequence\nT1,08:00:00,08:00:00,S1,1\nT1,08:10:00,08:10:00,S2,2\nT2,09:00:00,09:00:00,S1,1\n`
  zip.file('stops.txt', stops)
  zip.file('routes.txt', routes)
  zip.file('trips.txt', trips)
  zip.file('stop_times.txt', stop_times)
  const buf = await zip.generateAsync({ type: 'nodebuffer' })
  return buf
}

test('auto-load embedded zip -> map -> lines', async ({ page, context }) => {
  // Intercept request to embedded ZIP and fulfill with a small synthetic GTFS
  const zipBuffer = await buildSampleGtfsZip()
  await page.route('**/GTFSBHTRANS.zip', (route) =>
    route.fulfill({ body: zipBuffer, contentType: 'application/zip' })
  )

  await page.goto('/')

  await page.waitForURL('**/map')
  await expect(page.locator('#map')).toBeVisible()

  await page.getByRole('link', { name: 'Linhas' }).click()
  await page.waitForURL('**/lines')
  // QTable renders rows in tbody > tr
  const rows = await page.locator('table tbody tr').count()
  expect(rows).toBeGreaterThan(0)
})
