/**
 * Utility functions for handling Base64 PDF data in the browser (Next.js frontend)
 */

/**
 * Converts a Base64 encoded string into a PDF Blob
 * @param base64Data Raw base64 string or data URI (data:application/pdf;base64,...)
 * @returns Blob of type application/pdf
 */
export function base64ToPdfBlob(base64Data: string): Blob {
  // Strip data URI prefix if present (e.g. data:application/pdf;base64,)
  const cleanBase64 = base64Data.replace(/^data:application\/pdf;base64,/, "");

  const byteCharacters = atob(cleanBase64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  return new Blob([byteArray], { type: "application/pdf" });
}

/**
 * Downloads a Base64-encoded PDF as a physical .pdf file in the browser
 * @param base64Data Base64 PDF string
 * @param fileName Name of the downloaded file (e.g. "my_optimized_resume.pdf")
 */
export function downloadBase64Pdf(base64Data: string, fileName: string = "document.pdf"): void {
  if (!base64Data) {
    console.error("downloadBase64Pdf: No base64 data provided");
    return;
  }

  try {
    const blob = base64ToPdfBlob(base64Data);
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up memory
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch (error) {
    console.error("Failed to convert and download base64 PDF:", error);
    throw error;
  }
}

/**
 * Opens a Base64-encoded PDF in a new browser tab for preview/printing
 * @param base64Data Base64 PDF string
 */
export function openBase64PdfInNewTab(base64Data: string): void {
  if (!base64Data) {
    console.error("openBase64PdfInNewTab: No base64 data provided");
    return;
  }

  try {
    const blob = base64ToPdfBlob(base64Data);
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");
  } catch (error) {
    console.error("Failed to open base64 PDF in new tab:", error);
    throw error;
  }
}
