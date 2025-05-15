
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { saveAs } from 'file-saver';
import { formatInTimeZone } from 'date-fns-tz';
import { generateQRCodeDataUrl } from './qrCodeUtils';
import { Visitor } from '@/hooks/useVisitorStore';

// Initialize pdfmake with fonts
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// A6 dimensions in points (1 mm = 2.83465 points)
const A6_WIDTH = 419.53; // 148 mm
const A6_HEIGHT = 297.64; // 105 mm

// Type for document definition - simplified to avoid needing @types/pdfmake
interface PdfDocDefinition {
  pageSize: {
    width: number;
    height: number;
  };
  pageMargins: number[];
  content: any[];
  styles: Record<string, any>;
}

/**
 * Generates a visitor badge PDF with two identical badges (one rotated 180 degrees)
 */
export async function generateVisitorBadgePdf(
  visitor: Visitor, 
  timestamp: Date = new Date()
): Promise<{ pdfBlob: Blob; pdfUrl: string }> {
  console.log("Generating PDF badge for visitor:", visitor);
  
  // Format date and time
  const formattedDate = formatInTimeZone(timestamp, 'Europe/Berlin', 'dd.MM.yyyy');
  const formattedTime = formatInTimeZone(timestamp, 'Europe/Berlin', 'HH:mm');
  
  // Generate QR code
  const qrCodeUrl = await generateQRCodeDataUrl(
    generateCheckoutEmailUrl(visitor.visitorNumber), 
    140
  );
  
  // Create document definition
  const docDefinition: PdfDocDefinition = {
    pageSize: { width: A6_WIDTH, height: A6_HEIGHT },
    pageMargins: [0, 0, 0, 0],
    content: [
      // First badge (top half)
      {
        stack: [
          // Header
          {
            text: 'VISITOR',
            style: 'header',
            alignment: 'center',
            margin: [0, 10, 0, 0]
          },
          // Main content
          {
            columns: [
              // Left column - Visitor info
              {
                width: '*',
                stack: [
                  {
                    text: visitor.visitorNumber.toString(),
                    style: 'visitorNumber',
                    alignment: 'center'
                  },
                  {
                    text: 'Mr. / Mrs.',
                    style: 'salutation',
                    alignment: 'center'
                  },
                  {
                    text: visitor.name,
                    style: 'visitorName',
                    alignment: 'center'
                  },
                  {
                    text: visitor.company,
                    style: 'companyName',
                    alignment: 'center'
                  }
                ],
                alignment: 'center'
              },
              // Right column - QR code
              {
                width: '40%',
                stack: [
                  {
                    image: qrCodeUrl,
                    width: 120,
                    alignment: 'center'
                  },
                  {
                    text: 'Scan to checkout',
                    style: 'qrLabel',
                    alignment: 'center'
                  }
                ],
                alignment: 'center'
              }
            ],
            margin: [10, 15, 10, 15]
          },
          // Footer
          {
            stack: [
              {
                text: `Contact: ${visitor.contact}`,
                style: 'contact'
              },
              {
                columns: [
                  {
                    width: '50%',
                    text: formattedDate,
                    style: 'datetime'
                  },
                  {
                    width: '50%',
                    text: `${formattedTime} Uhr`,
                    style: 'datetime',
                    alignment: 'right'
                  }
                ]
              }
            ],
            margin: [10, 5, 10, 5]
          }
        ],
        margin: [0, 0, 0, 0]
      },
      // Second badge (bottom half - rotated 180 degrees)
      {
        stack: [
          // Header (rotated)
          {
            text: 'VISITOR',
            style: 'header',
            alignment: 'center',
            margin: [0, 10, 0, 0]
          },
          // Main content (rotated)
          {
            columns: [
              // Left column - Visitor info (rotated)
              {
                width: '*',
                stack: [
                  {
                    text: visitor.visitorNumber.toString(),
                    style: 'visitorNumber',
                    alignment: 'center'
                  },
                  {
                    text: 'Mr. / Mrs.',
                    style: 'salutation',
                    alignment: 'center'
                  },
                  {
                    text: visitor.name,
                    style: 'visitorName',
                    alignment: 'center'
                  },
                  {
                    text: visitor.company,
                    style: 'companyName',
                    alignment: 'center'
                  }
                ],
                alignment: 'center'
              },
              // Right column - QR code (rotated)
              {
                width: '40%',
                stack: [
                  {
                    image: qrCodeUrl,
                    width: 120,
                    alignment: 'center'
                  },
                  {
                    text: 'Scan to checkout',
                    style: 'qrLabel',
                    alignment: 'center'
                  }
                ],
                alignment: 'center'
              }
            ],
            margin: [10, 15, 10, 15]
          },
          // Footer (rotated)
          {
            stack: [
              {
                text: `Contact: ${visitor.contact}`,
                style: 'contact'
              },
              {
                columns: [
                  {
                    width: '50%',
                    text: formattedDate,
                    style: 'datetime'
                  },
                  {
                    width: '50%',
                    text: `${formattedTime} Uhr`,
                    style: 'datetime',
                    alignment: 'right'
                  }
                ]
              }
            ],
            margin: [10, 5, 10, 5]
          }
        ],
        margin: [0, 0, 0, 0],
        pageBreak: 'before',
        pageOrientation: 'landscape',
        // Use canvas to rotate the content
        canvas: [
          { 
            type: 'rect',
            x: 0,
            y: 0,
            w: A6_WIDTH,
            h: A6_HEIGHT,
            color: 'white'
          }
        ]
      }
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 5, 0, 5]
      },
      visitorNumber: {
        fontSize: 32,
        bold: true,
        color: '#0284c7',
        margin: [0, 5, 0, 5]
      },
      salutation: {
        fontSize: 12,
        color: '#64748b',
        margin: [0, 2, 0, 2]
      },
      visitorName: {
        fontSize: 24,
        bold: true,
        margin: [0, 5, 0, 0]
      },
      companyName: {
        fontSize: 16,
        margin: [0, 3, 0, 0]
      },
      qrLabel: {
        fontSize: 12,
        bold: true,
        margin: [0, 5, 0, 0]
      },
      contact: {
        fontSize: 12,
        margin: [0, 5, 0, 3]
      },
      datetime: {
        fontSize: 10,
        color: '#64748b'
      }
    }
  };

  // Create PDF and return as blob and URL
  return new Promise((resolve) => {
    // @ts-ignore - we're using a simplified approach without full types
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    
    pdfDocGenerator.getBlob((blob: Blob) => {
      // Create a blob URL
      const pdfUrl = URL.createObjectURL(blob);
      resolve({ pdfBlob: blob, pdfUrl });
    });
  });
}

