// Renders "A · B · C" with real breathing room around each separator. The
// Outfit font's word space is narrow, so a plain " · " reads as "A·B" — the
// dot gets its own padded, dimmed span. The surrounding spaces stay in the
// text, so copied/extracted text still reads "A · B".
export function DotSeparated({ text }: { text: string }) {
  const parts = text.split(" · ");
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {i > 0 && (
            <>
              {" "}
              <span className="mx-1 opacity-60">·</span>{" "}
            </>
          )}
          {part}
        </span>
      ))}
    </>
  );
}
