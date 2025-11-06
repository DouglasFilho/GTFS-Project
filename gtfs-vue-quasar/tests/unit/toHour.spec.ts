import { describe, it, expect } from 'vitest'
import { toHour } from '../../src/utils/time'
import Papa from 'papaparse'

describe('toHour', () => {
  it('handles GTFS times beyond 24h', () => {
    expect(toHour('00:10:00')).toBe(0)
    expect(toHour('23:59:59')).toBe(23)
    expect(toHour('24:00:00')).toBe(0)
    expect(toHour('25:10:00')).toBe(1)
  })
})

describe('CSV parsing with Papa', () => {
  it('parses CSV into objects with correct keys', () => {
    const csv = `route_id,route_short_name,route_long_name\n1,A,Alpha Line\n2,B,Beta Line\n`
    const res = Papa.parse(csv, { header: true, dynamicTyping: true, skipEmptyLines: true })
    expect(res.errors.length).toBe(0)
    expect(res.data).toEqual([
      { route_id: 1, route_short_name: 'A', route_long_name: 'Alpha Line' },
      { route_id: 2, route_short_name: 'B', route_long_name: 'Beta Line' },
    ])
  })
})

