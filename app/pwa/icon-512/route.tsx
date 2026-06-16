import { ImageResponse } from "next/og"

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(145deg, #f5f2ed 0%, #d6e0ec 42%, #4f6b95 100%)",
          borderRadius: 128,
          position: "relative",
          overflow: "hidden",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 42,
            borderRadius: 92,
            border: "10px solid rgba(255,255,255,0.45)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "#17304f",
          }}
        >
          <div
            style={{
              fontSize: 172,
              fontWeight: 800,
              letterSpacing: "-0.08em",
              lineHeight: 1,
            }}
          >
            IC
          </div>
          <div
            style={{
              marginTop: 14,
              fontSize: 64,
              fontWeight: 700,
              letterSpacing: "0.34em",
              marginLeft: "0.34em",
            }}
          >
            AMS
          </div>
        </div>
      </div>
    ),
    {
      width: 512,
      height: 512,
    }
  )
}
