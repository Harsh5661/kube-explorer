import type { ReactNode } from "react";

export type IconName =
  | "arrow-up-left"
  | "boxes"
  | "cluster"
  | "cloud"
  | "download"
  | "folder"
  | "folder-plus"
  | "file"
  | "gear"
  | "globe"
  | "maximize"
  | "minimize"
  | "more"
  | "namespace"
  | "refresh"
  | "search"
  | "sliders"
  | "terminal"
  | "trash"
  | "transfer"
  | "upload"
  | "x"
  | "plus"
  | "collapse"
  | "copy"
  | "chevron-down"
  | "chevron-right"
  | "dot";

export function Icon({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  const icons: Record<IconName, ReactNode> = {
    "arrow-up-left": (
      <path d="M7 7h10v2H9.41l8.29 8.29-1.41 1.41L8 10.41V17H6V7h1z" />
    ),
    boxes: (
      <path d="M4 7.5 12 3l8 4.5-8 4.5L4 7.5Zm0 3.5 7 4v6l-7-4v-6Zm9 10v-6l7-4v6l-7 4Z" />
    ),
    cluster: (
      <path d="M12 2 4 6.5v11L12 22l8-4.5v-11L12 2Zm0 2.3 5.8 3.2L12 10.7 6.2 7.5 12 4.3Zm-6 5 5 2.8v6L6 15.3v-6Zm7 8.8v-6l5-2.8v6l-5 2.8Z" />
    ),
    cloud: (
      <path d="M7.5 19a5.5 5.5 0 0 1-.7-10.96A6.5 6.5 0 0 1 19.25 10.5H20a4.5 4.5 0 0 1 0 9H7.5Zm0-2H20a2.5 2.5 0 0 0 0-5h-2.3l-.3-1.23a4.5 4.5 0 0 0-8.86.15l-.2 1.35-1.35-.18A3.5 3.5 0 0 0 7.5 17Z" />
    ),
    download: (
      <path d="M11 4h2v8.17l2.59-2.58L17 11l-5 5-5-5 1.41-1.41L11 12.17V4Zm-6 14h14v2H5v-2Z" />
    ),
    folder: <path d="M3.75 6.75c0-1.24 1.01-2.25 2.25-2.25h3.12c.46 0 .89.18 1.2.5l1.05 1.05h6.63c1.24 0 2.25 1.01 2.25 2.25v1.05H3.75V6.75Zm0 3.85h16.5v6.65c0 1.24-1.01 2.25-2.25 2.25H6c-1.24 0-2.25-1.01-2.25-2.25V10.6Z" />,
    "folder-plus": (
      <path d="M3.75 6.75c0-1.24 1.01-2.25 2.25-2.25h3.12c.46 0 .89.18 1.2.5l1.05 1.05h6.63c1.24 0 2.25 1.01 2.25 2.25v1.05H3.75V6.75Zm0 3.85h16.5v6.65c0 1.24-1.01 2.25-2.25 2.25H6c-1.24 0-2.25-1.01-2.25-2.25V10.6Zm7.5 1.4h1.5v1.75h1.75v1.5h-1.75V17h-1.5v-1.75H9.5v-1.5h1.75V12Z" />
    ),
    file: <path d="M7.5 3.5h6.23c.46 0 .9.18 1.22.5l2.55 2.55c.32.32.5.76.5 1.22V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5a1.5 1.5 0 0 1 1.5-1.5Zm0 1.5V19h9V8h-3a1 1 0 0 1-1-1V5h-5Zm6.5.56V6.5h.94L14 5.56Z" />,
    gear: (
      <path d="m19.14 12.94.86-1.49-1.64-2.84-1.7.3a5.89 5.89 0 0 0-1.04-.61l-.26-1.71H9.64L9.38 8.3c-.36.15-.7.35-1.03.59l-1.72-.29L5 11.45l.86 1.49c-.03.17-.04.35-.04.55 0 .19.01.37.04.55L5 15.53l1.63 2.84 1.72-.29c.33.24.67.44 1.03.59l.26 1.71h3.72l.26-1.71c.36-.15.7-.35 1.04-.6l1.7.3L20 15.53l-.86-1.49c.03-.18.05-.36.05-.55s-.02-.37-.05-.55ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z" />
    ),
    globe: (
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.93 9h-3.14a15.9 15.9 0 0 0-1.29-5.03A8.02 8.02 0 0 1 18.93 11ZM12 4c.92 1.34 1.65 3.16 2.02 5H9.98C10.35 7.16 11.08 5.34 12 4ZM4.07 13h3.14c.18 1.78.64 3.5 1.29 5.03A8.02 8.02 0 0 1 4.07 13Zm3.14-2H4.07a8.02 8.02 0 0 1 4.43-5.03A15.9 15.9 0 0 0 7.21 11ZM12 20c-.92-1.34-1.65-3.16-2.02-5h4.04c-.37 1.84-1.1 3.66-2.02 5Zm2.36-7H9.64A14.1 14.1 0 0 1 9.5 12c0-.34.05-.67.14-1h4.72c.09.33.14.66.14 1 0 .34-.05.67-.14 1Zm.14 5.03A15.9 15.9 0 0 0 15.79 13h3.14a8.02 8.02 0 0 1-4.43 5.03Z" />
    ),
    maximize: <path d="M7 7h10v10H7V7Zm1.5 1.5v7h7v-7h-7Z" />,
    minimize: <path d="M6 12h12v2H6v-2Z" />,
    more: <path d="M6 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />,
    namespace: (
      <path d="M5 5h14v14H5V5Zm2 2v10h10V7H7Zm2 2h6v6H9V9Zm2 2v2h2v-2h-2Z" />
    ),
    refresh: (
      <path d="M17.65 6.35A8 8 0 1 0 20 12h-2a6 6 0 1 1-1.76-4.24L13 11h7V4l-2.35 2.35Z" />
    ),
    search: (
      <path d="M10 4a6 6 0 1 0 3.87 10.59l4.77 4.77 1.41-1.41-4.77-4.77A6 6 0 0 0 10 4Zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" />
    ),
    sliders: (
      <path d="M7 6h14v2H7V6Zm-4 0h2v2H3V6Zm8 5h10v2H11v-2Zm-8 0h6v2H3v-2Zm12 5h6v2h-6v-2Zm-12 0h10v2H3v-2Z" />
    ),
    terminal: (
      <path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v10h16V7H4Zm3 1.5L10.5 12 7 15.5l1.5 1.5 5-5-5-5L7 8.5ZM12 15h5v2h-5v-2Z" />
    ),
    trash: (
      <path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 6h2v8h-2V9Zm4 0h2v8h-2V9ZM7 9h2v8H7V9Zm-1 10h12l-1 2H7l-1-2Z" />
    ),
    transfer: (
      <path d="M5 7h11.17l-2.58-2.59L15 3l5 5-5 5-1.41-1.41L16.17 9H5V7Zm14 10H7.83l2.58 2.59L9 21l-5-5 5-5 1.41 1.41L7.83 15H19v2Z" />
    ),
    upload: (
      <path d="M11 20h2v-8.17l2.59 2.58L17 13l-5-5-5 5 1.41 1.41L11 11.83V20ZM5 4h14v2H5V4Z" />
    ),
    x: <path d="M6.41 5 12 10.59 17.59 5 19 6.41 13.41 12 19 17.59 17.59 19 12 13.41 6.41 19 5 17.59 10.59 12 5 6.41 6.41 5Z" />,
    plus: <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" />,
    collapse: <path d="M4 11h16v2H4v-2Z" />,
    copy: (
      <path d="M8 8V4h11v13h-4v3H4V8h4Zm2 0h5v7h2V6h-7v2Zm3 10v-8H6v8h7Z" />
    ),
    "chevron-down": <path d="m7 10 5 5 5-5H7Z" />,
    "chevron-right": <path d="m10 7 5 5-5 5V7Z" />,
    dot: <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />,
  };

  return (
    <svg
      aria-hidden="true"
      className={`icon ${className}`.trim()}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      {icons[name]}
    </svg>
  );
}
