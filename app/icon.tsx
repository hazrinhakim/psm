import { ImageResponse } from 'next/og'

export const size = {
  width: 32,
  height: 32,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(145deg, #f5f2ed 0%, #d6e0ec 42%, #4f6b95 100%)',
          borderRadius: 10,
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 3,
            borderRadius: 8,
            border: '1.5px solid rgba(255,255,255,0.45)',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: '#17304f',
            lineHeight: 1,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: '-0.08em',
            }}
          >
            IC
          </div>
          <div
            style={{
              marginTop: 1,
              fontSize: 6,
              fontWeight: 700,
              letterSpacing: '0.28em',
              marginLeft: '0.28em',
            }}
          >
            AMS
          </div>
        </div>
      </div>
    ),
    size
  )
}
