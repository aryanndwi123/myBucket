import type { SVGProps } from "react";

/** Inline stroke icons. Decorative by default (aria-hidden); size with className, e.g. "size-5". */
function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-5"
      {...props}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20.5 20.5-4.2-4.2" />
  </Icon>
);

export const LinkIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  </Icon>
);

export const SparkIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
    <path d="M19 16v4M17 18h4" />
  </Icon>
);

export const CloseIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

export const MenuIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);

export const CheckIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon strokeWidth={2.4} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </Icon>
);

export const ArrowUpRightIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </Icon>
);
