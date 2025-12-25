/**
 * @typedef {import('react').SVGProps<SVGSVGElement>} SVGProps
 */

/**
 * @typedef {SVGProps & { fill?: string }} IconProps
 */

/**
 * TOH icon for the psychological dimension.
 * @param {IconProps} props
 * @returns {JSX.Element}
 */
export const Psychological = ({ fill = '#ee2435', ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33.98 33.98" role="img" {...props}>
    <path
      fill={fill}
      d="M16.97,0c9.41,0,17.01,7.6,17.01,17.01s-7.6,16.97-17.01,16.97S0,26.42,0,17.01,7.56,0,16.97,0ZM25.62,16.51c-.17-.17-2.94-4.33-8.65-4.33s-8.49,4.16-8.61,4.37v.76c.13.21,2.9,4.33,8.61,4.33s8.57-4.12,8.65-4.33v-.8ZM9.83,16.93c.76-.97,3.23-3.32,7.14-3.32s6.34,2.31,7.18,3.28c-.84.97-3.24,3.32-7.18,3.32s-6.39-2.31-7.14-3.28ZM14.07,16.89c0,1.64,1.26,2.9,2.9,2.9s2.9-1.26,2.9-2.9-1.26-2.86-2.9-2.86-2.9,1.3-2.9,2.86ZM16.05,16.93c0-.55.42-.97.92-.97.55,0,.97.42.97.97,0,.5-.42.92-.97.92-.5,0-.92-.42-.92-.92Z"
    />
  </svg>
);
