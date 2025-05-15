
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Visitor } from '@/hooks/useVisitorStore';
import { generateQRCodeDataUrl } from './qrCodeUtils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

// Initialize pdfMake
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// Configure page size for A6 in portrait (105mm x 148mm)
const PAGE_WIDTH = 105; // mm
const PAGE_HEIGHT = 148; // mm

// Badge dimensions (60mm x 90mm)
const BADGE_WIDTH = 60; // mm
const BADGE_HEIGHT = 90; // mm

// Convert mm to points (pdfMake uses points)
const MM_TO_PT = 2.83465;
const mmToPt = (mm: number) => mm * MM_TO_PT;

/**
 * Generates a visitor badge PDF with two identical badges
 * @param visitor Visitor data to include in the badge
 * @returns Promise with the generated PDF blob and URL
 */
export const generateVisitorBadgePdf = async (visitor: Visitor) => {
  try {
    // Generate QR code for checkout
    const qrCodeUrl = await generateQRCodeDataUrl(
      `${window.location.origin}/checkout/${visitor.visitorNumber}`,
      450 // Generate a high-resolution QR code
    );
    
    // Format date and time
    const dateTimeStr = format(
      new Date(visitor.checkInTime),
      'dd.MM.yyyy HH:mm',
      { locale: de }
    );
    
    // Create badge content (for reuse in both badges)
    const createBadgeContent = (rotate = false) => {
      // Base content with absolute positioning
      return [
        // "VISITOR" title at top center
        {
          text: 'VISITOR',
          absolutePosition: { 
            x: mmToPt(rotate ? BADGE_WIDTH / 2 : (PAGE_WIDTH - BADGE_WIDTH) / 2 + BADGE_WIDTH / 2), 
            y: mmToPt(rotate ? PAGE_HEIGHT - (PAGE_HEIGHT - BADGE_HEIGHT) / 2 - 10 : (PAGE_HEIGHT - BADGE_HEIGHT) / 2 + 10)
          },
          fontSize: 14,
          bold: true,
          alignment: 'center',
          width: mmToPt(BADGE_WIDTH),
          characterSpacing: 1,
          color: '#000033',
        },
        
        // Visitor Number
        {
          text: visitor.visitorNumber.toString(),
          absolutePosition: { 
            x: mmToPt(rotate ? BADGE_WIDTH / 2 : (PAGE_WIDTH - BADGE_WIDTH) / 2 + BADGE_WIDTH / 2), 
            y: mmToPt(rotate ? PAGE_HEIGHT - (PAGE_HEIGHT - BADGE_HEIGHT) / 2 - 23 : (PAGE_HEIGHT - BADGE_HEIGHT) / 2 + 23)
          },
          fontSize: 28,
          bold: true,
          alignment: 'center',
          width: mmToPt(BADGE_WIDTH),
        },
        
        // Visitor name (bold) and company
        {
          text: [
            { text: `${visitor.name}`, bold: true },
            { text: '\n' },
            { text: `${visitor.company}` }
          ],
          absolutePosition: { 
            x: mmToPt(rotate ? 25 : (PAGE_WIDTH - BADGE_WIDTH) / 2 + 5), 
            y: mmToPt(rotate ? PAGE_HEIGHT - (PAGE_HEIGHT - BADGE_HEIGHT) / 2 - 35 : (PAGE_HEIGHT - BADGE_HEIGHT) / 2 + 35)
          },
          fontSize: 12,
          width: mmToPt(30), // 30mm width for text
        },
        
        // QR Code (right side)
        {
          image: qrCodeUrl,
          absolutePosition: { 
            x: mmToPt(rotate ? 55 : (PAGE_WIDTH - BADGE_WIDTH) / 2 + 35),
            y: mmToPt(rotate ? PAGE_HEIGHT - (PAGE_HEIGHT - BADGE_HEIGHT) / 2 - 65 : (PAGE_HEIGHT - BADGE_HEIGHT) / 2 + 35)
          },
          width: mmToPt(20), // 20mm wide QR code
          height: mmToPt(20),
        },
        
        // Contact name (bottom left)
        {
          text: `Contact: ${visitor.contact}`,
          absolutePosition: { 
            x: mmToPt(rotate ? 25 : (PAGE_WIDTH - BADGE_WIDTH) / 2 + 5), 
            y: mmToPt(rotate ? PAGE_HEIGHT - (PAGE_HEIGHT - BADGE_HEIGHT) / 2 - 85 : (PAGE_HEIGHT - BADGE_HEIGHT) / 2 + 85)
          },
          fontSize: 8,
          width: mmToPt(30),
        },
        
        // Date and time (bottom right)
        {
          text: dateTimeStr,
          absolutePosition: { 
            x: mmToPt(rotate ? 55 : (PAGE_WIDTH - BADGE_WIDTH) / 2 + 35), 
            y: mmToPt(rotate ? PAGE_HEIGHT - (PAGE_HEIGHT - BADGE_HEIGHT) / 2 - 85 : (PAGE_HEIGHT - BADGE_HEIGHT) / 2 + 85)
          },
          fontSize: 8,
          alignment: 'right',
          width: mmToPt(20),
        },
        
        // Optional: Badge border for visualization (can be removed for final version)
        {
          canvas: [
            {
              type: 'rect',
              x: mmToPt(rotate ? 22 : (PAGE_WIDTH - BADGE_WIDTH) / 2 + 2),
              y: mmToPt(rotate ? PAGE_HEIGHT - (PAGE_HEIGHT - BADGE_HEIGHT) / 2 - 88 : (PAGE_HEIGHT - BADGE_HEIGHT) / 2 + 2),
              w: mmToPt(BADGE_WIDTH - 4),
              h: mmToPt(BADGE_HEIGHT - 4),
              lineWidth: 0.5,
              lineColor: '#CCCCCC'
            }
          ]
        }
      ];
    };
    
    // PDF document definition
    const docDefinition = {
      pageSize: { width: mmToPt(PAGE_WIDTH), height: mmToPt(PAGE_HEIGHT) },
      pageMargins: [0, 0, 0, 0], // No margins
      background: function() {
        return { 
          canvas: [{ 
            type: 'rect', 
            x: 0, y: 0, 
            w: mmToPt(PAGE_WIDTH), 
            h: mmToPt(PAGE_HEIGHT), 
            color: '#FFFFFF' 
          }] 
        };
      },
      content: [
        // Add the two badges - one normal, one rotated 180°
        ...createBadgeContent(false), // Top badge (normal orientation)
        ...createBadgeContent(true),  // Bottom badge (rotated 180°)
      ]
    };
    
    // Generate PDF
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    
    // Get PDF as blob
    return new Promise<{pdfBlob: Blob, pdfUrl: string}>((resolve, reject) => {
      pdfDocGenerator.getBlob((blob) => {
        try {
          // Create URL for the blob
          const pdfUrl = URL.createObjectURL(blob);
          resolve({pdfBlob: blob, pdfUrl});
        } catch (error) {
          console.error('Error creating PDF URL', error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error generating PDF', error);
    throw error;
  }
};

/**
 * Opens a PDF in a new browser tab
 */
export function openPdfInNewTab(pdfUrl: string) {
  window.open(pdfUrl, '_blank');
}

/**
 * Triggers printing of a PDF
 */
export function printPdf(pdfUrl: string) {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = pdfUrl;
  
  iframe.onload = () => {
    if (iframe.contentWindow) {
      iframe.contentWindow.print();
      
      // Remove iframe after print dialog is closed (with delay)
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 2000);
    }
  };
  
  document.body.appendChild(iframe);
}

/**
 * Saves the badge PDF to the user's device
 */
export function saveBadgePdf(blob: Blob, visitor: Visitor) {
  // Create a download link
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `visitor_badge_${visitor.visitorNumber}.pdf`;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
}
