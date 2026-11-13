import { SpeedUnit, AltitudeUnit, AppLanguage } from '../types'

export function convertSpeed(speedMps: number, unit: SpeedUnit): number {
  if (!Number.isFinite(speedMps) || speedMps < 0) speedMps = 0
  switch (unit) {
    case 'km/h':
      return speedMps * 3.6
    case 'knots':
      return speedMps * 1.94384449
    case 'mph':
      return speedMps * 2.23693629
    case 'm/s':
      return speedMps
  }
}

export function formatSpeedValue(speedMps: number, unit: SpeedUnit): { integer: string; decimal: string } {
  const val = convertSpeed(speedMps, unit)
  const roundedTenths = Math.round(val * 10)
  const integer = Math.floor(roundedTenths / 10).toString()
  const decimal = (roundedTenths % 10).toString()
  return { integer, decimal }
}

export function convertAltitude(altitudeM: number, unit: AltitudeUnit): number {
  if (!Number.isFinite(altitudeM)) return 0
  return unit === 'ft' ? altitudeM * 3.2808399 : altitudeM
}

export function formatAltitudeValue(altitudeM: number | null | undefined, unit: AltitudeUnit = 'm'): string {
  if (altitudeM === null || altitudeM === undefined || !Number.isFinite(altitudeM)) {
    return '--'
  }
  const val = convertAltitude(altitudeM, unit)
  return Math.round(val).toLocaleString('en-US')
}

export function calculateMach(speedMps: number, altitudeM: number | null = null): number {
  if (!Number.isFinite(speedMps) || speedMps <= 0) return 0
  const alt = altitudeM !== null && Number.isFinite(altitudeM) ? Math.max(0, Math.min(11000, altitudeM)) : 0
  const tempKelvin = 288.15 - 0.0065 * alt
  const speedOfSound = Math.sqrt(1.4 * 287.05 * tempKelvin)
  return speedMps / speedOfSound
}

export function formatDistance(meters: number, speedUnit: SpeedUnit = 'km/h'): string {
  if (!Number.isFinite(meters) || meters < 0) meters = 0
  if (speedUnit === 'mph') {
    const miles = meters / 1609.344
    if (miles < 0.1) return `${Math.round(meters * 3.28084)} ft`
    return `${miles.toFixed(2)} mi`
  }
  if (speedUnit === 'knots') {
    const nm = meters / 1852
    if (nm < 0.1) return `${Math.round(meters)} m`
    return `${nm.toFixed(2)} NM`
  }
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }
  return `${(meters / 1000).toFixed(2)} km`
}

export function formatTripDistanceParts(meters: number, speedUnit: SpeedUnit = 'km/h'): { value: string; unit: string } {
  if (!Number.isFinite(meters) || meters < 0) meters = 0
  if (speedUnit === 'mph') {
    const miles = meters / 1609.344
    if (miles < 0.1) return { value: Math.round(meters * 3.28084).toString(), unit: 'ft' }
    return { value: miles < 100 ? miles.toFixed(1) : Math.round(miles).toString(), unit: 'mi' }
  }
  if (speedUnit === 'knots') {
    const nm = meters / 1852
    if (nm < 0.1) return { value: Math.round(meters).toString(), unit: 'm' }
    return { value: nm < 100 ? nm.toFixed(1) : Math.round(nm).toString(), unit: 'NM' }
  }
  if (meters < 1000) {
    return { value: Math.round(meters).toString(), unit: 'm' }
  }
  const km = meters / 1000
  return { value: km < 100 ? km.toFixed(1) : Math.round(km).toString(), unit: 'km' }
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0
  const totalSec = Math.floor(seconds)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function compassDirectionFromHeading(deg: number | null | undefined, lang: AppLanguage = 'zh'): string {
  if (deg === null || deg === undefined || !Number.isFinite(deg)) return '--'
  const normalized = ((deg % 360) + 360) % 360
  if (lang === 'en') {
    if (normalized >= 337.5 || normalized < 22.5) return 'N'
    if (normalized >= 22.5 && normalized < 67.5) return 'NE'
    if (normalized >= 67.5 && normalized < 112.5) return 'E'
    if (normalized >= 112.5 && normalized < 157.5) return 'SE'
    if (normalized >= 157.5 && normalized < 202.5) return 'S'
    if (normalized >= 202.5 && normalized < 247.5) return 'SW'
    if (normalized >= 247.5 && normalized < 292.5) return 'W'
    return 'NW'
  }
  if (normalized >= 337.5 || normalized < 22.5) return 'N 正北'
  if (normalized >= 22.5 && normalized < 67.5) return 'NE 东北'
  if (normalized >= 67.5 && normalized < 112.5) return 'E 正东'
  if (normalized >= 112.5 && normalized < 157.5) return 'SE 东南'
  if (normalized >= 157.5 && normalized < 202.5) return 'S 正南'
  if (normalized >= 202.5 && normalized < 247.5) return 'SW 西南'
  if (normalized >= 247.5 && normalized < 292.5) return 'W 正西'
  return 'NW 西北'
}
