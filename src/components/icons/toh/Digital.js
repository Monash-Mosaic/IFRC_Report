/**
 * @typedef {import('react').SVGProps<SVGSVGElement>} SVGProps
 */

/**
 * @typedef {SVGProps & { fill?: string }} IconProps
 */

/**
 * TOH icon for the digital dimension.
 * @param {IconProps} props
 * @returns {JSX.Element}
 */
export const Digital = ({ fill = '#ee2435', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33.98 33.98" role="img" {...props}>
    <path
      fill={fill}
      d="M16.97,0c9.41,0,17.01,7.6,17.01,17.01s-7.6,16.97-17.01,16.97S0,26.42,0,17.01,7.56,0,16.97,0ZM22.35,8.86h-10.71l-.67.67v14.79l.67.67h10.71l.67-.67v-14.79l-.67-.67ZM21.68,21.63h-9.37v-10.08h9.37v10.08ZM16.17,23.31c0-.46.38-.84.84-.84s.84.38.84.84-.38.84-.84.84-.84-.38-.84-.84Z"
    />
  </svg>
);
