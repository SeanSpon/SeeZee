import { ImageResponse } from "next/og";
export const alt = "SeeZee Studios — Websites that mean business.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#202a27",
          color: "#f6f5f0",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "64px 76px",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 42, fontWeight: 700, letterSpacing: -3 }}>
            seezee / STUDIOS
          </span>
          <span style={{ fontSize: 17, color: "#c5cec6" }}>
            LOUISVILLE, KENTUCKY
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 90,
            letterSpacing: -5,
            lineHeight: 1.05,
          }}
        >
          <span>Websites that</span>
          <span style={{ color: "#d4ddc9" }}>mean business.</span>
        </div>
        <div style={{ display: "flex", fontSize: 22, color: "#d96b57" }}>
          Web design · Custom systems · Ongoing support
        </div>
      </div>
    ),
    size,
  );
}
