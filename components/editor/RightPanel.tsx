"use client";

import { useState, useEffect } from "react";
import { useEditorStore } from "@/store/editorStore";
import { useUIStore } from "@/store/uiStore";
import {
  loadThemes,
  saveTheme,
  deleteTheme,
  DEFAULT_THEMES,
  type ThemePreset,
} from "@/lib/themes";

const STRAVA_SWATCHES = [
  { label: "Strava Orange", color: "#FC4C02" },
  { label: "Strava Dark",   color: "#242428" },
  { label: "Strava White",  color: "#FFFFFF" },
  { label: "Strava Gray",   color: "#9B9B9B" },
  { label: "Strava Light",  color: "#F5F5F5" },
];

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  color: "#6B6B6B",
  marginBottom: 10,
  display: "block",
};

const DIVIDER: React.CSSProperties = {
  borderTop: "1px solid #E5E5E5",
  marginTop: 4,
  marginBottom: 4,
};

function chipBtn(active: boolean): React.CSSProperties {
  return {
    borderRadius: 4,
    border: active ? "1.5px solid #FC4C02" : "1px solid #E5E5E5",
    background: active ? "rgba(252,76,2,0.08)" : "#FFFFFF",
    color: active ? "#FC4C02" : "#6B6B6B",
    padding: "5px 8px",
    fontSize: 11,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.12s",
    textTransform: "capitalize" as const,
  };
}

