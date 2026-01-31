import { ImageResponse } from 'next/og';
import { getLocalImageDataUri } from '@/lib/image-data-uri';

export const size = {
  width: 512,
  height: 512,
};

export const contentType = 'image/png';

export default async function Icon() {
  const { default: metadata } = await import(`../../public/wdr25/ifrc_logo.jpg`);
  const dataUri = await getLocalImageDataUri('public/wdr25/ifrc_logo.jpg');

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
          src={dataUri}
          width={metadata.width}
          height={metadata.height}
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
