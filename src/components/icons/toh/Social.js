/**
 * @typedef {import('react').SVGProps<SVGSVGElement>} SVGProps
 */

/**
 * @typedef {SVGProps & { fill?: string }} IconProps
 */

/**
 * TOH icon for the social dimension.
 * @param {IconProps} props
 * @returns {JSX.Element}
 */
export const Social = ({ fill = '#ee2435', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33.98 33.98" role="img" {...props}>
    <path
      fill={fill}
      d="M16.97,0c9.41,0,17.01,7.6,17.01,17.01s-7.6,16.97-17.01,16.97S0,26.42,0,17.01,7.56,0,16.97,0ZM8.23,11.17v11.51h17.52v-11.51H8.23ZM24.32,21.26h-1.18v-1.55h-3.32v1.55h-1.13v-1.55h-3.32v1.55h-1.18v-1.55h-3.32v1.55h-1.22v-8.65h14.66v8.65ZM13.9,17.69c0-.8-.59-1.34-1.39-1.34s-1.39.55-1.39,1.34.59,1.39,1.39,1.39,1.39-.59,1.39-1.39ZM18.36,17.69c0-.8-.55-1.34-1.34-1.34s-1.39.55-1.39,1.34.59,1.39,1.39,1.39,1.34-.59,1.34-1.39ZM22.85,17.69c0-.8-.59-1.34-1.39-1.34s-1.34.55-1.34,1.34.55,1.39,1.34,1.39,1.39-.59,1.39-1.39Z"
    />
  </svg>
);
