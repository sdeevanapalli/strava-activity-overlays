"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { StravaActivity, StravaStreams } from "@/types/strava";
import { useEditorStore } from "@/store/editorStore";
import Toolbar from "@/components/editor/Toolbar";
import LeftPanel from "@/components/editor/LeftPanel";
import RightPanel from "@/components/editor/RightPanel";
import { loadActivityPreset, saveActivityPreset } from "@/lib/themes";

// Dynamically import canvas (no SSR)
const CanvasStage = dynamic(() => import("@/components/canvas/CanvasStage"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full rounded-lg" style={{ background: "#111111" }}>
      <div style={{ color: "#6B6B6B" }}>Loading canvas...</div>
    </div>
  ),
});

interface EditorClientProps {
  activity: StravaActivity;
  streams: StravaStreams | null;
}

export default function EditorClient({ activity, streams }: EditorClientProps) {
  const router = useRouter();
  const { undo, redo, previewMode, elements, setElements, theme, fontStyle, globalOpacity, unitSystem } = useEditorStore();
  const stageRef = useRef<any>(null);
  const activityId = String(activity.id);

  // Banner: offer to reuse last layout if different activity's preset is in store
  const [showLayoutBanner, setShowLayoutBanner] = useState(false);
  const [pendingPresetElements, setPendingPresetElements] = useState<any[]>([]);
  const mountedRef = useRef(false);

  // On mount: check for saved preset
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const preset = loadActivityPreset(activityId);
    if (preset && preset.elements.length > 0) {
      // Restore silently for this activity
      setElements(preset.elements);
    } else {
      // Check if current elements belong to a different activity (elements already in store from previous session)
      // We detect this by checking if there are elements but no preset for this activity
      if (elements.length > 0) {
        setPendingPresetElements(elements);
        setShowLayoutBanner(true);
      }
    }
  }, []);

  // On unmount: save current elements as ActivityPreset
  useEffect(() => {
    return () => {
      const currentElements = useEditorStore.getState().elements;
      if (currentElements.length > 0) {
        saveActivityPreset({
          activityId,
          themeId: "custom",
          elements: currentElements,
          savedAt: Date.now(),
        });
      }
    };
  }, [activityId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "z" && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if ((e.key === "z" && e.shiftKey) || e.key === "y") {
          e.preventDefault();
          redo();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const handleUsePreviousLayout = () => {
    setElements(pendingPresetElements);
    setShowLayoutBanner(false);
  };

  const handleStartFresh = () => {
    setElements([]);
    setShowLayoutBanner(false);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "#0F0F0F" }}>
      {/* Toolbar */}
      <Toolbar activity={activity} stageRef={stageRef} />

      {/* Layout banner */}
      {showLayoutBanner && (
        <div
          className="flex items-center justify-between px-4 py-2 text-sm"
          style={{
            background: "#1A1A1A",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            color: "#9B9B9B",
          }}
        >
          <span>You have a saved layout from another activity. Use it here?</span>
          <div className="flex gap-2">
            <button
              onClick={handleUsePreviousLayout}
              className="px-3 py-1 text-white text-xs transition-all"
              style={{ background: "#FC4C02", borderRadius: 2 }}
            >
              Use last layout
            </button>
            <button
              onClick={handleStartFresh}
              className="px-3 py-1 text-xs transition-all"
              style={{
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 2,
                background: "transparent",
                color: "#9B9B9B",
              }}
            >
              Start fresh
            </button>
          </div>
        </div>
      )}

      {/* Editor Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        {!previewMode && (
          <div
            className="w-64 flex-shrink-0 overflow-y-auto"
            style={{
              borderRight: "1px solid rgba(255,255,255,0.08)",
              background: "#111111",
            }}
          >
            <LeftPanel activity={activity} streams={streams} />
          </div>
        )}

        {/* Canvas Area */}
        <div
          className="flex-1 overflow-auto flex items-center justify-center p-8"
          style={{ background: "#0F0F0F" }}
        >
          <CanvasStage
            stageRef={stageRef}
            activity={activity}
            streams={streams}
          />
        </div>

        {/* Right Panel */}
        {!previewMode && (
          <div
            className="w-64 flex-shrink-0 overflow-y-auto"
            style={{
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              background: "#111111",
            }}
          >
            <RightPanel />
          </div>
        )}
      </div>
    </div>
  );
}
