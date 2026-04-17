"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type Konva from "konva";
import type { StravaActivity } from "@/types/strava";
import { useEditorStore } from "@/store/editorStore";
import Toolbar from "@/components/editor/Toolbar";
import LeftPanel from "@/components/editor/LeftPanel";
import RightPanel from "@/components/editor/RightPanel";
import ToastHost from "@/components/ui/ToastHost";
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
}

export default function EditorClient({ activity }: EditorClientProps) {
  const { undo, redo, previewMode, elements, setElements } = useEditorStore();
  const stageRef = useRef<Konva.Stage | null>(null);
  const activityId = String(activity.id);

  const [layoutDecision, setLayoutDecision] = useState<"undecided" | "accepted" | "rejected">("undecided");
  const [mobilePanel, setMobilePanel] = useState<"left" | "right" | null>(null);
  const [hasPreset] = useState(() => !!loadActivityPreset(activityId));
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const preset = loadActivityPreset(activityId);
    if (preset && preset.elements.length > 0) {
      setElements(preset.elements);
    }
  }, [activityId, setElements]);

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

  const showLayoutBanner =
    layoutDecision === "undecided" && !hasPreset && elements.length > 0;
  const activeMobilePanel = previewMode ? null : mobilePanel;

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden" style={{ background: "#F5F5F5" }}>
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
              onClick={() => setLayoutDecision("accepted")}
              className="px-3 py-1 text-white text-xs"
              style={{ background: "#FC4C02", borderRadius: 3 }}
            >
              Use last layout
            </button>
            <button
              onClick={() => {
                setElements([]);
                setLayoutDecision("rejected");
              }}
              className="px-3 py-1 text-xs"
              style={{ border: "1px solid #E5E5E5", borderRadius: 3, background: "#FFFFFF", color: "#6B6B6B" }}
            >
              Start fresh
            </button>
          </div>
        </div>
      )}

      {!previewMode && (
        <div
          className="md:hidden flex items-center gap-2 px-3 py-2"
          style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E5E5" }}
        >
          <button
            onClick={() => setMobilePanel((prev) => (prev === "left" ? null : "left"))}
            className="flex-1 px-3 py-2 text-sm font-semibold"
            style={{
              background: activeMobilePanel === "left" ? "#FC4C02" : "#F5F5F5",
              color: activeMobilePanel === "left" ? "#FFFFFF" : "#111111",
              border: activeMobilePanel === "left" ? "1px solid #FC4C02" : "1px solid #E5E5E5",
              borderRadius: 4,
            }}
          >
            Add Elements
          </button>
          <button
            onClick={() => setMobilePanel((prev) => (prev === "right" ? null : "right"))}
            className="flex-1 px-3 py-2 text-sm font-semibold"
            style={{
              background: activeMobilePanel === "right" ? "#FC4C02" : "#F5F5F5",
              color: activeMobilePanel === "right" ? "#FFFFFF" : "#111111",
              border: activeMobilePanel === "right" ? "1px solid #FC4C02" : "1px solid #E5E5E5",
              borderRadius: 4,
            }}
          >
            Style & Theme
          </button>
        </div>
      )}

      <div className="relative flex flex-1 overflow-hidden">
        {/* Left panel */}
        {!previewMode && (
          <div
            className="hidden md:block w-56 flex-shrink-0 overflow-y-auto"
            style={{ borderRight: "1px solid #E5E5E5", background: "#FAFAFA" }}
          >
            <LeftPanel activity={activity} />
          </div>
        )}

        {/* Canvas area — neutral background that frames the checkerboard canvas */}
        <div
          className="flex-1 overflow-auto flex items-center justify-center p-8"
          style={{ background: "#767676" }}
        >
          <CanvasStage stageRef={stageRef} activity={activity} />
        </div>

        {/* Right panel */}
        {!previewMode && (
          <div
            className="hidden md:block w-56 flex-shrink-0 overflow-y-auto"
            style={{ borderLeft: "1px solid #E5E5E5", background: "#FAFAFA" }}
          >
            <RightPanel />
          </div>
        )}

        {!previewMode && activeMobilePanel && (
          <>
            <button
              onClick={() => setMobilePanel(null)}
              aria-label="Close panel"
              className="md:hidden absolute inset-0 z-30"
              style={{ background: "rgba(0,0,0,0.35)" }}
            />
            {activeMobilePanel === "left" && (
              <div
                className="md:hidden absolute inset-y-0 left-0 z-40 w-[min(85vw,320px)] overflow-y-auto"
                style={{ background: "#FAFAFA", borderRight: "1px solid #E5E5E5" }}
              >
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #E5E5E5" }}>
                  <p className="text-sm font-semibold" style={{ color: "#111111" }}>Add Elements</p>
                  <button onClick={() => setMobilePanel(null)} className="text-xs" style={{ color: "#6B6B6B" }}>Close</button>
                </div>
                <LeftPanel activity={activity} />
              </div>
            )}
            {activeMobilePanel === "right" && (
              <div
                className="md:hidden absolute inset-y-0 right-0 z-40 w-[min(85vw,320px)] overflow-y-auto"
                style={{ background: "#FAFAFA", borderLeft: "1px solid #E5E5E5" }}
              >
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #E5E5E5" }}>
                  <p className="text-sm font-semibold" style={{ color: "#111111" }}>Style & Theme</p>
                  <button onClick={() => setMobilePanel(null)} className="text-xs" style={{ color: "#6B6B6B" }}>Close</button>
                </div>
                <RightPanel />
              </div>
            )}
          </>
        )}
      </div>

      <ToastHost />
    </div>
  );
}
