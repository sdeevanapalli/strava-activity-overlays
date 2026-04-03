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

const CanvasStage = dynamic(() => import("@/components/canvas/CanvasStage"), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center rounded"
      style={{ width: 380, height: 676, background: "#141414" }}
    >
      <span style={{ color: "#6B6B6B", fontSize: 13 }}>Loading canvas...</span>
    </div>
  ),
});

interface EditorClientProps {
  activity: StravaActivity;
  streams: StravaStreams | null;
}

export default function EditorClient({ activity, streams }: EditorClientProps) {
  const { undo, redo, previewMode, elements, setElements } = useEditorStore();
  const stageRef = useRef<any>(null);
  const activityId = String(activity.id);

  const [showLayoutBanner, setShowLayoutBanner] = useState(false);
  const [pendingPresetElements, setPendingPresetElements] = useState<any[]>([]);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const preset = loadActivityPreset(activityId);
    if (preset && preset.elements.length > 0) {
      setElements(preset.elements);
    } else if (elements.length > 0) {
      setPendingPresetElements(elements);
      setShowLayoutBanner(true);
    }
  }, []);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
        else if ((e.key === "z" && e.shiftKey) || e.key === "y") { e.preventDefault(); redo(); }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "#F5F5F5" }}>
      <Toolbar activity={activity} stageRef={stageRef} />

      {/* Layout reuse banner */}
      {showLayoutBanner && (
        <div
          className="flex items-center justify-between px-4 py-2 text-sm"
          style={{ background: "#FFFBF5", borderBottom: "1px solid #FCE8D5", color: "#6B6B6B" }}
        >
          <span style={{ color: "#111111" }}>You have a saved layout from another activity. Use it here?</span>
          <div className="flex gap-2">
            <button
              onClick={() => { setElements(pendingPresetElements); setShowLayoutBanner(false); }}
              className="px-3 py-1 text-white text-xs"
              style={{ background: "#FC4C02", borderRadius: 3 }}
            >
              Use last layout
            </button>
            <button
              onClick={() => { setElements([]); setShowLayoutBanner(false); }}
              className="px-3 py-1 text-xs"
              style={{ border: "1px solid #E5E5E5", borderRadius: 3, background: "#FFFFFF", color: "#6B6B6B" }}
            >
              Start fresh
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        {!previewMode && (
          <div
            className="w-56 flex-shrink-0 overflow-y-auto"
            style={{ borderRight: "1px solid #E5E5E5", background: "#FAFAFA" }}
          >
            <LeftPanel activity={activity} streams={streams} />
          </div>
        )}

        {/* Canvas area — neutral background that frames the checkerboard canvas */}
        <div
          className="flex-1 overflow-auto flex items-center justify-center p-8"
          style={{ background: "#767676" }}
        >
          <CanvasStage stageRef={stageRef} activity={activity} streams={streams} />
        </div>

        {/* Right panel */}
        {!previewMode && (
          <div
            className="w-56 flex-shrink-0 overflow-y-auto"
            style={{ borderLeft: "1px solid #E5E5E5", background: "#FAFAFA" }}
          >
            <RightPanel />
          </div>
        )}
      </div>
    </div>
  );
}
