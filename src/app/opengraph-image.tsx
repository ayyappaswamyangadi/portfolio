import { ImageResponse } from "next/og";

export const alt =
  "Ayyappa — Frontend Developer, React.js & Next.js Web Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0b16 0%, #14152b 55%, #1b1440 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 64,
              height: 64,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 55%, #06b6d4 100%)",
              color: "#ffffff",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            A
          </div>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: "#ffffff" }}>
            Ayyappa
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 34,
            fontWeight: 600,
            color: "#a78bfa",
            marginBottom: 24,
          }}
        >
          Frontend Developer &amp; Web Developer
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "#c9d6e6",
            marginBottom: 40,
          }}
        >
          React &middot; Next.js &middot; TypeScript &middot; JavaScript &middot; Tailwind CSS
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {["React", "Next.js", "TypeScript", "Tailwind CSS"].map((tech) => (
            <div
              key={tech}
              style={{
                display: "flex",
                padding: "10px 20px",
                borderRadius: 999,
                fontSize: 18,
                color: "#ffffff",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              {tech}
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 32,
            fontSize: 20,
            color: "#8ea3bd",
          }}
        >
          www.ayyappa.dev
        </div>
      </div>
    ),
    { ...size },
  );
}
