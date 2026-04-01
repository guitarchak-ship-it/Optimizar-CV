import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  dataAdSlot: string;
  dataAdFormat?: string;
  dataFullWidthResponsive?: boolean;
  className?: string;
}

export function AdBanner({
  dataAdSlot,
  dataAdFormat = 'auto',
  dataFullWidthResponsive = true,
  className = ''
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      // Check if the ad is already initialized to prevent the "already have ads in them" error
      if (adRef.current && !adRef.current.getAttribute('data-adsbygoogle-status')) {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err: any) {
      // Suppress the specific error if it still occurs
      if (err.message && err.message.includes('already have ads in them')) {
        return;
      }
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className={`ad-container w-full overflow-hidden flex justify-center items-center bg-zinc-50 border border-zinc-200 rounded-lg min-h-[100px] relative ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-8948780699622073"
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive ? "true" : "false"}
      />
      {/* Placeholder text for development/preview when ads don't load */}
      <div className="absolute text-zinc-400 text-sm pointer-events-none opacity-50">
        Espacio Publicitario
      </div>
    </div>
  );
}
