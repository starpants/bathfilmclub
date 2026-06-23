export function FilmStrip() {
  return (
    <div className="flex justify-center gap-6 pt-10">
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} className="w-3 h-3 bg-bfc-brand-fg" />
      ))}
    </div>
  );
}
