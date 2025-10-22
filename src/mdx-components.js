import Image from 'next/image';

/**
 * Custom MDX components to be used within MDX files.
 * TODO: Enhance these components with additional styling or functionality as needed.
 * 
 * @type {import('mdx/types').MDXComponents}
 */
const components = {
  h1: (props) => <h1 {...props} />,
  h2: (props) => <h2 {...props} />,
  h3: (props) => <h3 {...props} />,
  h4: (props) => <h4 {...props} />,
  h5: (props) => <h5 {...props} />,
  h6: (props) => <h6 {...props} />,
  p: (props) => <p {...props} />,
  // a: (props) => <a {...props} />,
  // ul: (props) => <ul {...props} />,
  // ol: (props) => <ol {...props} />,
  // li: (props) => <li {...props} />,
  // blockquote: (props) => <blockquote {...props} />,
  // code: (props) => <code {...props} />,
  // pre: (props) => <pre {...props} />,
  // table: (props) => <table {...props} />,
  // thead: (props) => <thead {...props} />,
  // tbody: (props) => <tbody {...props} />,
  // tr: (props) => <tr {...props} />,
  // td: (props) => <td {...props} />,
  // th: (props) => <th {...props} />,
  // hr: (props) => <hr {...props} />,
  // strong: (props) => <strong {...props} />,
  // em: (props) => <em {...props} />,
  // del: (props) => <del {...props} />,
  // inlineCode: (props) => <code {...props} />,
  image: ({ alt, ...props }) => <Image
    alt={alt}
    {...props}
  />,
}

export function useMDXComponents() {
  return components
}