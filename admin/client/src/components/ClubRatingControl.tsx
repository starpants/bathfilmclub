import type { ClubRating } from '@bathfilmclub/types';
import { color } from '../tokens';

interface Props {
  value: ClubRating | undefined;
  disabled: boolean;
  onChange: (next: ClubRating | null) => void;
}

const RATINGS: ClubRating[] = [1, 2, 3, 4, 5];

// Same clapperboard paths as the site's ClubRating. Stripes are cut in the Selected band colour.
function Clapperboard({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" style={{ display: 'block' }}>
      {filled ? (
        <>
          <path d="M1 8H19V19H1Z" fill="currentColor" />
          <path d="M1 2L18 0L18.6 5L1.6 7Z" fill="currentColor" />
          <path d="M5 1.5L7 6.3M10 0.9L12 5.7M15 0.3L17 5.1" stroke={color.tierSelected} strokeWidth="1.6" />
        </>
      ) : (
        <>
          <path d="M2 9H18V18H2Z" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M1.5 2.5L17.5 0.6L18 4.6L2 6.5Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </>
      )}
    </svg>
  );
}

/** Click a clapperboard to set the club's score; click the current score again to clear it. */
export function ClubRatingControl({ value, disabled, onChange }: Props) {
  return (
    <div role="group" aria-label="Club rating" style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
      {RATINGS.map((n) => {
        const filled = value !== undefined && n <= value;
        return (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onChange(n === value ? null : n)}
            aria-label={`Rate ${n} out of 5`}
            aria-pressed={filled}
            title={n === value ? 'Clear rating' : `Rate ${n} out of 5`}
            style={{
              padding: 0, background: 'none', border: 'none', cursor: disabled ? 'default' : 'pointer',
              color: color.clubRating, opacity: filled ? 0.8 : 0.3,
            }}
          >
            <Clapperboard filled={filled} />
          </button>
        );
      })}
    </div>
  );
}
