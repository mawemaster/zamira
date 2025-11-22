import { useEffect } from 'react';

export default function PWAHeadTags() {
  useEffect(() => {
    // Meta tags básicas
    const setMetaTag = (name, content, attribute = 'name') => {
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Meta tags essenciais para PWA
    setMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover');
    setMetaTag('theme-color', '#8b5cf6');
    setMetaTag('mobile-web-app-capable', 'yes');
    setMetaTag('application-name', 'Zamira');
    
    // Apple iOS
    setMetaTag('apple-mobile-web-app-capable', 'yes');
    setMetaTag('apple-mobile-web-app-status-bar-style', 'black-translucent');
    setMetaTag('apple-mobile-web-app-title', 'Zamira');
    
    // Microsoft
    setMetaTag('msapplication-TileColor', '#8b5cf6');
    setMetaTag('msapplication-tap-highlight', 'no');
    
    // PWA Display
    setMetaTag('display', 'standalone');
    
    // OG Tags para compartilhamento
    setMetaTag('og:type', 'website', 'property');
    setMetaTag('og:title', 'Zamira - Portal Místico', 'property');
    setMetaTag('og:description', 'Sua jornada mística de autoconhecimento, tarot, astrologia e comunidade espiritual', 'property');
    setMetaTag('og:image', 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/a3f627646_imgi_2_337f3cf9e282bc41c87500e885414629.png', 'property');
    setMetaTag('og:site_name', 'Zamira', 'property');
    
    // Twitter Cards
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', 'Zamira - Portal Místico');
    setMetaTag('twitter:description', 'Sua jornada mística de autoconhecimento, tarot, astrologia e comunidade espiritual');
    setMetaTag('twitter:image', 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/a3f627646_imgi_2_337f3cf9e282bc41c87500e885414629.png');
    
    // Description
    setMetaTag('description', 'Zamira é seu portal místico para autoconhecimento. Explore tarot, astrologia, numerologia e conecte-se com uma comunidade espiritual vibrante.');
    setMetaTag('keywords', 'tarot, astrologia, numerologia, espiritualidade, autoconhecimento, cristais, portal místico, comunidade espiritual');
    
    // Language
    document.documentElement.lang = 'pt-BR';
    
    // Link tags
    const addLink = (rel, href, sizes = null, type = null) => {
      let link = document.querySelector(`link[rel="${rel}"]${sizes ? `[sizes="${sizes}"]` : ''}`);
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        if (sizes) link.sizes = sizes;
        if (type) link.type = type;
        document.head.appendChild(link);
      }
      link.href = href;
    };

    // Manifest
    addLink('manifest', '/manifest.json');
    
    // Apple Touch Icons (múltiplos tamanhos)
    addLink('apple-touch-icon', 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/a3f627646_imgi_2_337f3cf9e282bc41c87500e885414629.png', '180x180');
    addLink('apple-touch-icon', 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/a3f627646_imgi_2_337f3cf9e282bc41c87500e885414629.png', '152x152');
    addLink('apple-touch-icon', 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/a3f627646_imgi_2_337f3cf9e282bc41c87500e885414629.png', '120x120');
    addLink('apple-touch-icon', 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/a3f627646_imgi_2_337f3cf9e282bc41c87500e885414629.png', '76x76');
    
    // Favicons
    addLink('icon', 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/a3f627646_imgi_2_337f3cf9e282bc41c87500e885414629.png', '32x32', 'image/png');
    addLink('icon', 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/a3f627646_imgi_2_337f3cf9e282bc41c87500e885414629.png', '16x16', 'image/png');
    
    // Splash screens para iOS (diferentes tamanhos de tela)
    const addAppleSplash = (href, media) => {
      let link = document.querySelector(`link[rel="apple-touch-startup-image"][media="${media}"]`);
      if (!link) {
        link = document.createElement('link');
        link.rel = 'apple-touch-startup-image';
        link.media = media;
        document.head.appendChild(link);
      }
      link.href = href;
    };

    const splashImage = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/a3f627646_imgi_2_337f3cf9e282bc41c87500e885414629.png';
    
    // iPhone 14 Pro Max
    addAppleSplash(splashImage, '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)');
    // iPhone 14 Pro
    addAppleSplash(splashImage, '(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)');
    // iPhone 14 Plus
    addAppleSplash(splashImage, '(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)');
    // iPhone 14
    addAppleSplash(splashImage, '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)');
    // iPhone 13 Pro Max, 12 Pro Max
    addAppleSplash(splashImage, '(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)');
    // iPhone 13, 13 Pro, 12, 12 Pro
    addAppleSplash(splashImage, '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)');
    // iPhone 11 Pro Max, XS Max
    addAppleSplash(splashImage, '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)');
    // iPhone 11, XR
    addAppleSplash(splashImage, '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)');
    // iPhone 11 Pro, X, XS
    addAppleSplash(splashImage, '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)');
    // iPhone 8 Plus, 7 Plus, 6s Plus, 6 Plus
    addAppleSplash(splashImage, '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)');
    // iPhone 8, 7, 6s, 6
    addAppleSplash(splashImage, '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)');
    
    // iPad Pro 12.9"
    addAppleSplash(splashImage, '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)');
    // iPad Pro 11"
    addAppleSplash(splashImage, '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)');
    // iPad Pro 10.5"
    addAppleSplash(splashImage, '(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)');
    // iPad Mini, Air
    addAppleSplash(splashImage, '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)');

    // Canonical URL
    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = window.location.href.split('?')[0];
    if (!document.querySelector('link[rel="canonical"]')) {
      document.head.appendChild(canonical);
    }

  }, []);

  return null;
}