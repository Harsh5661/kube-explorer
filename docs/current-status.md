# Current Status

This document describes the real implementation status of the project as of the current repository snapshot.

## Summary

Kube Explorer now has two real, working pieces that are not yet connected to each other:

1. A frontend UI prototype (React + TypeScript + Electron) — still using mock data.
2. A backend engine (`apps/kube-engine`, Go) — connects to **real** Kubernetes clusters and serves real data over REST.

The backend has been verified end-to-end against two different real clusters: a local microk8s cluster (certificate-based auth) and an AWS EKS cluster (exec-plugin / `aws eks get-token` auth). Both work through the same code path without any cluster-type-specific logic in our handlers — client-go handles the auth differences transparently.

## What Is Implemented

### Desktop UI (unchanged from before, not yet integrated with backend)

- Cluster / namespace / pod / container navigation
- Filesystem-style file table
- Breadcrumb path display
- Search field
- Preview and properties side panel
- Terminal and logs bottom panel
- Transfers and bookmarks panel
- Resizable panes
- Custom desktop title bar controls

All of the above still runs on mock data (`apps/desktop-ui/src/data/mockData.ts`). Wiring it to the real backend endpoints below is the next major milestone.

### Backend Engine (`apps/kube-engine`) — new this session

Tech stack actually in use:

- Go
- [chi](https://github.com/go-chi/chi) — HTTP router
- [viper](https://github.com/spf13/viper) — config loading (YAML + env var overrides)
- [zap](https://github.com/uber-go/zap) — structured logging
- [client-go](https://github.com/kubernetes/client-go) — Kubernetes API client + kubeconfig parsing + remote exec

Project layout:

```txt
apps/kube-engine/
├── go.mod / go.sum
├── config.yaml
├── cmd/
│   └── server/
│       └── main.go            entrypoint: config, logger, router, routes
└── internal/
    ├── config/                 viper-based config loading
    ├── logger/                 zap logger setup
    ├── k8s/
    │   ├── client.go            kubeconfig parsing, ListContexts, NewClient, restConfigFor
    │   ├── namespaces.go        ListNamespaces
    │   ├── pods.go              ListPods
    │   ├── exec.go              ExecCommand (SPDY remote exec into a container)
    │   └── files.go             ListFiles (ls-based directory listing, GNU + BusyBox)
    └── api/
        ├── clusters.go          GET /api/clusters
        ├── namespaces.go        GET /api/namespaces
        ├── pods.go              GET /api/pods
        └── files.go             GET /api/files
```

Full endpoint documentation: [docs/backend-api.md](./backend-api.md).

### Verified working end-to-end

- Reading the user's kubeconfig and listing all contexts (clusters)
- Connecting to a specific context on demand (not just whatever is `current-context`)
- Listing real namespaces and pods from a live cluster
- Authenticating against both a cert-based cluster (microk8s) and an exec-plugin cloud cluster (EKS via `aws eks get-token`)
- Remotely executing a command inside a running container via the Kubernetes exec subresource (the same mechanism `kubectl exec` uses, via `remotecommand.NewSPDYExecutor`)
- Listing real directory contents inside a running container, with a fallback parser for containers whose `ls` is BusyBox (no GNU `--time-style` support) rather than GNU coreutils

## Current Technical Stack

### Implemented Today

**Frontend:**
- React
- TypeScript
- Vite
- Electron

**Backend:**
- Go
- chi
- viper
- zap
- client-go

### Planned But Not Implemented Yet

- WebSocket layer (`gorilla/websocket`) for terminal, logs, and transfer progress
- Real interactive terminal sessions (`remotecommand` with `Stdin: true`, `TTY: true`)
- Live log streaming
- File upload / download (tar-based, `kubectl cp`-style)
- File editing (read via `cat`, save via exec + stdin)
- Frontend wiring to backend endpoints (frontend still reads mock data only)
- Monorepo shared packages (`packages/shared-types`, `packages/websocket-protocol`) referenced in the original plan
- Tauri vs. Electron decision for the production desktop shell

## Known Gaps / Things To Revisit

- **Credential handling in a packaged desktop context.** Right now the backend relies on credentials already present in the OS environment (kubeconfig certs, AWS CLI session/SSO cache for exec-plugin clusters). This works fine when running from a terminal during development. Once `kube-engine` is launched by the packaged Electron app (not a terminal), we need to verify it correctly inherits the user's PATH and environment (AWS CLI, SSO cache, etc.) — GUI-launched processes on Windows don't always inherit a shell's environment the way a terminal-launched process does. Not addressed yet; flagged as a packaging-time concern, not a current blocker.
- **`ls`-based file listing is best-effort text parsing**, not a structured API. It already handles two real-world formats (GNU coreutils with `--time-style=+%s`, and BusyBox's plain columnar output), but other minimal shells/images could still produce output that doesn't match either parser. Treat parsing failures as something to keep an eye on as more containers get tested.
- **Directory/file names are not sanitized or filtered** — e.g. a base64-looking directory name was observed in real testing that likely decodes to a Docker registry credential. The backend does not currently mask or flag anything sensitive in file/directory names; this lines up with the "secret masking" item already listed under Security Considerations in `apps/plan`, and is worth prioritizing before this tool is used against anything sensitive.
- **No authentication/authorization layer of our own.** The backend currently has whatever access the user's own kubeconfig/cloud credentials grant — there is no additional access control, read-only mode, or audit logging yet (also listed as future work in `apps/plan`).
- Real directory data model for the frontend (still using one flat mock file list) — unchanged from before, still pending.
- App metadata, icons, and installer polishing — unchanged from before, still pending.

## Windows Packaging Note

Unchanged from before: the repository can generate a runnable packaged Windows app folder via Electron Packager. `electron-builder` installer generation previously hit a Windows symlink privilege issue; not revisited this session.

## Recommended Next Steps

1. **Terminal (WebSocket).** Build `/ws/terminal` using `gorilla/websocket` + the same `remotecommand` exec mechanism already proven in `internal/k8s/exec.go`, this time with `Stdin: true` and `TTY: true` instead of buffering output. This is the largest remaining engineering risk called out in `apps/plan` ("Kubernetes Streaming Complexity").
2. **File read/write.** Add `GET /api/file-content` (via `cat`) and a save-back mechanism (exec with stdin, or a small tar-based write), enabling the Monaco editor integration planned for Phase 6.
3. **File upload/download.** Implement the tar-stream-based strategy described in `apps/plan` (`kubectl cp` equivalent).
4. **Frontend integration.** Replace `mockData.ts` consumption with real calls to the four existing REST endpoints, starting with the cluster/namespace/pod tree.
5. **Credential handling under Electron.** Once the backend is launched as a subprocess of the packaged app rather than from a terminal, verify and fix environment/PATH inheritance for kubeconfig and cloud CLI exec plugins.