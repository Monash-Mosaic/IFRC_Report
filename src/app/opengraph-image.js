import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function OpenGraphImage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'white',
        }}
      >
        <img
          src={new URL('wdr25/ifrc_logo.jpg', baseUrl).toString()}
          type="image/jpeg"
          width={520}
          height={260}
          style={{
            objectFit: 'contain',
          }}
          alt="IFRC Logo"
        />
      </div>
    ),
    size
  );
}
