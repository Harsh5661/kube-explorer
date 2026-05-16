# Desktop UI

This app contains the current Kube Explorer frontend prototype.

It is built with React + TypeScript + Vite and can be run both:

- In the browser during development
- Inside an Electron desktop shell for Windows preview

## What This App Does Today

The current UI is mock-data driven and demonstrates:

- Cluster explorer sidebar
- Pod/container selection
- Filesystem-style table
- Preview and properties pane
- Terminal and logs panel
- Transfers and bookmarks panel
- Resizable desktop panes
- Custom frameless desktop window controls

## Project Structure

```txt
desktop-ui/
├── electron/
│   ├── dev.mjs
│   ├── main.mjs
│   └── preload.mjs
├── src/
│   ├── components/
│   ├── data/
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── dist/
├── release/
└── package.json
```

## Important Files

- [`src/App.tsx`](./src/App.tsx): main shell and page composition
- [`src/data/mockData.ts`](./src/data/mockData.ts): mock clusters, files, logs, transfers
- [`src/components/ClusterSidebar.tsx`](./src/components/ClusterSidebar.tsx): left navigation tree
- [`src/components/PreviewCode.tsx`](./src/components/PreviewCode.tsx): preview rendering
- [`src/components/FileProperties.tsx`](./src/components/FileProperties.tsx): properties view
- [`src/components/Icon.tsx`](./src/components/Icon.tsx): icon set
- [`electron/main.mjs`](./electron/main.mjs): Electron main process
- [`electron/preload.mjs`](./electron/preload.mjs): secure renderer bridge
- [`electron/dev.mjs`](./electron/dev.mjs): development launcher for Vite + Electron

## Scripts

### Browser Development

```bash
npm run dev
```

Starts the Vite development server.

### Browser Production Build

```bash
npm run build
```

Builds the frontend into `dist/`.

### Electron Development

```bash
npm run electron:dev
```

Starts Vite if needed, waits for the dev server, and opens the app in Electron.

### Unpacked Electron Build

```bash
npm run electron:dir
```

Attempts an unpacked Windows build using `electron-builder`.

Note:

- On this machine, `electron-builder` hits a Windows symlink privilege issue while extracting signing-related binaries.

### Packaged Windows App Folder

```bash
npm run electron:pack
```

Builds the frontend and creates a runnable Windows app folder under:

```txt
release/packaged/Kube Explorer-win32-x64/
```

The executable is:

```txt
release/packaged/Kube Explorer-win32-x64/Kube Explorer.exe
```

### Installer Attempt

```bash
npm run electron:build
```

This is configured for `electron-builder`, but installer generation may still fail locally depending on Windows privilege settings.

## How The Desktop Shell Works

The Electron wrapper is intentionally thin.

Responsibilities:

- Open the React UI in a frameless desktop window
- Expose minimize / maximize / close controls
- Preserve the custom title bar look from the design

Non-responsibilities:

- Business logic
- Kubernetes connectivity
- Filesystem operations

Those should eventually move into a backend layer.

## Current Limitations

- All data is static mock data
- No backend or Kubernetes integration
- No persistent app state
- No installer artifact guaranteed on every Windows setup
- No final application icon / branding assets yet

## Recommended Next Steps

1. Replace the flat mock file list with a path-based mock filesystem map.
2. Add an API adapter layer so UI data loading can later swap from mock data to backend calls.
3. Add desktop app branding assets such as `.ico`.
4. Decide whether Electron remains the shipping shell or is only a prototype path before moving to Tauri.
