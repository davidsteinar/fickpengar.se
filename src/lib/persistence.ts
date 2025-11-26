import type { EmployeeRatios, EntrepreneurDefaults, TaskDetails } from './types'

export interface StoredSettings {
  employee?: Partial<EmployeeRatios>
  entrepreneur?: Partial<EntrepreneurDefaults>
  lastTask?: Partial<TaskDetails>
}

export const STORAGE_KEY = 'fickpengar-settings'

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

export function loadSettings(): StoredSettings {
  if (!isBrowser()) return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as StoredSettings
  } catch {
    return {}
  }
}

export function saveSettings(update: StoredSettings) {
  if (!isBrowser()) return
  try {
    const existing = loadSettings()
    const merged = { ...existing, ...update }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  } catch {}
}
