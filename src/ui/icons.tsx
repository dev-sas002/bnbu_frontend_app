import React from 'react';

/**
 * The icon set.
 *
 * Inline SVG rather than the PNGs this app shipped with. Those were 300px
 * bitmaps of a single generic glyph, reused for every navigation item — so
 * the sidebar had four identical icons — and they cost about 25 KB of raster
 * data to render at 20px. These are sharp at any size, inherit `currentColor`
 * (so a status or a hover state tints them for free), and add nothing to the
 * asset payload.
 */

export type IconProps = React.SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
  ...props,
});

export const DashboardIcon: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);

export const RegulationIcon: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    <path d="M12 3v3" />
    <path d="M5 6h14" />
    <path d="M5 6l-2 7a3.5 3.5 0 007 0L8 6" />
    <path d="M16 6l-2 7a3.5 3.5 0 007 0l-2-7" />
    <path d="M9 21h6" />
    <path d="M12 6v15" />
  </svg>
);

export const LeaseIcon: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    <path d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6" />
    <path d="M9 17h4" />
  </svg>
);

export const AnalyzerIcon: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    <path d="M4 19V5" />
    <path d="M4 19h16" />
    <path d="M8 16v-4" />
    <path d="M12 16V8" />
    <path d="M16 16v-6" />
    <path d="M20 16v-9" />
  </svg>
);

export const UploadIcon: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    <path d="M12 16V4" />
    <path d="M8 8l4-4 4 4" />
    <path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" />
  </svg>
);

export const DownloadIcon: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    <path d="M12 4v12" />
    <path d="M8 12l4 4 4-4" />
    <path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" />
  </svg>
);

export const SearchIcon: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4 4" />
  </svg>
);

export const PlusIcon: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

export const PencilIcon: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    <path d="M4 20h4l10.5-10.5a2.12 2.12 0 00-3-3L5 17v3z" />
  </svg>
);

export const TrashIcon: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    <path d="M4 7h16" />
    <path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" />
    <path d="M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13" />
  </svg>
);

export const MenuIcon: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </svg>
);

export const CloseIcon: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    <path d="M6 18L18 6" />
    <path d="M6 6l12 12" />
  </svg>
);

export const EyeIcon: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="2.75" />
  </svg>
);

export const EyeOffIcon: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    <path d="M4 4l16 16" />
    <path d="M9.9 5.8A9.3 9.3 0 0112 5.5c6 0 9.5 6.5 9.5 6.5a16.3 16.3 0 01-3.3 4" />
    <path d="M6.4 8A16.4 16.4 0 002.5 12S6 18.5 12 18.5a9.4 9.4 0 003.5-.66" />
    <path d="M9.9 10.2a2.75 2.75 0 003.9 3.9" />
  </svg>
);

export const SparkIcon: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3z" />
    <path d="M18 16l.8 2.2L21 19l-2.2.8L18 22l-.8-2.2L15 19l2.2-.8L18 16z" />
  </svg>
);

export const DocumentIcon: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    <path d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
    <path d="M14 3v5h5" />
  </svg>
);

export const LogoutIcon: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    <path d="M15 4h3a1 1 0 011 1v14a1 1 0 01-1 1h-3" />
    <path d="M10 8l-4 4 4 4" />
    <path d="M6 12h9" />
  </svg>
);

export const KeyIcon: React.FC<IconProps> = (props) => (
  <svg {...base(props)}>
    <circle cx="8" cy="12" r="3.5" />
    <path d="M11.5 12H21" />
    <path d="M18 12v3" />
    <path d="M15 12v2" />
  </svg>
);
