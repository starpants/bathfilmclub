export function FilmStrip() {
  return (
    <div className="flex justify-center gap-8 pt-10">
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} className="w-4 h-4 bg-bfc-brand-fg/60" />
      ))}
    </div>
  );
}
