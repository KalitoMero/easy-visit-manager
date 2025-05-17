import { Visitor } from '@/hooks/useVisitorStore';
import { generateQRCodeDataUrl } from './qrCodeUtils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { logDebug, testBlobFunctionality, isPdfMakeInitialized } from './debugUtils';
import pdfMake from 'pdfmake/build/pdfmake';

// Import fonts without assignment - this will execute the script
// which sets up pdfMake.vfs globally
import 'pdfmake/build/vfs_fonts';

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
 * Verifies that pdfMake is properly initialized
 * @throws Error if pdfMake is not initialized
 */
function verifyPdfMakeAvailable() {
  // Only check if we're in a browser environment
  if (typeof window === 'undefined') return;
  
  const hasPdfMake = typeof window.pdfMake !== 'undefined';
  const hasVfs = hasPdfMake && typeof window.pdfMake.vfs !== 'undefined';
  
  logDebug('PDF', `PDF library check - pdfMake: ${hasPdfMake ? 'Available' : 'Not available'}`);
  logDebug('PDF', `PDF library check - VFS fonts: ${hasVfs ? 'Available' : 'Not available'}`);
  
  // Don't throw here, just log the issue
  if (!hasPdfMake || !hasVfs) {
    logDebug('PDF', 'PDF library not properly initialized');
  }
}

// Try to initialize on load, but don't block rendering if it fails
try {
  if (typeof window !== 'undefined') {
    logDebug('PDF', 'Checking pdfMake initialization status');
    verifyPdfMakeAvailable();
  }
} catch (e) {
  logDebug('PDF', 'Error during pdfMake initialization check:', e);
}

/**
 * Generates a visitor badge PDF with two identical badges
 * @param visitor Visitor data to include in the badge
 * @returns Promise with the generated PDF blob and URL
 */
export const generateVisitorBadgePdf = async (visitor: Visitor) => {
  logDebug('PDF', "Starting PDF generation for visitor:", visitor.visitorNumber);
  
  try {
    // Verify pdfMake is available before proceeding
    verifyPdfMakeAvailable();
    
    // Test browser Blob functionality
    const blobFunctional = await testBlobFunctionality();
    if (!blobFunctional) {
      throw new Error('Browser Blob functionality test failed');
    }
    
    logDebug('PDF', "Generating QR code for badge");
    
    // Generate QR code for checkout - with more detailed error handling
    let qrCodeUrl;
    try {
      qrCodeUrl = await generateQRCodeDataUrl(
        `${window.location.origin}/checkout/${visitor.visitorNumber}`,
        450 // Generate a high-resolution QR code
      );
      logDebug('PDF', "QR code generated successfully", { length: qrCodeUrl.length });
    } catch (qrError) {
      logDebug('PDF', "QR code generation failed", qrError);
      throw new Error(`QR code generation failed: ${qrError instanceof Error ? qrError.message : String(qrError)}`);
    }
    
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
    
    logDebug('PDF', "Building PDF document definition");
    
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
    
    logDebug('PDF', "Creating PDF from definition");
    
    // Generate PDF with proper error handling
    return new Promise<{pdfBlob: Blob, pdfUrl: string}>((resolve, reject) => {
      try {
        if (!window.pdfMake) {
          reject(new Error("pdfMake not available in window object"));
          return;
        }
        
        const pdfDocGenerator = window.pdfMake.createPdf(docDefinition);
        logDebug('PDF', "PDF document created, getting blob");
        
        pdfDocGenerator.getBlob(
          // Success callback
          (blob: Blob) => {
            try {
              logDebug('PDF', "PDF blob generated", { size: blob.size, type: blob.type });
              
              if (!blob || blob.size === 0) {
                reject(new Error("PDF generation resulted in empty blob"));
                return;
              }
              
              // Create URL for the blob
              const pdfUrl = URL.createObjectURL(blob);
              logDebug('PDF', "PDF URL created successfully", pdfUrl);
              resolve({pdfBlob: blob, pdfUrl});
            } catch (error) {
              logDebug('PDF', 'Error creating PDF URL', error);
              reject(error);
            }
          },
          // Error callback
          (error: any) => {
            logDebug('PDF', "Error in PDF blob generation", error);
            reject(error);
          }
        );
      } catch (error) {
        logDebug('PDF', "Error creating PDF document", error);
        reject(error);
      }
    });
  } catch (error) {
    logDebug('PDF', 'Fatal error generating PDF', error);
    throw error;
  }
};

/**
 * Opens a PDF in a new browser tab
 */
export function openPdfInNewTab(pdfUrl: string) {
  try {
    logDebug('PDF', "Opening PDF in new tab", pdfUrl);
    window.open(pdfUrl, '_blank');
  } catch (error) {
    logDebug('PDF', "Error opening PDF in new tab", error);
    throw error;
  }
}

/**
 * Triggers printing of a PDF
 */
export function printPdf(pdfUrl: string) {
  try {
    logDebug('PDF', "Starting print process", pdfUrl);
    
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    
    // Add load/error handlers before setting src
    iframe.onload = () => {
      try {
        logDebug('PDF', "PDF loaded in iframe, printing");
        if (iframe.contentWindow) {
          iframe.contentWindow.print();
          
          // Remove iframe after print dialog is closed (with delay)
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
              logDebug('PDF', "Print iframe removed");
            }
          }, 2000);
        } else {
          logDebug('PDF', "Error: iframe contentWindow not available");
          throw new Error("Print frame contentWindow not available");
        }
      } catch (error) {
        logDebug('PDF', "Error during print process", error);
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }
    };
    
    iframe.onerror = (error) => {
      logDebug('PDF', "Error loading PDF in iframe", error);
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    };
    
    // Add to document and set src to trigger load
    document.body.appendChild(iframe);
    logDebug('PDF', "Print iframe added to document");
    
    // Set src after adding to document
    iframe.src = pdfUrl;
    logDebug('PDF', "Print iframe src set");
    
  } catch (error) {
    logDebug('PDF', "Error in printPdf function", error);
    throw error;
  }
}

/**
 * Saves the badge PDF to the user's device
 */
export function saveBadgePdf(blob: Blob, visitor: Visitor) {
  try {
    logDebug('PDF', "Starting download process");
    
    // Create a download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `visitor_badge_${visitor.visitorNumber}.pdf`;
    
    logDebug('PDF', "Download link created", link.href);
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(link.href); // Free memory
      logDebug('PDF', "Download cleanup completed");
    }, 100);
  } catch (error) {
    logDebug('PDF', "Error in saveBadgePdf function", error);
    throw error;
  }
}

// Add TypeScript declaration for pdfMake in window
declare global {
  interface Window {
    pdfMake: any;
  }
}
