import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
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
          fontSize: 64,
          fontWeight: 700,
        }}
      >
        <img
          src={new URL('wdr25/ifrc_logo.jpg', baseUrl).toString()}
          type="image/jpeg"
          width={180}
          height={180}
          style={{
            objectFit: 'fit',
          }}
          alt="IFRC Logo"
        />
      </div>
    ),
    size
  );
}
