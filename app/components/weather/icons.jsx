function Icon({ children, className = "h-5 w-5", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
}

export function SearchIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </Icon>
  );
}

export function LocationIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 21s6.5-5.4 6.5-10.2A6.5 6.5 0 0 0 5.5 10.8C5.5 15.6 12 21 12 21Z" />
      <circle cx="12" cy="10.5" r="2.4" />
    </Icon>
  );
}

export function DownloadIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 3v11" />
      <path d="m7.5 10 4.5 4.5L16.5 10" />
      <path d="M4.5 17.5v1.8A1.7 1.7 0 0 0 6.2 21h11.6a1.7 1.7 0 0 0 1.7-1.7v-1.8" />
    </Icon>
  );
}

export function RefreshIcon(props) {
  return (
    <Icon {...props}>
      <path d="M20 11.5a8 8 0 1 0-2.3 6.4" />
      <path d="M20 4.5v7h-7" />
    </Icon>
  );
}

export function CloseIcon(props) {
  return (
    <Icon {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </Icon>
  );
}

export function CheckIcon(props) {
  return (
    <Icon {...props}>
      <path d="m5 12.5 4.2 4.2L19 7" />
    </Icon>
  );
}

export function ShareIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 15V3" />
      <path d="m8 7 4-4 4 4" />
      <path d="M5.5 12.5v6A2.5 2.5 0 0 0 8 21h8a2.5 2.5 0 0 0 2.5-2.5v-6" />
    </Icon>
  );
}

export function MoreIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="1.1" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function WifiOffIcon(props) {
  return (
    <Icon {...props}>
      <path d="M3 4.5 20.5 20" />
      <path d="M8.6 15.4a5 5 0 0 1 6.8 0" />
      <path d="M5.5 12.2a10 10 0 0 1 4-2.2" />
      <path d="M14.5 10a10 10 0 0 1 4 2.2" />
      <path d="M2.5 9a15 15 0 0 1 4-2.5" />
      <path d="M17.5 6.5A15 15 0 0 1 21.5 9" />
      <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function AlertIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 4 2.8 20h18.4L12 4Z" />
      <path d="M12 9.5v5" />
      <circle cx="12" cy="17.3" r="0.9" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function ArrowRightIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4 12h15" />
      <path d="m13.5 6.5 6 5.5-6 5.5" />
    </Icon>
  );
}

export function SunIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </Icon>
  );
}

export function MoonIcon(props) {
  return (
    <Icon {...props}>
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
    </Icon>
  );
}

export function WindIcon(props) {
  return (
    <Icon {...props}>
      <path d="M3 8.5h10.5a3 3 0 1 0-3-3" />
      <path d="M3 12.5h14a2.5 2.5 0 1 1-2.5 2.5" />
      <path d="M3 16.5h8" />
    </Icon>
  );
}

export function DropletIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 3.5c3 3.6 6 7 6 10.2a6 6 0 0 1-12 0C6 10.5 9 7.1 12 3.5Z" />
      <path d="M9.5 14.5a2.6 2.6 0 0 0 2.5 2.6" />
    </Icon>
  );
}

export function GaugeIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4 17a9 9 0 1 1 16 0" />
      <path d="M12 13.5 15.5 9" />
      <circle cx="12" cy="14" r="1.4" />
      <path d="M3 20.5h18" />
    </Icon>
  );
}

export function EyeIcon(props) {
  return (
    <Icon {...props}>
      <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </Icon>
  );
}

export function CloudIcon(props) {
  return (
    <Icon {...props}>
      <path d="M7.5 18.5h9.7a3.8 3.8 0 0 0 .4-7.6 5.6 5.6 0 0 0-10.8-1.2 4.4 4.4 0 0 0 .7 8.8Z" />
    </Icon>
  );
}

export function SparkIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 3.5c.7 4.2 2.3 5.8 6.5 6.5-4.2.7-5.8 2.3-6.5 6.5-.7-4.2-2.3-5.8-6.5-6.5 4.2-.7 5.8-2.3 6.5-6.5Z" />
      <path d="M18.5 15.5c.3 1.9 1.1 2.7 3 3-1.9.3-2.7 1.1-3 3-.3-1.9-1.1-2.7-3-3 1.9-.3 2.7-1.1 3-3Z" />
    </Icon>
  );
}

export function CompassIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </Icon>
  );
}

export function ListIcon(props) {
  return (
    <Icon {...props}>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <circle cx="3.5" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="3.5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="3.5" cy="18" r="1" fill="currentColor" stroke="none" />
    </Icon>
  );
}
