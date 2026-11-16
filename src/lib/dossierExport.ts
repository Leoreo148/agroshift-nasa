import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";
import type { DossierData } from "@/lib/pdfGenerator";
import { buildDossierPage1Html, buildDossierPage2Html } from "@/lib/dossierHtml";

const PAGE_WIDTH_MM = 210;

// Renders real HTML/CSS off-screen (so it inherits the app's actual fonts
// and colors, unlike jsPDF's coordinate-drawn version) and rasterizes it.
// Height is measured from the rendered content, not hardcoded, so an AI
// plan of any length never gets clipped or overlaps.
async function captureToDataUrl(html: string): Promise<{ dataUrl: string; heightMM: number }> {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "0";
  container.style.left = "-9999px";
  container.style.width = `${PAGE_WIDTH_MM}mm`;
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    // Let fonts finish applying before the DOM is rasterized.
    if (document.fonts?.ready) await document.fonts.ready;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    const canvas = await html2canvas(container, { scale: 2, backgroundColor: "#ffffff" });
    const heightMM = (canvas.height / canvas.width) * PAGE_WIDTH_MM;
    return { dataUrl: canvas.toDataURL("image/png"), heightMM };
  } finally {
    document.body.removeChild(container);
  }
}

export async function exportDossierPdf(data: DossierData): Promise<jsPDF> {
  const page1 = await captureToDataUrl(buildDossierPage1Html(data));
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [PAGE_WIDTH_MM, page1.heightMM] });
  doc.addImage(page1.dataUrl, "PNG", 0, 0, PAGE_WIDTH_MM, page1.heightMM);

  if (data.aiPlan) {
    const page2 = await captureToDataUrl(buildDossierPage2Html(data));
    doc.addPage([PAGE_WIDTH_MM, page2.heightMM], "portrait");
    doc.addImage(page2.dataUrl, "PNG", 0, 0, PAGE_WIDTH_MM, page2.heightMM);
  }

  return doc;
}
