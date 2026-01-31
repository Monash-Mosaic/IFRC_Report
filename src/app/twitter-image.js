import { ImageResponse } from 'next/og';
import { getBaseUrl } from '@/lib/base-url';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function TwitterImage() {
  const baseUrl = getBaseUrl();
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
