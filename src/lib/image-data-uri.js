import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

export async function getLocalImageDataUri(relativePath) {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const imagePath = join(__dirname, '..', '..', relativePath);
  const buffer = await readFile(imagePath);
  const base64Data = buffer.toString('base64');
  const dataUri = `data:image/jpeg;base64, ${base64Data}`;

  return dataUri;
}
