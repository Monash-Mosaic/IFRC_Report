import { existsSync } from 'node:fs';
import { dirname, resolve as pathResolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = pathResolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const srcRoot = pathResolve(projectRoot, 'src');
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'];

const resolveWithExtensions = (basePath) => {
  if (existsSync(basePath)) {
    return basePath;
  }
  for (const ext of EXTENSIONS) {
    const candidate = `${basePath}${ext}`;
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  for (const ext of EXTENSIONS) {
    const candidate = pathResolve(basePath, `index${ext}`);
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
};

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const relative = specifier.slice(2);
    const basePath = pathResolve(srcRoot, relative);
    const resolvedPath = resolveWithExtensions(basePath);
    if (resolvedPath) {
      return { url: pathToFileURL(resolvedPath).href };
    }
  }
  return nextResolve(specifier, context);
}
