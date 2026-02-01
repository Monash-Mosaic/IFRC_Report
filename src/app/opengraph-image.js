import { ImageResponse } from 'next/og';
import { getLocalImageDataUri } from '@/lib/image-data-uri';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function OpenGraphImage() {
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
        }}
      >
        <img
          src={dataUri}
          width={metadata.width}
          height={metadata.height}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
          alt="IFRC Logo"
        />
      </div>
    ),
    size
  );
}
