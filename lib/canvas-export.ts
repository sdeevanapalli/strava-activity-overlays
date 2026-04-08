import type Konva from "konva";

function getExportDataURL(stage: Konva.Stage): string {
  const pixelRatio = 1 / stage.scaleX();

  // Force-clear any CSS background that may have been set on the stage container
  // or its child canvas elements — these get baked in via drawImage during export
  const container = stage.container();
  const prevContainerBg = container.style.background;
  container.style.background = "";

  // Also clear background on every canvas element inside the container
  // (Konva creates one <canvas> per layer inside the container div)
  const canvasEls = container.querySelectorAll("canvas");
  const prevCanvasBgs: string[] = [];
  canvasEls.forEach((c, i) => {
    prevCanvasBgs[i] = c.style.background;
    c.style.background = "";
  });

  // Render to a fresh output canvas with an explicit clearRect
  const konvaCanvas = stage.toCanvas({ pixelRatio }) as HTMLCanvasElement;

  // Restore
  container.style.background = prevContainerBg;
  canvasEls.forEach((c, i) => { c.style.background = prevCanvasBgs[i]; });

  // Composite onto a second fresh canvas — guarantees no implicit white fill
  const out = document.createElement("canvas");
  out.width = konvaCanvas.width;
  out.height = konvaCanvas.height;
  const ctx = out.getContext("2d")!;
  ctx.clearRect(0, 0, out.width, out.height);
  ctx.drawImage(konvaCanvas, 0, 0);

  return out.toDataURL("image/png");
}

export async function exportCanvas(
  stage: Konva.Stage,
  activityName: string,
  date: string
): Promise<void> {
  const dataURL = getExportDataURL(stage);

  const sanitizedName = activityName.replace(/[^a-z0-9]/gi, "-").toLowerCase();
  const sanitizedDate = date.split("T")[0];
  const filename = `ActivityOverlays-${sanitizedName}-${sanitizedDate}.png`;

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function copyCanvasToClipboard(
  stage: Konva.Stage
): Promise<void> {
  const dataURL = getExportDataURL(stage);
  const res = await fetch(dataURL);
  const blob = await res.blob();
  await navigator.clipboard.write([
    new ClipboardItem({ "image/png": blob }),
  ]);
}
