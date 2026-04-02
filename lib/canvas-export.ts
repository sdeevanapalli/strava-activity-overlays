import type Konva from "konva";

export async function exportCanvas(
  stage: Konva.Stage,
  displayWidth: number,
  activityName: string,
  date: string
): Promise<void> {
  const pixelRatio = 1080 / displayWidth;

  const dataURL = stage.toDataURL({
    mimeType: "image/png",
    pixelRatio,
  });

  const sanitizedName = activityName.replace(/[^a-z0-9]/gi, "-").toLowerCase();
  const sanitizedDate = date.split("T")[0];
  const filename = `stravacanvas-${sanitizedName}-${sanitizedDate}.png`;

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function copyCanvasToClipboard(
  stage: Konva.Stage,
  displayWidth: number
): Promise<void> {
  const pixelRatio = 1080 / displayWidth;

  const dataURL = stage.toDataURL({
    mimeType: "image/png",
    pixelRatio,
  });

  const res = await fetch(dataURL);
  const blob = await res.blob();
  await navigator.clipboard.write([
    new ClipboardItem({ "image/png": blob }),
  ]);
}
