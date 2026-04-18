import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UnitSystem } from "@/lib/units";

export interface CanvasElement {
  id: string;
  type: "stat" | "map" | "splits";
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  statKey?: string;
  label?: string;
  value?: string;
  fontSize?: number;
  opacity?: number;
  color?: string;
  background?: "none" | "frosted" | "solid";
  backgroundColor?: string;
  fontWeight?: "normal" | "bold" | "100";
  visible?: boolean;
}

export type FontStylePreset = "clean" | "bold" | "minimal" | "sport" | "mono" | "display";

export const CANVAS_DIMS = {
  portrait: { width: 1080, height: 1920 },
  landscape: { width: 1920, height: 1080 },
} as const;

// Fixed visual scale — display width is always 380/1080 * canvasWidth
export const BASE_DISPLAY_W = 380;

// Find a non-overlapping center position, offsetting by STEP if occupied.
// All candidate positions are clamped within canvas bounds.
function findCenterPosition(
  elements: CanvasElement[],
  canvasW: number,
  canvasH: number,
  elW: number,
  elH: number,
): { x: number; y: number } {
  const baseX = Math.round((canvasW - elW) / 2);
  const baseY = Math.round((canvasH - elH) / 2);
  const STEP = 50;
  const maxX = canvasW - elW;
  const maxY = canvasH - elH;

  for (let i = 0; i <= 12; i++) {
    const x = Math.min(baseX + i * STEP, maxX);
    const y = Math.min(baseY + i * STEP, maxY);
    const newCX = x + elW / 2;
    const newCY = y + elH / 2;
    const overlaps = elements.some((el) => {
      const elW2 = el.width ?? 300;
      const elH2 = el.height ?? 80;
      const elCX = el.x + elW2 / 2;
      const elCY = el.y + elH2 / 2;
      return (
        Math.abs(elCX - newCX) < (elW + elW2) / 2 &&
        Math.abs(elCY - newCY) < (elH + elH2) / 2
      );
    });
    if (!overlaps) return { x, y };
  }
  // Fallback: clamp center to canvas
  return { x: Math.min(baseX, maxX), y: Math.min(baseY, maxY) };
}

export interface EditorState {
  elements: CanvasElement[];
  selectedIds: string[];
  unitSystem: UnitSystem;
  theme: "white" | "black" | "custom";
  customColor: string;
  fontStyle: FontStylePreset;
  globalOpacity: number;
  orientation: "portrait" | "landscape";
  history: CanvasElement[][];
  historyIndex: number;
  previewMode: boolean;
  backgroundImage: string | null;
  customCanvasSize: { width: number; height: number } | null;

  // Actions
  addElement: (element: CanvasElement) => void;
  setBackgroundImage: (dataUrl: string | null) => void;
  setCustomCanvasSize: (size: { width: number; height: number } | null) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  removeElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  selectElement: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  setElements: (elements: CanvasElement[]) => void;
  setUnitSystem: (unit: UnitSystem) => void;
  setTheme: (theme: "white" | "black" | "custom") => void;
  setCustomColor: (color: string) => void;
  setFontStyle: (style: FontStylePreset) => void;
  setGlobalOpacity: (opacity: number) => void;
  setOrientation: (o: "portrait" | "landscape") => void;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
  togglePreview: () => void;
  resetEditor: () => void;
  resetElements: () => void;
  resetAll: () => void;
}

