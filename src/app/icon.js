import { ImageResponse } from 'next/og';

export const size = {
  width: 512,
  height: 512,
};

export const contentType = 'image/png';

export default function Icon() {
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
          color: '#ffffff',
          fontSize: 160,
          fontWeight: 700,
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
