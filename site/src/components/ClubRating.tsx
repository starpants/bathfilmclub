import type { ClubRating as Rating } from '@bathfilmclub/types';

interface Props {
  value: Rating;
}

// Clapperboards, not stars — stars are TMDb's rating (FilmPanel). Colour comes from
// the single --color-bfc-club-rating token; the stripes are cut in the Selected band's colour.
function Clapperboard({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" className="shrink-0">
      {filled ? (
        <>
          <path d="M1 8H19V19H1Z" fill="currentColor" />
          <path d="M1 2L18 0L18.6 5L1.6 7Z" fill="currentColor" />
          <path
            d="M5 1.5L7 6.3M10 0.9L12 5.7M15 0.3L17 5.1"
            className="stroke-bfc-tier-selected"
            strokeWidth="1.6"
          />
        </>
      ) : (
        <>
          <path d="M2 9H18V18H2Z" fill="none" stroke="currentColor" strokeWidth="2" />
          <path
            d="M1.5 2.5L17.5 0.6L18 4.6L2 6.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </>
      )}
    </svg>
  );
}

export function ClubRating({ value }: Props) {
  return (
    <div
      role="img"
      aria-label={`Club rating: ${value} out of 5`}
      className="flex justify-center gap-1.5"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={n <= value ? 'text-bfc-club-rating/70' : 'text-bfc-club-rating/30'}
        >
          <Clapperboard filled={n <= value} />
        </span>
      ))}
    </div>
  );
}