export default function RightPanel() {
  const {
    theme, customColor, fontStyle, globalOpacity, unitSystem,
    elements, selectedIds,
    setTheme, setCustomColor, setFontStyle, setGlobalOpacity, setUnitSystem,
    updateElement, removeElement, duplicateElement,
  } = useEditorStore();
  const { pushToast } = useUIStore();

  const selectedElement = selectedIds.length === 1
    ? elements.find((el) => el.id === selectedIds[0])
    : null;

  const [themes, setThemes] = useState<ThemePreset[]>(DEFAULT_THEMES);
  const [savingTheme, setSavingTheme] = useState(false);
  const [themeNameInput, setThemeNameInput] = useState("");

  useEffect(() => {
    // Load custom themes from localStorage after hydration
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemes(loadThemes());
  }, []);

  const handleApplyTheme = (t: ThemePreset) => {
    if (t.textColor === "#FFFFFF") setTheme("white");
    else if (t.textColor === "#000000") setTheme("black");
    else { setTheme("custom"); setCustomColor(t.textColor); }
    setFontStyle(t.fontStyle);
    setGlobalOpacity(t.opacity);
    pushToast(`Applied theme: ${t.name}`, "success");
  };

  const handleSaveTheme = () => {
    const name = themeNameInput.trim();
    if (!name) {
      pushToast("Enter a name for the theme.", "info");
      return;
    }
    const newTheme: ThemePreset = {
      id: `custom-${Date.now()}`,
      name,
      createdAt: Date.now(),
      textColor: theme === "white" ? "#FFFFFF" : theme === "black" ? "#000000" : customColor,
      fontStyle,
      fontSize: 80,
      opacity: globalOpacity,
      elementBackground: "none",
      backgroundColor: "transparent",
      units: unitSystem,
    };
    saveTheme(newTheme);
    setThemes(loadThemes());
    setThemeNameInput("");
    setSavingTheme(false);
    pushToast(`Saved theme: ${newTheme.name}`, "success");
  };

  const handleDeleteTheme = (id: string) => {
    const themeToDelete = themes.find((t) => t.id === id);
    deleteTheme(id);
    setThemes(loadThemes());
    pushToast(`Deleted theme: ${themeToDelete?.name ?? "custom theme"}`, "info");
  };

  const isDefault = (id: string) => DEFAULT_THEMES.some((t) => t.id === id);

  return (
    <div className="p-4 space-y-5">

      {/* ── THEMES ─────────────────────────────── */}
      <div>
        <span style={SECTION_LABEL}>Saved Themes</span>

        {/* Scrollable theme chips */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6, marginBottom: 8 }}>
          {themes.map((t) => (
            <div key={t.id} style={{ position: "relative", flexShrink: 0 }}>
              <button
                onClick={() => handleApplyTheme(t)}
                title={t.name}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  padding: "6px 8px",
                  background: "#FFFFFF",
                  border: "1px solid #E5E5E5",
                  borderRadius: 6,
                  cursor: "pointer",
                  minWidth: 52,
                  transition: "border-color 0.12s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#FC4C02"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E5E5"; }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: 3,
                  background: t.textColor,
                  border: t.textColor === "#FFFFFF" ? "1px solid #E5E5E5" : "none",
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 9, color: "#6B6B6B", whiteSpace: "nowrap", maxWidth: 48, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {t.name}
                </span>
              </button>
              {!isDefault(t.id) && (
                <button
                  onClick={() => handleDeleteTheme(t.id)}
                  style={{
                    position: "absolute", top: -4, right: -4,
                    width: 14, height: 14, borderRadius: "50%",
                    background: "#FFFFFF", border: "1px solid #E5E5E5",
                    color: "#6B6B6B", fontSize: 8,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", lineHeight: 1,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {savingTheme ? (
          <div className="flex gap-1">
            <input
              autoFocus
              type="text"
              placeholder="Theme name…"
              value={themeNameInput}
              onChange={(e) => setThemeNameInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSaveTheme(); if (e.key === "Escape") { setSavingTheme(false); setThemeNameInput(""); } }}
              className="flex-1 text-xs px-2 py-1.5 outline-none"
              style={{ border: "1px solid #FC4C02", borderRadius: 4, background: "#FFFFFF", color: "#111111" }}
            />
            <button
              onClick={handleSaveTheme}
              className="text-xs px-2 py-1.5 text-white font-semibold"
              style={{ background: "#FC4C02", borderRadius: 4 }}
            >
              Save
            </button>
            <button
              onClick={() => { setSavingTheme(false); setThemeNameInput(""); }}
              className="text-xs px-2 py-1.5"
              style={{ border: "1px solid #E5E5E5", borderRadius: 4, color: "#6B6B6B" }}
            >
              ×
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSavingTheme(true)}
            className="w-full text-xs py-2 transition-all"
            style={{ border: "1px solid #E5E5E5", borderRadius: 4, background: "#FFFFFF", color: "#6B6B6B" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#FC4C02"; (e.currentTarget as HTMLButtonElement).style.color = "#FC4C02"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E5E5"; (e.currentTarget as HTMLButtonElement).style.color = "#6B6B6B"; }}
          >
            Save current as theme
          </button>
        )}
      </div>

      <div style={DIVIDER} />

      {/* ── SELECTED ELEMENT ───────────────────── */}
      {selectedElement && (
        <>
          <div className="space-y-3">
            <span style={SECTION_LABEL}>Element</span>

            {selectedElement.type === "stat" && (
              <div>
                <label className="text-xs mb-1 block" style={{ color: "#6B6B6B" }}>
                  Font Size: {selectedElement.fontSize || 80}px
                </label>
                <input
                  type="range" min={20} max={300}
                  value={selectedElement.fontSize || 80}
                  onChange={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                  className="w-full accent-[#FC4C02]"
                />
              </div>
            )}

            <div>
              <label className="text-xs mb-1 block" style={{ color: "#6B6B6B" }}>
                Opacity: {Math.round((selectedElement.opacity ?? 1) * 100)}%
              </label>
              <input
                type="range" min={0} max={1} step={0.01}
                value={selectedElement.opacity ?? 1}
                onChange={(e) => updateElement(selectedElement.id, { opacity: Number(e.target.value) })}
                className="w-full accent-[#FC4C02]"
              />
            </div>

            {selectedElement.type === "stat" && (
              <div>
                <label className="text-xs mb-2 block" style={{ color: "#6B6B6B" }}>Background</label>
                <div className="grid grid-cols-3 gap-1">
                  {(["none", "frosted", "solid"] as const).map((bg) => (
                    <button key={bg} onClick={() => updateElement(selectedElement.id, { background: bg })}
                      style={chipBtn(selectedElement.background === bg)}>
                      {bg}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => duplicateElement(selectedElement.id)}
                className="flex-1 px-3 py-2 text-xs transition-all"
                style={{ background: "#F5F5F5", border: "1px solid #E5E5E5", borderRadius: 4, color: "#6B6B6B" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#111111"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#111111"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6B6B6B"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E5E5"; }}
              >
                Duplicate
              </button>
              <button
                onClick={() => removeElement(selectedElement.id)}
                className="flex-1 px-3 py-2 text-xs transition-all"
                style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 4, color: "#ef4444" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.12)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.06)"; }}
              >
                Delete
              </button>
            </div>
          </div>
          <div style={DIVIDER} />
        </>
      )}

      {/* ── THEME COLOR ────────────────────────── */}
      <div>
        <span style={SECTION_LABEL}>Theme Color</span>

        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 10, color: "#6B6B6B", marginBottom: 6 }}>Strava</p>
          <div style={{ display: "flex", gap: 6 }}>
            {STRAVA_SWATCHES.map((s) => (
              <button
                key={s.color}
                onClick={() => {
                  if (s.color === "#FFFFFF") setTheme("white");
                  else if (s.color === "#000000") setTheme("black");
                  else { setTheme("custom"); setCustomColor(s.color); }
                }}
                title={s.label}
                style={{
                  width: 24, height: 24, background: s.color,
                  border: "1px solid #E5E5E5", borderRadius: 3, cursor: "pointer", flexShrink: 0,
                }}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {(["white", "black", "custom"] as const).map((t) => (
            <button key={t} onClick={() => setTheme(t)} style={chipBtn(theme === t)}>{t}</button>
          ))}
        </div>

        {theme === "custom" && (
          <input
            type="color" value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="w-full h-10 cursor-pointer"
            style={{ border: "1px solid #E5E5E5", borderRadius: 4, background: "transparent" }}
          />
        )}
      </div>

      {/* ── FONT STYLE ─────────────────────────── */}
      <div>
        <span style={SECTION_LABEL}>Font Style</span>
        <div className="grid grid-cols-2 gap-1.5">
          {([
            { key: "clean", label: "Clean" },
            { key: "bold", label: "Bold" },
            { key: "minimal", label: "Minimal" },
            { key: "sport", label: "Sport" },
            { key: "mono", label: "Mono" },
            { key: "display", label: "Display" },
          ] as const).map((f) => (
            <button key={f.key} onClick={() => setFontStyle(f.key)} style={chipBtn(fontStyle === f.key)}>{f.label}</button>
          ))}
        </div>
      </div>

      {/* ── GLOBAL OPACITY ─────────────────────── */}
      <div>
        <span style={SECTION_LABEL}>
          Global Opacity: {Math.round(globalOpacity * 100)}%
        </span>
        <input
          type="range" min={0} max={1} step={0.01}
          value={globalOpacity}
          onChange={(e) => setGlobalOpacity(Number(e.target.value))}
          className="w-full accent-[#FC4C02]"
        />
      </div>

      {/* ── UNITS ──────────────────────────────── */}
      <div>
        <span style={SECTION_LABEL}>Units</span>
        <div className="grid grid-cols-2 gap-1.5">
          {(["metric", "imperial"] as const).map((u) => (
            <button key={u} onClick={() => setUnitSystem(u)} style={chipBtn(unitSystem === u)}>{u}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
