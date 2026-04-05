import type { FontStylePreset } from "@/store/editorStore";
import type { CanvasElement } from "@/store/editorStore";

export type ThemePreset = {
  id: string;
  name: string;
  createdAt: number;
  textColor: string;
  fontStyle: FontStylePreset;
  fontSize: number;
  opacity: number;
  elementBackground: 'none' | 'frosted' | 'solid';
  backgroundColor: string;
  units: 'metric' | 'imperial';
};

export type ActivityPreset = {
  activityId: string;
  themeId: string;
  elements: CanvasElement[];
  savedAt: number;
};

export const DEFAULT_THEMES: ThemePreset[] = [
  {
    id: 'default-white',
    name: 'Clean White',
    createdAt: 0,
    textColor: '#FFFFFF',
    fontStyle: 'clean',
    fontSize: 80,
    opacity: 1,
    elementBackground: 'none',
    backgroundColor: 'transparent',
    units: 'metric',
  },
  {
    id: 'default-black',
    name: 'Bold Black',
    createdAt: 0,
    textColor: '#000000',
    fontStyle: 'bold',
    fontSize: 80,
    opacity: 1,
    elementBackground: 'solid',
    backgroundColor: '#FFFFFF',
    units: 'metric',
  },
  {
    id: 'default-strava',
    name: 'Strava Orange',
    createdAt: 0,
    textColor: '#FC4C02',
    fontStyle: 'bold',
    fontSize: 80,
    opacity: 1,
    elementBackground: 'none',
    backgroundColor: 'transparent',
    units: 'metric',
  },
];

const THEMES_KEY = 'sc_themes';
const PRESETS_KEY = 'sc_activity_presets';

export function loadThemes(): ThemePreset[] {
  if (typeof window === 'undefined') return DEFAULT_THEMES;
  try {
    const stored = localStorage.getItem(THEMES_KEY);
    if (!stored) return DEFAULT_THEMES;
    const custom: ThemePreset[] = JSON.parse(stored);
    return [...DEFAULT_THEMES, ...custom];
  } catch {
    return DEFAULT_THEMES;
  }
}

export function saveTheme(theme: ThemePreset): void {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(THEMES_KEY);
    const custom: ThemePreset[] = stored ? JSON.parse(stored) : [];
    // Don't save defaults
    const filtered = custom.filter(t => t.id !== theme.id);
    localStorage.setItem(THEMES_KEY, JSON.stringify([...filtered, theme]));
  } catch {}
}

export function deleteTheme(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(THEMES_KEY);
    const custom: ThemePreset[] = stored ? JSON.parse(stored) : [];
    localStorage.setItem(THEMES_KEY, JSON.stringify(custom.filter(t => t.id !== id)));
  } catch {}
}

export function loadActivityPreset(activityId: string): ActivityPreset | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(PRESETS_KEY);
    if (!stored) return null;
    const presets: ActivityPreset[] = JSON.parse(stored);
    return presets.find(p => p.activityId === activityId) || null;
  } catch {
    return null;
  }
}

export function saveActivityPreset(preset: ActivityPreset): void {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(PRESETS_KEY);
    const presets: ActivityPreset[] = stored ? JSON.parse(stored) : [];
    const filtered = presets.filter(p => p.activityId !== preset.activityId);
    localStorage.setItem(PRESETS_KEY, JSON.stringify([...filtered, preset]));
  } catch {}
}
