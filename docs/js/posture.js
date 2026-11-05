/**
 * Postura del dispositivo (progressive enhancement).
 * Se il browser espone i Viewport Segments, comunica al CSS dove sta la piega.
 * Altrimenti non fa nulla: il CSS usa il centro.
 */
export function startPosture() {
  const root = document.documentElement;
  const apply = () => {
    const segs = window.visualViewport?.segments || (navigator.windowSegments?.()) || null;
    if (segs && segs.length === 2 && segs[0].width > 0) {
      const foldX = segs[0].right ?? segs[0].width;
      const gap = Math.max(48, (segs[1].left ?? segs[1].x) - foldX);
      root.style.setProperty('--fold-x', `${foldX + gap / 2}px`);
      root.style.setProperty('--gutter', `${gap}px`);
      root.dataset.fold = 'js';
      root.dataset.posture = 'book';
    } else {
      root.removeAttribute('data-fold');
      root.style.removeProperty('--fold-x');
      root.dataset.posture = matchMedia('(min-width: 600px) and (min-height: 520px)').matches ? 'open' : 'closed';
    }
  };
  apply();
  addEventListener('resize', apply);
  window.visualViewport?.addEventListener?.('segmentschange', apply);
  if ('devicePosture' in navigator) {
    navigator.devicePosture.addEventListener('change', apply);
  }
}

export function isOpen() {
  return matchMedia('(min-width: 600px) and (min-height: 520px)').matches;
}
