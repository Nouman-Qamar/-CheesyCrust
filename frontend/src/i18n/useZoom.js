import { useState, useEffect } from 'react';

export const ZOOM_LEVELS = [
  { key: 'normal', label: 'A', zoom: 1, title: 'Normal' },
  { key: 'large', label: 'A+', zoom: 1.15, title: 'Large' },
  { key: 'xlarge', label: 'A++', zoom: 1.3, title: 'X-Large' },
];

export function useZoom() {
  const [zoomKey, setZoomKey] = useState(localStorage.getItem('cc_zoom') || 'normal');

  useEffect(() => {
    const selected = ZOOM_LEVELS.find((z) => z.key === zoomKey);
    // `zoom` scales the whole rendered page (text, spacing, icons) together
    // — works in Chromium-based browsers (Chrome/Edge), the common case.
    document.body.style.zoom = selected ? selected.zoom : 1;
    localStorage.setItem('cc_zoom', zoomKey);
  }, [zoomKey]);

  return { zoomKey, setZoomKey };
}

