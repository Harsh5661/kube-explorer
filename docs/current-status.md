# Current Status

This document describes the real implementation status of the project as of the current repository snapshot.

## Summary

Kube Explorer currently ships as a UI prototype with desktop packaging support.

The application is not yet connected to Kubernetes.

All displayed data is mock data.

## What Is Implemented

### Desktop UI

The UI includes:

- Cluster / namespace / pod / container navigation
- Filesystem-style file table
- Breadcrumb path display
- Search field
- Preview and properties side panel
- Terminal and logs bottom panel
- Transfers and bookmarks panel
- Resizable panes
- Custom desktop title bar controls

### Mock Application Behavior

The current prototype supports local UI-only interactions such as:

- Expanding and collapsing tree nodes
- Selecting pods and containers
- Navigating mock folder paths
- Switching between preview and properties tabs
- Pausing and clearing mock logs
- Resetting or extending mock terminal output
- Adjusting pane sizes

### Desktop Packaging

The desktop UI has been wrapped in Electron so it can be previewed as a Windows desktop app.

Available outputs today:

- Unpacked Electron build
- Packaged Windows app folder with `.exe`

## Current Technical Stack

### Implemented Today

- React
- TypeScript
- Vite
- Electron

### Planned But Not Implemented Yet

The original plan references a broader stack such as:

- Go backend
- Kubernetes `client-go`
- REST + WebSocket API layer
- Monaco editor
- xterm.js
- Drag and drop
- Shared packages / monorepo structure

Those pieces are not in the repository yet.

## Important Architecture Note

The original product plan mentions Tauri as the desktop framework.

The current working prototype uses Electron instead.

Reason:

- Electron was introduced to quickly package and inspect the UI as a Windows desktop app during frontend iteration.

This does not prevent a future move back to Tauri if that becomes the preferred production direction.

## Known Gaps

The current prototype still needs:

- Real directory data model instead of one flat file list
- Real backend contract
- Real authentication and cluster connectivity
- Real file transfers
- Real terminal transport
- Real log transport
- App metadata and final icons for packaged desktop builds
- Installer generation without local Windows privilege issues

## Windows Packaging Note

The repository can currently generate a runnable packaged Windows app folder.

`electron-builder` installer generation was attempted, but on this machine it hit a Windows symlink privilege issue while extracting signing-related binaries.

The fallback path using Electron Packager works and is documented in the desktop UI guide.

## Recommended Next Steps

1. Introduce a structured mock filesystem model keyed by path.
2. Define the backend API contract for clusters, files, logs, and terminal sessions.
3. Decide whether the long-term desktop shell remains Electron or returns to Tauri.
4. Add application metadata, icons, and installer polishing.
