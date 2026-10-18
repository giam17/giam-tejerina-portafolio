import { useId } from 'react'
import '@fontsource/sedgwick-ave-display/latin-400.css'
import './notebook-signature.css'

/** The SVG keeps the handwritten correction together at every cover size. */
export function NotebookSignature({ onComplete }: { onComplete?: () => void }) {
  const id = useId().replaceAll(':', '')
  return <div className="identity notebook-signature" role="img" aria-label="by tejerina lucas; marcos tachado y corregido por giam" onAnimationEnd={event => {
    if (event.animationName === 'signature-draw' && (event.target as Element).classList.contains('signature-spark')) onComplete?.()
  }}>
    <svg viewBox="0 0 540 160" width="540" height="160" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={`${id}-line`}><rect className="signature-line-mask" x="0" y="0" width="490" height="66" /></clipPath>
        <clipPath id={`${id}-name`}><rect className="signature-name-mask" x="275" y="53" width="255" height="104" /></clipPath>
      </defs>
      <g clipPath={`url(#${id}-line)`}>
        <text className="signature-byline" x="8" y="48" textLength="288" lengthAdjust="spacingAndGlyphs">by tejerina lucas</text>
        <text className="signature-marcos" x="311" y="49" textLength="135" lengthAdjust="spacingAndGlyphs">marcos</text>
      </g>
      <g className="signature-crossout" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <path className="signature-strike-one" pathLength="1" d="M306 37 Q360 25 451 34" />
        <path className="signature-strike-two" pathLength="1" d="M311 43 Q371 34 447 41" />
      </g>
      <g clipPath={`url(#${id}-name)`}>
        <text className="signature-giam" x="294" y="126" textLength="190" lengthAdjust="spacingAndGlyphs" transform="rotate(-7 350 108)">giam</text>
      </g>
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path className="signature-flourish" pathLength="1" strokeWidth="3.5" d="M291 143 Q375 116 482 129 Q507 132 481 141" />
        <path className="signature-correction" pathLength="1" strokeWidth="2.5" d="M287 55 Q265 66 272 89 M266 82 L273 91 L280 83" />
        <path className="signature-spark" pathLength="1" strokeWidth="3" d="M481 64 L488 52 M497 77 L510 72 M485 89 L497 94" />
      </g>
    </svg>
  </div>
}