/**
 * Helper function to generate checkout email URL
 */
export function generateCheckoutEmailUrl(visitorNumber: number): string {
  const recipient = "besucher@leuka.de";
  const subject = encodeURIComponent("Abmeldung");
  const body = encodeURIComponent(`Guten Tag, der Besucher mit der Nummer ${visitorNumber} verlässt soeben das Haus.`);
  
  return `mailto:${recipient}?subject=${subject}&body=${body}`;
}

/**
 * Helper function to print a PDF directly
 */
export function printPdf(pdfUrl: string): void {
  console.log("Printing PDF from URL:", pdfUrl);
  
  // Create a hidden iframe for printing
  const printIframe = document.createElement('iframe');
  printIframe.style.position = 'absolute';
  printIframe.style.left = '-9999px';
  printIframe.style.height = '0';
  printIframe.style.width = '0';
  printIframe.onload = () => {
    try {
      // Start printing after iframe is loaded
      setTimeout(() => {
        printIframe.contentWindow?.print();
        // Remove iframe after print dialog closes (or after a timeout)
        setTimeout(() => {
          document.body.removeChild(printIframe);
        }, 2000);
      }, 500);
    } catch (error) {
      console.error("Error printing PDF:", error);
      document.body.removeChild(printIframe);
    }
  };
  
  // Load PDF into iframe and append to document
  printIframe.src = pdfUrl;
  document.body.appendChild(printIframe);
}

/**
 * Save the badge PDF with the visitor ID as filename
 */
export function saveBadgePdf(blob: Blob, visitor: Visitor): void {
  const filename = `visitor_badge_${visitor.visitorNumber}.pdf`;
  saveAs(blob, filename);
}

/**
 * Open PDF in a new browser tab
 */
export function openPdfInNewTab(pdfUrl: string): void {
  window.open(pdfUrl, '_blank');
}
