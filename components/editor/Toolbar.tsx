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

const DISPLAY_W = 380;

export default function Toolbar({ activity, stageRef }: ToolbarProps) {
  const router = useRouter();
  const { undo, redo, togglePreview, previewMode, history, historyIndex, resetElements, resetAll } =
    useEditorStore();
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<null | "clear" | "reset">(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
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
    await exportCanvas(
      stageRef.current,
      DISPLAY_W,
      activity.name,
      activity.start_date_local
    );
  };

  const handleCopy = async () => {
    if (!stageRef.current) return;
    try {
      await copyCanvasToClipboard(stageRef.current, DISPLAY_W);
      alert("Copied to clipboard!");
    } catch (err) {
      alert("Copy failed. Try downloading instead.");
    }
  };

  const handleClearCanvas = () => {
    setMenuOpen(false);
    setConfirmModal("clear");
  };

  const handleResetEverything = () => {
    setMenuOpen(false);
    setConfirmModal("reset");
  };

  const handleConfirm = () => {
    if (confirmModal === "clear") {
      resetElements();
    } else if (confirmModal === "reset") {
      resetAll();
    }
    setConfirmModal(null);
  };

  return (
    <>
      <header
        className="h-14 flex items-center px-4 gap-2 flex-shrink-0"
        style={{
          background: "#0A0A0A",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Back */}
        <button
          onClick={() => router.push("/dashboard")}
          className="p-2 text-gray-400 hover:text-white transition-all"
          title="Back to dashboard"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Activity name */}
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-extrabold text-white truncate"
            style={{ fontFamily: "var(--font-nunito), sans-serif" }}
          >
            {activity.name}
          </p>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-2 text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo (⌘Z)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-2 text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo (⌘⇧Z)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
            </svg>
          </button>
        </div>

        {/* Separator */}
        <div className="w-px h-5" style={{ background: "rgba(255,255,255,0.08)" }} />

        {/* Preview toggle */}
        <button
          onClick={togglePreview}
          className="px-3 py-1.5 text-sm font-medium transition-all"
          style={{
            background: previewMode ? "#FC4C02" : "transparent",
            color: previewMode ? "#FFFFFF" : "#9B9B9B",
            borderRadius: 4,
          }}
        >
          {previewMode ? "Editing" : "Preview"}
        </button>

        {/* Separator */}
        <div className="w-px h-5" style={{ background: "rgba(255,255,255,0.08)" }} />

        {/* Copy */}
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-all"
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

        {/* Separator */}
        <div className="w-px h-5" style={{ background: "rgba(255,255,255,0.08)" }} />

        {/* More options menu */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-2 text-gray-400 hover:text-white transition-all"
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
                background: "#1A1A1A",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 4,
                minWidth: 180,
                zIndex: 50,
                overflow: "hidden",
              }}
            >
              <button
                onClick={handleClearCanvas}
                className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
              >
                Clear canvas
              </button>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />
              <button
                onClick={handleResetEverything}
                className="w-full text-left px-4 py-3 text-sm transition-all"
                style={{ color: "#FC4C02" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(252,76,2,0.1)"; }}
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
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: "#1A1A1A",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 4,
              padding: 24,
              maxWidth: 360,
              width: "90%",
            }}
          >
            <h3 className="text-white font-bold mb-2" style={{ fontFamily: "var(--font-nunito), sans-serif" }}>
              {confirmModal === "clear" ? "Clear canvas?" : "Reset everything?"}
            </h3>
            <p className="text-sm mb-6" style={{ color: "#9B9B9B" }}>
              {confirmModal === "clear"
                ? "All elements will be removed. Your theme settings will be kept. This action can be undone."
                : "All elements and theme settings will be reset to defaults. This action can be undone."}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-all"
                style={{
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 4,
                  background: "transparent",
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
