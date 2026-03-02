/**
 * @typedef {import('react').SVGProps<SVGSVGElement>} SVGProps
 */

/**
 * @typedef {SVGProps & { fill?: string }} IconProps
 */

/**
 * TOH icon for the societal dimension.
 * @param {IconProps} props
 * @returns {JSX.Element}
 */
export const Societal = ({ fill = '#ee2435', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33.98 33.98" role="img" {...props}>
    <path
      fill={fill}
      d="M16.97,0c9.41,0,17.01,7.6,17.01,17.01s-7.6,16.97-17.01,16.97S0,26.42,0,17.01,7.56,0,16.97,0ZM23.69,24.15v-2.65h-13.44v2.65h13.44ZM23.02,12.14v-1.34l-6.09-2.73-5.96,2.73v1.34h12.06ZM12.94,20.25v-6.76h-1.97v6.76h1.97ZM16.3,20.25v-6.76h-2.02v6.76h2.02ZM19.66,20.25v-6.76h-2.02v6.76h2.02ZM23.02,20.25v-6.76h-2.02v6.76h2.02Z"
    />
  </svg>
);
