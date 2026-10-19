/** Bộ icon SVG nội bộ (không cần thêm thư viện). Màu theo `currentColor`. */
function Svg({ size = 20, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const IconLogo = (p) => (
  <Svg strokeWidth="2.2" {...p}>
    <path d="M13.5 8.5 16 2.5" />
    <path d="M5.5 8.5h13" />
    <path d="M6.5 8.5 8 19.2a2 2 0 0 0 2 1.8h4a2 2 0 0 0 2-1.8l1.5-10.7" />
    <circle cx="10" cy="17" r=".9" fill="currentColor" />
    <circle cx="13.5" cy="17" r=".9" fill="currentColor" />
    <circle cx="11.8" cy="14" r=".9" fill="currentColor" />
  </Svg>
)
export const IconMix = (p) => (
  <Svg {...p}>
    <path d="M14 7.5 16.5 2" />
    <path d="M5 7.5h14" />
    <path d="m6 7.5 1.4 11.4a2 2 0 0 0 2 1.7h5.2a2 2 0 0 0 2-1.7L18 7.5" />
    <path d="M7.4 13h9.2" />
  </Svg>
)
export const IconHistory = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
)
export const IconChart = (p) => (
  <Svg {...p}>
    <path d="M5 20V11M12 20V4M19 20v-6" />
  </Svg>
)
export const IconLogout = (p) => (
  <Svg {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5M21 12H9" />
  </Svg>
)
export const IconCheck = (p) => (
  <Svg strokeWidth="3" {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
)
export const IconCross = (p) => (
  <Svg strokeWidth="3" {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
)
export const IconEye = (p) => (
  <Svg {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
)
export const IconEyeOff = (p) => (
  <Svg {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
    <path d="M3 3l18 18" />
  </Svg>
)
export const IconChevronLeft = (p) => (
  <Svg {...p}>
    <path d="m15 6-6 6 6 6" />
  </Svg>
)
export const IconChevronRight = (p) => (
  <Svg {...p}>
    <path d="m9 6 6 6-6 6" />
  </Svg>
)
export const IconAlert = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16.5h.01" />
  </Svg>
)
export const IconRefresh = (p) => (
  <Svg {...p}>
    <path d="M20 11a8 8 0 1 0-2.3 5.7" />
    <path d="M20 4v7h-7" />
  </Svg>
)
