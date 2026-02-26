/**
 * @typedef {import('react').SVGProps<SVGSVGElement>} SVGProps
 */

/**
 * @typedef {SVGProps & { fill?: string }} IconProps
 */

/**
 * TOH icon for the deprivational dimension.
 * @param {IconProps} props
 * @returns {JSX.Element}
 */
export const Deprivational = ({ fill = '#ee2435', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33.98 33.98" role="img" {...props}>
    <path
      fill={fill}
      d="M16.97,0c9.41,0,17.01,7.6,17.01,17.01s-7.6,16.97-17.01,16.97S0,26.42,0,17.01,7.56,0,16.97,0ZM23.69,10.17h-13.4v4.07h1.22v9.45h10.84v-9.45h1.34v-4.07ZM12.94,11.59h1.39v10.67h-1.39v-10.67ZM20.92,22.26h-4.54v-10.67h4.54v10.67Z"
    />
  </svg>
);
