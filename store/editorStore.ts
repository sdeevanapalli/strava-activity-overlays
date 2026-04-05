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

// Smart placement grid
const COLS = 3;
const ROWS = 6;

function isCellOccupied(col: number, row: number, canvasW: number, canvasH: number, elements: CanvasElement[]): boolean {
  const cellW = canvasW / COLS;
  const cellH = canvasH / ROWS;
  const cellX = col * cellW + cellW / 2;
  const cellY = row * cellH + cellH / 2;
  return elements.some((el) => {
    const elCX = el.x + (el.width || 300) / 2;
    const elCY = el.y + (el.height || 80) / 2;
    return Math.abs(elCX - cellX) < cellW / 2 && Math.abs(elCY - cellY) < cellH / 2;
  });
}

function findNextPosition(elements: CanvasElement[], canvasW: number, canvasH: number): { x: number; y: number } {
  const cellW = canvasW / COLS;
  const cellH = canvasH / ROWS;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (!isCellOccupied(col, row, canvasW, canvasH, elements)) {
        return {
          x: col * cellW + 40,
          y: row * cellH + cellH / 2 - 40,
        };
      }
    }
  }
  const last = elements[elements.length - 1];
  return last ? { x: last.x + 24, y: last.y + 24 } : { x: 100, y: 100 };
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

  // Actions
  addElement: (element: CanvasElement) => void;
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
};

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addElement: (element) => {
        const state = get();
        const { width: canvasW, height: canvasH } = CANVAS_DIMS[state.orientation];
        let finalElement = element;

        if (element.x === -1 && element.type === "stat") {
          const pos = findNextPosition(state.elements, canvasW, canvasH);
          finalElement = { ...element, x: pos.x, y: pos.y };
        }

        set((s) => ({ elements: [...s.elements, finalElement] }));
        get().pushHistory();
      },

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
