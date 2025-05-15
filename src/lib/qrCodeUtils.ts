
/**
 * Generates a mailto: URL with pre-populated fields for visitor checkout
 */
export function generateCheckoutEmailUrl(visitorNumber: number): string {
  const recipient = "besucher@leuka.de";
  const subject = encodeURIComponent("Abmeldung");
  const body = encodeURIComponent(`Guten Tag, der Besucher mit der Nummer ${visitorNumber} verlässt soeben das Haus.`);
  
  return `mailto:${recipient}?subject=${subject}&body=${body}`;
}

/**
 * Generates a QR code as a data URL using the qrcode library
 */
export async function generateQRCodeDataUrl(data: string, size: number = 140): Promise<string> {
  // We're using dynamic import to avoid SSR issues
  const QRCode = await import('qrcode');
  
  try {
    // Generate QR code as data URL with adjusted default size
    const dataUrl = await QRCode.toDataURL(data, {
      width: size,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H' // Higher error correction for better scanning
    });
    
    console.log("QR code generated successfully");
    return dataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    return '';
  }
}

/**
 * Ensures QR codes are fully loaded before printing
 * @param callback Function to call when all QR codes are loaded
 * @param maxWaitTime Maximum time to wait in ms before timing out
 * @returns Promise that resolves when QR codes are loaded or timeout
 */
export function ensureQRCodesLoaded(callback: () => void, maxWaitTime: number = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    // Track if QR codes are loaded
    const qrStatus = {
      loaded: false,
      timeout: false
    };

    // Check if QR codes are already in the DOM
    const checkExistingQRCodes = () => {
      const qrImages = document.querySelectorAll('img[src^="data:image/png;base64"]');
      console.log(`Found ${qrImages.length} QR code images in DOM`);
      return qrImages.length > 0;
    };

    // If already loaded, resolve immediately
    if (checkExistingQRCodes()) {
      console.log("QR codes already loaded");
      qrStatus.loaded = true;
      callback();
      resolve(true);
      return;
    }

    // Set timeout for QR code loading
    const timeoutId = setTimeout(() => {
      console.log("QR code loading timed out");
      qrStatus.timeout = true;
      // Call callback even if timed out, to avoid blocking the user
      callback();
      resolve(false);
    }, maxWaitTime);

    // Observer to detect QR code images being added to the DOM
    const observer = new MutationObserver((mutations) => {
      if (checkExistingQRCodes() && !qrStatus.timeout) {
        console.log("QR codes detected in DOM");
        clearTimeout(timeoutId);
        observer.disconnect();
        
        // Add a small delay to ensure the QR code is fully rendered
        setTimeout(() => {
          console.log("QR codes fully loaded");
          qrStatus.loaded = true;
          callback();
          resolve(true);
        }, 800); // Increased delay to ensure full rendering
      }
    });

    // Start observing the document with expanded options
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src'],
      characterData: true
    });
  });
}
