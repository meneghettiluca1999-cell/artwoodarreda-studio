export interface PDFExportOptions {
  filename?: string;
  margin?: number | [number, number, number, number];
}

/**
 * Servizio per l'esportazione PDF.
 * Progettato per essere facilmente sostituibile in futuro con una soluzione server-side.
 */
export async function exportToPDF(element: HTMLElement, options: PDFExportOptions = {}): Promise<void> {
  const { 
    filename = 'report-strategico.pdf',
  } = options;

  try {
    // Importiamo dinamicamente html-to-image e jsPDF per evitare errori di SSR in Next.js
    const htmlToImage = await import('html-to-image');
    
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.jsPDF;

    // Assicuriamoci che l'elemento sia temporaneamente visibile e con opacità 1 per il rendering
    // Salviamo gli stili originali per ripristinarli
    const originalOpacity = element.style.opacity;
    const originalPosition = element.style.position;
    const originalLeft = element.style.left;
    const originalTop = element.style.top;
    
    // Per html2canvas, l'elemento deve essere nel documento ma può essere fuori schermo.
    // L'opacità deve essere > 0.
    element.style.opacity = '1';
    element.style.position = 'absolute';
    element.style.left = '0px';
    element.style.top = '0px';
    element.style.zIndex = '-9999';

    // Cerchiamo le pagine individuali all'interno dell'elemento
    const pages = element.querySelectorAll('.pdf-page');
    const elementsToRender = pages.length > 0 ? Array.from(pages) : [element];

    // Creiamo il PDF (A4)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < elementsToRender.length; i++) {
      const pageEl = elementsToRender[i] as HTMLElement;
      
      // Generiamo l'immagine per la singola pagina
      const imgData = await htmlToImage.toJpeg(pageEl, {
        quality: 0.98,
        pixelRatio: 2, // Alta qualità (retina)
        backgroundColor: '#ffffff'
      });

      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      if (i > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight);
    }

    // Ripristiniamo gli stili originali
    element.style.opacity = originalOpacity;
    element.style.position = originalPosition;
    element.style.left = originalLeft;
    element.style.top = originalTop;
    element.style.zIndex = '';

    // Salviamo il PDF
    pdf.save(filename);
    
  } catch (error: any) {
    console.error("Errore durante la generazione del PDF:", error);
    throw new Error(`Errore interno PDF: ${error?.message || error}`);
  }
}
