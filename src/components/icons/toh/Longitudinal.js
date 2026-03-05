/**
 * @typedef {import('react').SVGProps<SVGSVGElement>} SVGProps
 */

/**
 * @typedef {SVGProps & { fill?: string }} IconProps
 */

/**
 * TOH icon for the longitudinal dimension.
 * @param {IconProps} props
 * @returns {JSX.Element}
 */
export const Longitudinal = ({ fill = '#ee2435', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33.98 33.98" role="img" {...props}>
    <path
      fill={fill}
      d="M16.97,0c9.41,0,17.01,7.6,17.01,17.01s-7.6,16.97-17.01,16.97S0,26.42,0,17.01,7.56,0,16.97,0ZM16.63,24.95h4.62l.34-5.96h.97v-4.83l-.97-1.3h-3.57l-1.05,1.93-1.01-1.93h-3.57l-.97,1.3v4.83h.97l.34,5.96h1.97v-2.31h-.67v-3.28h3.28v3.28h-.67v2.31ZM14.16,8.82c-.84,0-1.55.67-1.55,1.55s.71,1.51,1.55,1.51,1.55-.67,1.55-1.51c0-.88-.71-1.55-1.55-1.55ZM17.01,17.52c0,.8-.55,1.34-1.34,1.34-.71,0-1.34-.55-1.34-1.34s.63-1.34,1.34-1.34c.8,0,1.34.55,1.34,1.34ZM19.83,8.82c-.88,0-1.55.67-1.55,1.55s.67,1.51,1.55,1.51,1.55-.67,1.55-1.51c0-.88-.71-1.55-1.55-1.55Z"
    />
  </svg>
);
