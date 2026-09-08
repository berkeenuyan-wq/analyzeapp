/**
 * Inline SVG icons (lucide geometry, MIT). Kept as a tiny local set rather than
 * a dependency — the rail needs six glyphs and a theme toggle.
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Svg({ children, ...props }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function LayoutDashboardIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </Svg>
  );
}

export function GaugeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 14 15.5 9.5" />
      <path d="M4.6 17.5a9 9 0 1 1 14.8 0" />
      <circle cx="12" cy="14" r="1.2" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function FlaskIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 3h6" />
      <path d="M10 3v6.5L4.6 18a2 2 0 0 0 1.7 3h11.4a2 2 0 0 0 1.7-3L14 9.5V3" />
      <path d="M7 15h10" />
    </Svg>
  );
}

export function TruckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2 6h11v10H2z" />
      <path d="M13 9h4l4 4v3h-8" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </Svg>
  );
}

export function TableIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="4" width="18" height="16" rx="1.5" />
      <path d="M3 10h18M3 15h18M9 4v16" />
    </Svg>
  );
}

export function LineChartIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 3v18h18" />
      <path d="m19 8-5 5-3-3-4 4" />
    </Svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </Svg>
  );
}
