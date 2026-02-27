
import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdSlotProps {
  slot?: string;       // data-ad-slot ID from your AdSense dashboard (optional for auto-ads)
  format?: string;     // 'auto', 'rectangle', 'horizontal', 'vertical'
  fullWidth?: boolean;
}

export const AdSlot: React.FC<AdSlotProps> = ({
  slot,
  format = 'auto',
  fullWidth = true,
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Avoid double-initializing on React StrictMode double-invoke
    if (initialized.current) return;
    initialized.current = true;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // AdSense not yet loaded (e.g. ad blocker or dev mode)
    }
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto py-6 flex justify-center">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', minWidth: '300px', minHeight: '100px' }}
        data-ad-client="ca-pub-4726827263657599"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={fullWidth ? 'true' : 'false'}
      />
    </div>
  );
};
