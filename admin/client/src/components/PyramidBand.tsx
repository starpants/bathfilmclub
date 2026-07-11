import type { ReactNode } from 'react';
import { fg, font } from '../tokens';

interface Props {
  title: string;
  color: string;
  children: ReactNode;
}

// Full-bleed coloured band that breaks out of the centered 1200px container,
// matching the public pyramid's edge-to-edge tiers.
export function PyramidBand({ title, color, children }: Props) {
  const count = Array.isArray(children) ? children.length : children ? 1 : 0;
  return (
    <div style={{ background: color, margin: '0 calc(50% - 50vw)', padding: '1.5rem calc(50vw - 50%)' }}>
      <h3 style={{ margin: '0 0 1rem', fontFamily: font.display, fontSize: '0.9rem', letterSpacing: '0.1em', color: fg.strong }}>
        {title}
      </h3>
      {count === 0 ? (
        <p style={{ margin: 0, fontSize: '0.85rem', fontStyle: 'italic', color: fg.faint }}>No films in this tier.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>{children}</div>
      )}
    </div>
  );
}
