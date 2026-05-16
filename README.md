# Kube Explorer

Kube Explorer is a desktop-first Kubernetes filesystem explorer.

The product goal is simple:

`Windows Explorer for Kubernetes`

Instead of relying on commands like:

```bash
kubectl exec -it pod -- sh
kubectl cp
kubectl logs -f
```

the app is intended to provide a visual workflow for browsing clusters, navigating pod filesystems, viewing files, using terminals, and working with transfers.

## Current Status

This repository is in an early frontend-first stage.

What exists today:

- A React + TypeScript desktop UI prototype
- Mock data for clusters, pods, files, logs, terminal output, and transfers
- An Electron shell so the UI can be launched as a Windows desktop app
- A packaged Windows app folder for local preview

What does not exist yet:

- Real Kubernetes backend integration
- Go engine / API layer
- Live file operations
- Real terminal sessions
- Real log streaming

## Repository Layout

```txt
kube-explorer/
├── apps/
│   ├── desktop-ui/
│   └── plan
├── docs/
└── README.md
```

## Documentation

- [Current Status](./docs/current-status.md)
- [Desktop UI Guide](./apps/desktop-ui/README.md)

## Product Direction

The original plan targets:

- Multi-cluster browsing
- Namespace, pod, and container exploration
- Filesystem navigation
- Upload / download / rename / delete workflows
- File preview and editing
- Terminal and log panels
- Desktop-native feel

That broader roadmap is currently represented in [`apps/plan`](./apps/plan), while the docs above describe the real implemented state of the repo today.