const initialState = {
  elements: [],
  selectedIds: [],
  unitSystem: "metric" as UnitSystem,
  theme: "white" as const,
  customColor: "#ffffff",
  fontStyle: "clean" as const,
  globalOpacity: 1,
  orientation: "portrait" as const,
  history: [[]],
  historyIndex: 0,
  previewMode: false,
  backgroundImage: null as string | null,
  customCanvasSize: null as { width: number; height: number } | null,
};

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addElement: (element) => {
        const state = get();
        const { width: canvasW, height: canvasH } =
          state.customCanvasSize ?? CANVAS_DIMS[state.orientation];
        let finalElement = element;

        if (element.x === -1) {
          const elW = element.width ?? 300;
          const elH = element.height ?? 80;
          const pos = findCenterPosition(state.elements, canvasW, canvasH, elW, elH);
          finalElement = { ...element, ...pos };
        }

        set((s) => ({ elements: [...s.elements, finalElement] }));
        get().pushHistory();
      },

      setBackgroundImage: (dataUrl) => set({ backgroundImage: dataUrl }),

      setCustomCanvasSize: (size) => set({ customCanvasSize: size }),

      updateElement: (id, updates) => {
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, ...updates } : el
          ),
        }));
      },

      removeElement: (id) => {
        set((state) => ({
          elements: state.elements.filter((el) => el.id !== id),
          selectedIds: state.selectedIds.filter((sid) => sid !== id),
        }));
        get().pushHistory();
      },

      duplicateElement: (id) => {
        const element = get().elements.find((el) => el.id === id);
        if (!element) return;
        const newElement = {
          ...element,
          id: `${Date.now()}-${Math.random()}`,
          x: element.x + 20,
          y: element.y + 20,
        };
        set((state) => ({ elements: [...state.elements, newElement] }));
        get().pushHistory();
      },

      selectElement: (id, multi = false) => {
        set((state) => {
          if (multi) {
            const already = state.selectedIds.includes(id);
            return {
              selectedIds: already
                ? state.selectedIds.filter((sid) => sid !== id)
                : [...state.selectedIds, id],
            };
          }
          return { selectedIds: [id] };
        });
      },

      clearSelection: () => set({ selectedIds: [] }),

      setElements: (elements) => set({ elements }),

      setUnitSystem: (unitSystem) => set({ unitSystem }),

      setTheme: (theme) => set({ theme }),

      setCustomColor: (customColor) => set({ customColor }),

      setFontStyle: (fontStyle) => set({ fontStyle }),

      setGlobalOpacity: (globalOpacity) => set({ globalOpacity }),

      setOrientation: (o) => {
        const { orientation, elements } = get();
        if (o === orientation) return;
        const from = CANVAS_DIMS[orientation];
        const to = CANVAS_DIMS[o];
        const scaleX = to.width / from.width;
        const scaleY = to.height / from.height;
        const scaled = elements.map((el) => ({
          ...el,
          x: Math.round(el.x * scaleX),
          y: Math.round(el.y * scaleY),
        }));
        set({ orientation: o, elements: scaled });
        get().pushHistory();
      },

      pushHistory: () => {
        const { elements, history, historyIndex } = get();
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push([...elements]);
        set({
          history: newHistory.slice(-50),
          historyIndex: Math.min(newHistory.length - 1, 49),
        });
      },

      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          set({ elements: [...history[newIndex]], historyIndex: newIndex });
        }
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          set({ elements: [...history[newIndex]], historyIndex: newIndex });
        }
      },

      togglePreview: () => set((state) => ({ previewMode: !state.previewMode })),

      resetEditor: () => set({ ...initialState, unitSystem: get().unitSystem, theme: get().theme }),

      resetElements: () => {
        get().pushHistory();
        set({ elements: [], selectedIds: [] });
        get().pushHistory();
      },

      resetAll: () => {
        get().pushHistory();
        set({
          elements: [],
          selectedIds: [],
          theme: "white",
          customColor: "#ffffff",
          fontStyle: "clean",
          globalOpacity: 1,
          orientation: "portrait",
          backgroundImage: null,
          customCanvasSize: null,
        });
        get().pushHistory();
      },
    }),
    {
      name: "strava-editor-store",
      partialize: (state) => ({
        unitSystem: state.unitSystem,
        theme: state.theme,
        customColor: state.customColor,
        fontStyle: state.fontStyle,
        globalOpacity: state.globalOpacity,
        orientation: state.orientation,
      }),
    }
  )
);
