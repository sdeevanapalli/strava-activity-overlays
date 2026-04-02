"use client";

import { useState, useEffect } from "react";
import { useEditorStore } from "@/store/editorStore";
import {
  loadThemes,
  saveTheme,
  deleteTheme,
  DEFAULT_THEMES,
  type ThemePreset,
} from "@/lib/themes";

const STRAVA_SWATCHES = [
  { label: "Strava Orange", color: "#FC4C02" },
  { label: "Strava Dark", color: "#242428" },
  { label: "Strava White", color: "#FFFFFF" },
  { label: "Strava Gray", color: "#9B9B9B" },
  { label: "Strava Light", color: "#F5F5F5" },
];

const SECTION_HEADER_STYLE: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  color: "#6B6B6B",
  marginBottom: 12,
  display: "block",
};

const BUTTON_STYLE = (active: boolean): React.CSSProperties => ({
  borderRadius: 4,
  border: active ? "1px solid #FC4C02" : "1px solid rgba(255,255,255,0.08)",
  background: active ? "rgba(252,76,2,0.1)" : "#1A1A1A",
  color: active ? "#FC4C02" : "#9B9B9B",
  padding: "6px 8px",
  fontSize: 11,
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.15s",
  textTransform: "capitalize",
});

export default function RightPanel() {
  const {
    theme,
    customColor,
    fontStyle,
    globalOpacity,
    unitSystem,
    elements,
    selectedIds,
    setTheme,
    setCustomColor,
    setFontStyle,
    setGlobalOpacity,
    setUnitSystem,
    updateElement,
    removeElement,
    duplicateElement,
  } = useEditorStore();

  const selectedElement = selectedIds.length === 1
    ? elements.find((el) => el.id === selectedIds[0])
    : null;

  // Theme preset state
  const [themes, setThemes] = useState<ThemePreset[]>(DEFAULT_THEMES);

  useEffect(() => {
    setThemes(loadThemes());
  }, []);

  const handleApplyTheme = (t: ThemePreset) => {
    if (t.textColor === "#FFFFFF") setTheme("white");
    else if (t.textColor === "#000000") setTheme("black");
    else {
      setTheme("custom");
      setCustomColor(t.textColor);
    }
    setFontStyle(t.fontStyle);
    setGlobalOpacity(t.opacity);
  };

  const handleSaveTheme = () => {
    const name = window.prompt("Name this theme:");
    if (!name) return;
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
  };

  const handleDeleteTheme = (id: string) => {
    deleteTheme(id);
    setThemes(loadThemes());
  };

  const isDefaultTheme = (id: string) => DEFAULT_THEMES.some((t) => t.id === id);

  return (
    <div className="p-4 space-y-6">
      {/* Selected element controls */}
      {selectedElement && (
        <div className="space-y-4">
          <span style={SECTION_HEADER_STYLE}>Element</span>

          {/* Font size (stat blocks only) */}
          {selectedElement.type === "stat" && (
            <div>
              <label className="text-xs mb-1 block" style={{ color: "#9B9B9B" }}>
                Font Size: {selectedElement.fontSize || 80}px
              </label>
              <input
                type="range"
                min={24}
                max={200}
                value={selectedElement.fontSize || 80}
                onChange={(e) =>
                  updateElement(selectedElement.id, { fontSize: Number(e.target.value) })
                }
                className="w-full accent-[#FC4C02]"
              />
            </div>
          )}

          {/* Element opacity */}
          <div>
            <label className="text-xs mb-1 block" style={{ color: "#9B9B9B" }}>
              Opacity: {Math.round((selectedElement.opacity ?? 1) * 100)}%
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={selectedElement.opacity ?? 1}
              onChange={(e) =>
                updateElement(selectedElement.id, { opacity: Number(e.target.value) })
              }
              className="w-full accent-[#FC4C02]"
            />
          </div>

          {/* Background style */}
          {selectedElement.type === "stat" && (
            <div>
              <label className="text-xs mb-2 block" style={{ color: "#9B9B9B" }}>Background</label>
              <div className="grid grid-cols-3 gap-1">
                {(["none", "frosted", "solid"] as const).map((bg) => (
                  <button
                    key={bg}
                    onClick={() => updateElement(selectedElement.id, { background: bg })}
                    style={BUTTON_STYLE(selectedElement.background === bg)}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Element actions */}
          <div className="flex gap-2">
            <button
              onClick={() => duplicateElement(selectedElement.id)}
              className="flex-1 px-3 py-2 text-xs transition-all"
              style={{
                background: "#1A1A1A",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 4,
                color: "#9B9B9B",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#FFFFFF"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#9B9B9B"; }}
            >
              Duplicate
            </button>
            <button
              onClick={() => removeElement(selectedElement.id)}
              className="flex-1 px-3 py-2 text-xs transition-all"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 4,
                color: "#f87171",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)";
              }}
            >
              Delete
            </button>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />
        </div>
      )}

      {/* THEMES section */}
      <div>
        <span style={SECTION_HEADER_STYLE}>Themes</span>

        {/* Horizontal scrollable theme chips */}
        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 8,
            marginBottom: 8,
          }}
        >
          {themes.map((t) => (
            <div
              key={t.id}
              style={{ position: "relative", flexShrink: 0 }}
            >
              <button
                onClick={() => handleApplyTheme(t)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  padding: "6px 8px",
                  background: "#1A1A1A",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 4,
                  cursor: "pointer",
                  minWidth: 56,
                }}
                title={t.name}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 2,
                    background: t.textColor,
                    border: "1px solid rgba(255,255,255,0.15)",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 9, color: "#9B9B9B", whiteSpace: "nowrap", maxWidth: 52, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {t.name}
                </span>
              </button>
              {!isDefaultTheme(t.id) && (
                <button
                  onClick={() => handleDeleteTheme(t.id)}
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: "#242424",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "#9B9B9B",
                    fontSize: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleSaveTheme}
          className="w-full text-xs py-2 transition-all"
          style={{
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 4,
            background: "transparent",
            color: "#9B9B9B",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#FFFFFF"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.3)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#9B9B9B"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.15)"; }}
        >
          Save current as theme
        </button>
      </div>

      {/* Global Theme */}
      <div>
        <span style={SECTION_HEADER_STYLE}>Theme Color</span>

        {/* Strava preset swatches */}
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 10, color: "#6B6B6B", marginBottom: 6 }}>Strava</p>
          <div style={{ display: "flex", gap: 6 }}>
            {STRAVA_SWATCHES.map((s) => (
              <button
                key={s.color}
                onClick={() => {
                  if (s.color === "#FFFFFF") setTheme("white");
                  else if (s.color === "#000000") setTheme("black");
                  else {
                    setTheme("custom");
                    setCustomColor(s.color);
                  }
                }}
                title={s.label}
                style={{
                  width: 24,
                  height: 24,
                  background: s.color,
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 2,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {(["white", "black", "custom"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              style={BUTTON_STYLE(theme === t)}
            >
              {t}
            </button>
          ))}
        </div>
        {theme === "custom" && (
          <input
            type="color"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="w-full h-10 cursor-pointer bg-transparent"
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 4,
            }}
          />
        )}
      </div>

      {/* Font Style */}
      <div>
        <span style={SECTION_HEADER_STYLE}>Font Style</span>
        <div className="grid grid-cols-3 gap-1.5">
          {(["clean", "bold", "minimal"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFontStyle(f)}
              style={BUTTON_STYLE(fontStyle === f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Global Opacity */}
      <div>
        <span style={SECTION_HEADER_STYLE}>
          Global Opacity: {Math.round(globalOpacity * 100)}%
        </span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={globalOpacity}
          onChange={(e) => setGlobalOpacity(Number(e.target.value))}
          className="w-full accent-[#FC4C02]"
        />
      </div>

      {/* Units */}
      <div>
        <span style={SECTION_HEADER_STYLE}>Units</span>
        <div className="grid grid-cols-2 gap-1.5">
          {(["metric", "imperial"] as const).map((u) => (
            <button
              key={u}
              onClick={() => setUnitSystem(u)}
              style={BUTTON_STYLE(unitSystem === u)}
            >
              {u}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
