import { useEffect } from 'react';
import { adsMap, clientId } from '../../config/ads';

declare global {
  interface Window {
    adsbygoogle: any;
  }
}

interface GoogleAdProps {
  slot?: string;
  className?: string;
}

export const GoogleAd = ({ slot = adsMap.home, className }: GoogleAdProps) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) { }
  }, []);

  return (
    <>
      <ins
        className={`adsbygoogle google_ad_responsive ${className}`}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-adtest="on"
      ></ins>
    </>
  );
};
