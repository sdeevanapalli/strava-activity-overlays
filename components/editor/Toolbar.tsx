"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import type { StravaActivity } from "@/types/strava";
import { useEditorStore } from "@/store/editorStore";
import { exportCanvas, copyCanvasToClipboard } from "@/lib/canvas-export";

interface ToolbarProps {
  activity: StravaActivity;
  stageRef: React.MutableRefObject<any>;
}

function PortraitIcon({ active }: { active: boolean }) {
  return (
    <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
      <rect
        x="1" y="1" width="12" height="16" rx="2"
        stroke={active ? "#FC4C02" : "#6B6B6B"}
        strokeWidth="1.5"
        fill={active ? "rgba(252,76,2,0.12)" : "transparent"}
      />
    </svg>
  );
}

function LandscapeIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
      <rect
        x="1" y="1" width="16" height="12" rx="2"
        stroke={active ? "#FC4C02" : "#6B6B6B"}
        strokeWidth="1.5"
        fill={active ? "rgba(252,76,2,0.12)" : "transparent"}
      />
    </svg>
  );
}

export default function Toolbar({ activity, stageRef }: ToolbarProps) {
  const router = useRouter();
  const {
    undo, redo, togglePreview, previewMode,
    history, historyIndex,
    orientation, setOrientation,
    resetElements, resetAll,
  } = useEditorStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<null | "clear" | "reset">(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleExport = async () => {
    if (!stageRef.current) return;
    await exportCanvas(stageRef.current, activity.name, activity.start_date_local);
  };

  const handleCopy = async () => {
    if (!stageRef.current) return;
    try {
      await copyCanvasToClipboard(stageRef.current);
      alert("Copied to clipboard!");
    } catch {
      alert("Copy failed. Try downloading instead.");
    }
  };

  const handleConfirm = () => {
    if (confirmModal === "clear") resetElements();
    else if (confirmModal === "reset") resetAll();
    setConfirmModal(null);
  };

  const iconBtn: React.CSSProperties = {
    padding: "6px",
    borderRadius: 4,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6B6B6B",
    transition: "color 0.15s, background 0.15s",
  };

  return (
    <>
      <header
        className="h-14 flex items-center px-4 gap-2 flex-shrink-0"
        style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E5E5" }}
      >
        {/* Back */}
        <button
          onClick={() => router.push("/dashboard")}
          style={iconBtn}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#111111"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6B6B6B"; }}
          title="Back to dashboard"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Activity name */}
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-extrabold truncate"
            style={{ color: "#111111", fontFamily: "var(--font-nunito), sans-serif" }}
          >
            {activity.name}
          </p>
        </div>

        {/* Orientation toggle */}
        <div
          className="flex items-center gap-1 px-2 py-1"
          style={{
            border: "1px solid #E5E5E5",
            borderRadius: 6,
            background: "#F5F5F5",
          }}
        >
          <button
            onClick={() => setOrientation("portrait")}
            style={{
              ...iconBtn,
              background: orientation === "portrait" ? "rgba(252,76,2,0.1)" : "transparent",
              padding: "4px 6px",
            }}
            title="Portrait (1080×1920)"
          >
            <PortraitIcon active={orientation === "portrait"} />
          </button>
          <button
            onClick={() => setOrientation("landscape")}
            style={{
              ...iconBtn,
              background: orientation === "landscape" ? "rgba(252,76,2,0.1)" : "transparent",
              padding: "4px 6px",
            }}
            title="Landscape (1920×1080)"
          >
            <LandscapeIcon active={orientation === "landscape"} />
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-5" style={{ background: "#E5E5E5" }} />

        {/* Undo/Redo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          style={iconBtn}
          onMouseEnter={(e) => { if (canUndo) (e.currentTarget as HTMLButtonElement).style.color = "#111111"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6B6B6B"; }}
          className="disabled:opacity-30 disabled:cursor-not-allowed"
          title="Undo (⌘Z)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          style={iconBtn}
          onMouseEnter={(e) => { if (canRedo) (e.currentTarget as HTMLButtonElement).style.color = "#111111"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6B6B6B"; }}
          className="disabled:opacity-30 disabled:cursor-not-allowed"
          title="Redo (⌘⇧Z)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
          </svg>
        </button>

        {/* Divider */}
        <div className="w-px h-5" style={{ background: "#E5E5E5" }} />

        {/* Preview toggle */}
        <button
          onClick={togglePreview}
          className="px-3 py-1.5 text-sm font-medium transition-all"
          style={{
            background: previewMode ? "#FC4C02" : "#F5F5F5",
            color: previewMode ? "#FFFFFF" : "#6B6B6B",
            borderRadius: 4,
            border: previewMode ? "none" : "1px solid #E5E5E5",
          }}
        >
          {previewMode ? "Editing" : "Preview"}
        </button>

        {/* Divider */}
        <div className="w-px h-5" style={{ background: "#E5E5E5" }} />

        {/* Copy */}
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 text-sm transition-all"
          style={{ color: "#6B6B6B" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#111111"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6B6B6B"; }}
        >
          Copy
        </button>

        {/* Download */}
        <button
          onClick={handleExport}
          className="px-4 py-2 text-white text-sm font-semibold flex items-center gap-2 transition-all hover:brightness-110"
          style={{ background: "#FC4C02", borderRadius: 0 }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </button>

        {/* Divider */}
        <div className="w-px h-5" style={{ background: "#E5E5E5" }} />

        {/* More options */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            style={iconBtn}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#111111"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6B6B6B"; }}
            title="More options"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>

          {menuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                background: "#FFFFFF",
                border: "1px solid #E5E5E5",
                borderRadius: 6,
                minWidth: 180,
                zIndex: 50,
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <button
                onClick={() => { setMenuOpen(false); setConfirmModal("clear"); }}
                className="w-full text-left px-4 py-3 text-sm transition-all"
                style={{ color: "#111111" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F5F5F5"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                Clear canvas
              </button>
              <div style={{ borderTop: "1px solid #E5E5E5" }} />
              <button
                onClick={() => { setMenuOpen(false); setConfirmModal("reset"); }}
                className="w-full text-left px-4 py-3 text-sm transition-all"
                style={{ color: "#FC4C02" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(252,76,2,0.05)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                Reset everything
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E5E5",
              borderRadius: 8,
              padding: 24,
              maxWidth: 360,
              width: "90%",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}
          >
            <h3
              className="font-bold mb-2"
              style={{ color: "#111111", fontFamily: "var(--font-nunito), sans-serif" }}
            >
              {confirmModal === "clear" ? "Clear canvas?" : "Reset everything?"}
            </h3>
            <p className="text-sm mb-6" style={{ color: "#6B6B6B" }}>
              {confirmModal === "clear"
                ? "All elements will be removed. Your theme settings will be kept. This action can be undone."
                : "All elements and theme settings will be reset to defaults. This action can be undone."}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 text-sm transition-all"
                style={{
                  border: "1px solid #E5E5E5",
                  borderRadius: 4,
                  background: "#F5F5F5",
                  color: "#6B6B6B",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 text-sm text-white font-semibold transition-all hover:brightness-110"
                style={{ background: "#FC4C02", borderRadius: 0 }}
              >
                {confirmModal === "clear" ? "Clear" : "Reset"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
