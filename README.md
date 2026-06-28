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

This repository now has a working backend in addition to the frontend prototype.

What exists today:

- A React + TypeScript desktop UI prototype (still using mock data, not yet wired to the backend)
- An Electron shell so the UI can be launched as a Windows desktop app
- A real Go backend (`apps/kube-engine`) that connects to actual Kubernetes clusters via `client-go`, supporting both certificate-based clusters (e.g. microk8s) and exec-plugin/cloud-auth clusters (e.g. EKS)
- REST endpoints for listing clusters, namespaces, pods, and browsing pod filesystems
- A proven `exec`-into-container mechanism (the same one used by `kubectl exec`), used both for filesystem listing today and as the foundation for the upcoming terminal feature

What does not exist yet:

- Frontend ↔ backend integration (UI still reads mock data)
- Live terminal sessions (WebSocket-based, not yet built)
- Real log streaming
- File upload/download/edit operations
- Multi-cluster credential/session management in a packaged desktop context

See [Current Status](./docs/current-status.md) for the detailed breakdown and [Backend API](./docs/backend-api.md) for endpoint documentation.

## Repository Layout

```txt
kube-explorer/
├── apps/
│   ├── desktop-ui/
│   ├── kube-engine/
│   └── plan
├── docs/
└── README.md
```

## Documentation

- [Current Status](./docs/current-status.md)
- [Backend API Reference](./docs/backend-api.md)
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
