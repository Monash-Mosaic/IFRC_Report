/**
 * @typedef {import('react').SVGProps<SVGSVGElement>} SVGProps
 */

/**
 * @typedef {SVGProps & { fill?: string }} IconProps
 */

/**
 * TOH icon for the physical dimension.
 * @param {IconProps} props
 * @returns {JSX.Element}
 */
export const Physical = ({ fill = '#ee2435', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33.98 33.98" role="img" {...props}>
    <path
      fill={fill}
      d="M16.97,0c9.41,0,17.01,7.6,17.01,17.01s-7.6,16.97-17.01,16.97S0,26.42,0,17.01,7.56,0,16.97,0ZM18.36,24.99h1.93l2.1-7.81h3.91v-2.02h-4.66l-.92.76-1.43,5.21-3.65-12.27h-1.89l-2.1,6.3h-3.95v2.02h4.66l.92-.71,1.34-3.99,3.74,12.52Z"
    />
  </svg>
);
