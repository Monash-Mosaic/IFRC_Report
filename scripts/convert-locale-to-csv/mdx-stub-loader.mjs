export async function resolve(specifier, context, nextResolve) {
  if (specifier.endsWith('.mdx')) {
    return nextResolve(specifier, { ...context, format: 'module' });
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith('.mdx')) {
    return {
      format: 'module',
      shortCircuit: true,
      source: `export default {};
      export const title = '';
      export const subtitle = '';
      export const tableOfContents = [];
      export const component = null;
`,
    };
  }
  return nextLoad(url, context);
}
