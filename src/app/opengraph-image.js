import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b1f3a',
          color: '#ffffff',
          fontSize: 72,
          fontWeight: 700,
          letterSpacing: '-0.02em',
        }}
      >
        IFRC Reports
      </div>
    ),
    size
  );
}
