import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ClusterSidebar, type SidebarTab } from "./components/ClusterSidebar";
import { FileProperties } from "./components/FileProperties";
import { Icon, type IconName } from "./components/Icon";
import {
  PreviewCode,
  getPreviewFooterLabel,
  getPreviewLanguage,
} from "./components/PreviewCode";
import {
  appLocation,
  bookmarks,
  clusterTree,
  connections,
  files,
  logOutput,
  statusBar,
  terminalOutput,
  transfers,
} from "./data/mockData";

type BottomTab = "terminal" | "logs";
type UtilityTab = "transfers" | "bookmarks";
type PreviewTab = "preview" | "properties";
type DragState =
  | {
      type: "sidebar" | "preview" | "utility";
      startX: number;
      startSize: number;
    }
  | {
      type: "bottom";
      startY: number;
      startSize: number;
    };

const menuItems = ["File", "View", "Tools", "Help"];
const toolbarActions: { id: string; label: string; icon: IconName }[] = [
  { id: "up", label: "Up", icon: "arrow-up-left" },
  { id: "refresh", label: "Refresh", icon: "refresh" },
  { id: "folder", label: "New Folder", icon: "folder-plus" },
  { id: "upload", label: "Upload", icon: "upload" },
  { id: "download", label: "Download", icon: "download" },
  { id: "delete", label: "Delete", icon: "trash" },
  { id: "terminal", label: "Terminal", icon: "terminal" },
  { id: "more", label: "More", icon: "more" },
];

const railItems: { id: SidebarTab; icon: IconName; label: string }[] = [
  { id: "clusters", icon: "cluster", label: "Clusters" },
  { id: "search", icon: "search", label: "Search" },
  { id: "network", icon: "globe", label: "Connections" },
  { id: "resources", icon: "boxes", label: "Resources" },
  { id: "settings", icon: "sliders", label: "Settings" },
];

function App() {
  const desktopWindow = window.kubeExplorerDesktop?.window;
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("clusters");
  const [bottomTab, setBottomTab] = useState<BottomTab>("terminal");
  const [utilityTab, setUtilityTab] = useState<UtilityTab>("transfers");
  const [previewTab, setPreviewTab] = useState<PreviewTab>("preview");
  const [query, setQuery] = useState("");
  const [currentPath, setCurrentPath] = useState(appLocation.path);
  const [selectedFileId, setSelectedFileId] = useState("logs");
  const [previewFileId, setPreviewFileId] = useState("server-js");
  const [sidebarWidth, setSidebarWidth] = useState(330);
  const [previewWidth, setPreviewWidth] = useState(430);
  const [utilityWidth, setUtilityWidth] = useState(390);
  const [bottomHeight, setBottomHeight] = useState(292);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [isWindowMaximized, setIsWindowMaximized] = useState(false);
  const [logPaused, setLogPaused] = useState(false);
  const [terminalLines, setTerminalLines] = useState(terminalOutput);
  const [logLines, setLogLines] = useState(logOutput);
  const [streamIndex, setStreamIndex] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState({
    clusterId: "cluster-prod",
    namespaceId: "ns-payments",
    podId: "pod-api",
    container: appLocation.container,
  });

  const normalizedQuery = query.trim().toLowerCase();
  const filteredFiles = useMemo(
    () =>
      normalizedQuery
        ? files.filter((entry) =>
            entry.name.toLowerCase().includes(normalizedQuery),
          )
        : files,
    [normalizedQuery],
  );

  const selectedFile = files.find((entry) => entry.id === selectedFileId) ?? files[0];
  const previewFile = files.find((entry) => entry.id === previewFileId) ?? selectedFile;
  const previewLanguage = getPreviewLanguage(previewFile.name);
  const previewFooterLabel = getPreviewFooterLabel(previewLanguage);
  const selectedExplorer = resolveExplorerSelection(selectedLocation);
  const activeConnection =
    connections.find((entry) => entry.name === selectedExplorer.cluster) ?? connections[0];
  const shellStyle = {
    "--sidebar-width": `${sidebarWidth}px`,
    "--preview-width": `${previewWidth}px`,
    "--utility-width": `${utilityWidth}px`,
    "--bottom-height": `${bottomHeight}px`,
  } as CSSProperties;

  useEffect(() => {
    if (!dragState) {
      return undefined;
    }

    const currentDrag = dragState;

    function handlePointerMove(event: PointerEvent) {
      if (currentDrag.type === "sidebar") {
        setSidebarWidth(clamp(currentDrag.startSize + event.clientX - currentDrag.startX, 260, 420));
        return;
      }

      if (currentDrag.type === "preview") {
        setPreviewWidth(clamp(currentDrag.startSize - (event.clientX - currentDrag.startX), 320, 620));
        return;
      }

      if (currentDrag.type === "utility") {
        setUtilityWidth(clamp(currentDrag.startSize - (event.clientX - currentDrag.startX), 280, 520));
        return;
      }

      if (currentDrag.type === "bottom") {
        setBottomHeight(
          clamp(currentDrag.startSize - (event.clientY - currentDrag.startY), 180, 420),
        );
      }
    }

    function handlePointerUp() {
      setDragState(null);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragState]);

  useEffect(() => {
    if (!desktopWindow) {
      return undefined;
    }

    void desktopWindow.isMaximized().then(setIsWindowMaximized);
    return desktopWindow.onMaximizedChanged(setIsWindowMaximized);
  }, [desktopWindow]);

  useEffect(() => {
    if (logPaused) {
      return undefined;
    }

    const streamLines = [
      "[11:16:34] INFO Outbound settlement batch queued id=st_842",
      "[11:16:38] INFO /payments/refund completed in 18ms",
      "[11:16:41] WARN Slow dependency response from fraud-checker",
      "[11:16:45] INFO Cache refresh completed for merchant dashboard",
    ];

    const timer = window.setInterval(() => {
      setLogLines((current) => [...current.slice(-7), streamLines[streamIndex % streamLines.length]]);
      setStreamIndex((current) => current + 1);
    }, 2200);

    return () => window.clearInterval(timer);
  }, [logPaused, streamIndex]);

  function handleFileSelect(fileId: string) {
    const entry = files.find((item) => item.id === fileId);

    if (!entry) {
      return;
    }

    if (entry.kind === "parent") {
      setCurrentPath(getParentPath(currentPath));
      setPreviewTab("properties");
      return;
    }

    setSelectedFileId(fileId);
    setPreviewFileId(fileId);

    if (entry.kind === "folder") {
      setCurrentPath(joinPath(currentPath, entry.name));
      setPreviewTab("properties");
      return;
    }

    setPreviewTab(entry.kind === "file" ? "preview" : "properties");
  }

  function handleToolbarAction(actionId: string) {
    if (actionId === "up") {
      setCurrentPath(getParentPath(currentPath));
      return;
    }

    if (actionId === "terminal") {
      setBottomTab("terminal");
      setTerminalLines((current) => [...current, "", `root@${selectedExplorer.pod}:${currentPath}#`]);
    }
  }

  return (
    <div
      className={`shell ${dragState ? "is-resizing" : ""} ${
        desktopWindow ? "shell--desktop" : ""
      }`}
      style={shellStyle}
    >
      <div className="titlebar">
        <div className="titlebar__brand">
          <div className="brand__mark">
            <Icon name="cluster" />
          </div>
          <span>Kube Explorer</span>
        </div>
        <div className="titlebar__window">
          <button
            className="window-button"
            type="button"
            onClick={() => void desktopWindow?.minimize()}
          >
            <Icon name="minimize" />
          </button>
          <button
            className="window-button"
            type="button"
            onClick={async () => {
              const maximized = await desktopWindow?.toggleMaximize();
              if (typeof maximized === "boolean") {
                setIsWindowMaximized(maximized);
              }
            }}
          >
            <Icon name={isWindowMaximized ? "collapse" : "maximize"} />
          </button>
          <button
            className="window-button window-button--close"
            type="button"
            onClick={() => void desktopWindow?.close()}
          >
            <Icon name="x" />
          </button>
        </div>
      </div>

      <div className="menubar">
        {menuItems.map((item) => (
          <button key={item} className="menubar__item" type="button">
            {item}
          </button>
        ))}
      </div>

      <div className="workspace">
        <ClusterSidebar
          sidebarTab={sidebarTab}
          onSidebarTabChange={setSidebarTab}
          railItems={railItems}
          clusterTree={clusterTree}
          connections={connections}
          selectedClusterId={selectedLocation.clusterId}
          selectedNamespaceId={selectedLocation.namespaceId}
          selectedPodId={selectedLocation.podId}
          selectedContainer={selectedLocation.container}
          onSelectLocation={(value) => {
            setSelectedLocation(value);
            setCurrentPath(appLocation.path);
          }}
        />
        <div
          className="resize-handle resize-handle--vertical resize-handle--sidebar"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          onPointerDown={(event) => {
            event.preventDefault();
            setDragState({
              type: "sidebar",
              startX: event.clientX,
              startSize: sidebarWidth,
            });
          }}
        />

        <main className="content">
          <div className="content__topbar">
            <div className="breadcrumbs">
              {[
                selectedExplorer.cluster,
                selectedExplorer.namespace,
                selectedExplorer.pod,
                selectedExplorer.container,
                currentPath,
              ].map((segment, index, items) => (
                <span key={segment} className="breadcrumbs__item">
                  <span>{segment}</span>
                  {index < items.length - 1 && (
                    <span className="breadcrumbs__separator">&gt;</span>
                  )}
                </span>
              ))}
            </div>

            <label className="searchbox">
              <input
                type="search"
                placeholder={`Search in ${currentPath}`}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <Icon name="search" />
            </label>
          </div>

          <div className="toolbar">
            {toolbarActions.map((action) => (
              <button
                key={action.id}
                className="toolbar__action"
                type="button"
                onClick={() => handleToolbarAction(action.id)}
              >
                <Icon name={action.icon} />
                <span>{action.label}</span>
              </button>
            ))}
          </div>

          <div className="explorer">
            <section className="file-table">
              <header className="file-table__header">
                <span>Name</span>
                <span>Size</span>
                <span>Type</span>
                <span>Modified</span>
                <span>Permissions</span>
                <span>Owner</span>
              </header>

              <div className="file-table__body">
                {filteredFiles.length > 0 ? (
                  filteredFiles.map((entry) => (
                    <button
                      key={entry.id}
                      className={`file-row ${selectedFileId === entry.id ? "is-selected" : ""}`}
                      type="button"
                      onClick={() => handleFileSelect(entry.id)}
                    >
                    <div className="file-cell file-cell--name">
                      <Icon
                        className={`resource-icon ${
                          entry.kind === "file"
                            ? "resource-icon--file"
                            : "resource-icon--folder"
                        }`}
                        name={
                          entry.kind === "folder" || entry.kind === "parent"
                            ? "folder"
                              : "file"
                          }
                        />
                        <span>{entry.name}</span>
                      </div>
                      <span className="file-cell">{entry.size}</span>
                      <span className="file-cell">{entry.type}</span>
                      <span className="file-cell">{entry.modified}</span>
                      <span className="file-cell">{entry.permissions}</span>
                      <span className="file-cell">{entry.owner}</span>
                    </button>
                  ))
                ) : (
                  <div className="file-table__empty">
                    <div className="file-table__empty-icon">
                      <Icon name="search" />
                    </div>
                    <h3>No files match "{query}"</h3>
                    <p>Try a broader search or clear the filter to see the full container directory.</p>
                  </div>
                )}
              </div>
            </section>
            <div
              className="resize-handle resize-handle--vertical"
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize preview pane"
              onPointerDown={(event) => {
                event.preventDefault();
                setDragState({
                  type: "preview",
                  startX: event.clientX,
                  startSize: previewWidth,
                });
              }}
            />

            <aside className="preview">
              <div className="preview__tabs">
                <button
                  className={`preview__tab ${previewTab === "preview" ? "preview__tab--active" : ""}`}
                  type="button"
                  onClick={() => setPreviewTab("preview")}
                >
                  Preview
                </button>
                <button
                  className={`preview__tab ${previewTab === "properties" ? "preview__tab--active" : ""}`}
                  type="button"
                  onClick={() => setPreviewTab("properties")}
                >
                  Properties
                </button>
              </div>

              <div className="preview__content">
                <div className="preview__meta">
                  <span className="preview__chip">{previewFile.name}</span>
                  <span className="preview__chip preview__chip--muted">
                    {previewFile.type || "Folder"}
                  </span>
                  <span className="preview__chip preview__chip--muted">
                    {currentPath}
                  </span>
                </div>
                {previewTab === "preview" ? (
                  <PreviewCode
                    fileName={previewFile.name}
                    language={previewLanguage}
                    source={previewFile.preview}
                  />
                ) : (
                  <FileProperties
                    entry={previewFile}
                    currentPath={currentPath}
                    context={selectedExplorer}
                  />
                )}
                <div className="preview__footer">
                  <span>Line 1, Column 1</span>
                  <span>UTF-8</span>
                  <span>{previewTab === "preview" ? previewFooterLabel : "Metadata"}</span>
                </div>
              </div>
            </aside>
          </div>
          <div
            className="resize-handle resize-handle--horizontal"
            role="separator"
            aria-orientation="horizontal"
            aria-label="Resize bottom panel"
            onPointerDown={(event) => {
              event.preventDefault();
              setDragState({
                type: "bottom",
                startY: event.clientY,
                startSize: bottomHeight,
              });
            }}
          />

          <div className="panels">
            <section className="panel panel--terminal">
              <div className="panel__header">
                <div className="panel-tabs">
                  <button
                    className={`panel-tab ${bottomTab === "terminal" ? "is-active" : ""}`}
                    type="button"
                    onClick={() => setBottomTab("terminal")}
                  >
                    Terminal
                  </button>
                  <button
                    className={`panel-tab ${bottomTab === "logs" ? "is-active" : ""}`}
                    type="button"
                    onClick={() => setBottomTab("logs")}
                  >
                    Logs
                  </button>
                </div>

                <div className="panel__actions">
                  <button
                    className="icon-button"
                    type="button"
                    title={bottomTab === "logs" ? (logPaused ? "Resume logs" : "Pause logs") : "New prompt"}
                    onClick={() => {
                      if (bottomTab === "logs") {
                        setLogPaused((current) => !current);
                        return;
                      }

                      setTerminalLines((current) => [
                        ...current,
                        "",
                        `root@${selectedExplorer.pod}:${currentPath}# echo "new session"`,
                        "new session",
                        `root@${selectedExplorer.pod}:${currentPath}#`,
                      ]);
                    }}
                  >
                    <Icon name="plus" />
                  </button>
                  <button
                    className="icon-button"
                    type="button"
                    title={bottomTab === "logs" ? "Clear logs" : "Clear terminal"}
                    onClick={() => {
                      if (bottomTab === "logs") {
                        setLogLines([]);
                        return;
                      }

                      setTerminalLines([`root@${selectedExplorer.pod}:${currentPath}#`]);
                    }}
                  >
                    <Icon name="collapse" />
                  </button>
                  <button
                    className="icon-button"
                    type="button"
                    title="Copy visible output"
                    onClick={() => {
                      const output = (bottomTab === "terminal" ? terminalLines : logLines).join("\n");
                      void navigator.clipboard?.writeText(output);
                    }}
                  >
                    <Icon name="copy" />
                  </button>
                  <button
                    className="icon-button"
                    type="button"
                    title={bottomTab === "logs" ? "Reset stream" : "Reconnect terminal"}
                    onClick={() => {
                      if (bottomTab === "logs") {
                        setLogLines(logOutput);
                        setLogPaused(false);
                        return;
                      }

                      setTerminalLines(terminalOutput);
                    }}
                  >
                    <Icon name="x" />
                  </button>
                </div>
              </div>

              <div className="panel__subheader">
                <span className="panel__badge">
                  {bottomTab === "logs" ? (logPaused ? "Paused" : "Streaming") : "Connected"}
                </span>
                <span className="panel__hint">
                  {bottomTab === "logs"
                    ? "Mock log stream updating live"
                    : `Interactive shell attached to ${selectedExplorer.container}`}
                </span>
              </div>

              <div className={`terminal-view ${bottomTab === "logs" ? "is-log" : ""}`}>
                {(bottomTab === "terminal" ? terminalLines : logLines).length > 0 ? (
                  (bottomTab === "terminal" ? terminalLines : logLines).map(
                    (line, index) => (
                      <div key={`${line}-${index}`} className="terminal-line">
                        {line}
                      </div>
                    ),
                  )
                ) : (
                  <div className="terminal-empty">
                    <div className="terminal-empty__title">
                      {bottomTab === "logs" ? "No log lines visible" : "Terminal cleared"}
                    </div>
                    <div className="terminal-empty__hint">
                      {bottomTab === "logs"
                        ? "Resume or reset the stream to populate this panel."
                        : "Create a new prompt from the action bar above."}
                    </div>
                  </div>
                )}
              </div>
            </section>
            <div
              className="resize-handle resize-handle--vertical"
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize utility panel"
              onPointerDown={(event) => {
                event.preventDefault();
                setDragState({
                  type: "utility",
                  startX: event.clientX,
                  startSize: utilityWidth,
                });
              }}
            />

            <section className="panel panel--utility">
              <div className="panel__header">
                <div className="panel-tabs">
                  <button
                    className={`panel-tab ${utilityTab === "transfers" ? "is-active" : ""}`}
                    type="button"
                    onClick={() => setUtilityTab("transfers")}
                  >
                    Transfers
                  </button>
                  <button
                    className={`panel-tab ${utilityTab === "bookmarks" ? "is-active" : ""}`}
                    type="button"
                    onClick={() => setUtilityTab("bookmarks")}
                  >
                    Bookmarks
                  </button>
                </div>
              </div>

              <div className="utility-content">
                {utilityTab === "transfers" ? (
                  transfers.map((transfer) => (
                    <article key={transfer.id} className="transfer-card">
                      <div className="transfer-card__header">
                        <div className="transfer-card__title">
                          <Icon name="file" className="resource-icon resource-icon--file" />
                          <div>
                            <h4>
                              {transfer.direction} {transfer.fileName}
                            </h4>
                            <p>
                              {transfer.source} -&gt; {transfer.target}
                            </p>
                          </div>
                        </div>
                        <button className="icon-button" type="button">
                          <Icon name="x" />
                        </button>
                      </div>

                      <div className="progress">
                        <div
                          className="progress__bar"
                          style={{ width: `${transfer.progress}%` }}
                        />
                      </div>

                      <div className="transfer-card__footer">
                        <span>{transfer.transferred}</span>
                        <span>{transfer.progress}%</span>
                        <span>{transfer.speed}</span>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="bookmark-list">
                    {bookmarks.map((bookmark) => (
                      <button
                        key={bookmark}
                        className="bookmark-row"
                        type="button"
                        onClick={() => setCurrentPath(bookmark)}
                      >
                        <Icon name="folder" className="resource-icon resource-icon--folder" />
                        <span>{bookmark}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>

      <footer className="statusbar">
        <div className="statusbar__section">
          <span className="status-dot status-dot--connected" />
          <span>Connected</span>
        </div>
        <div className="statusbar__section">
          <span>Namespace: {selectedExplorer.namespace}</span>
          <span>Pod: {selectedExplorer.pod}</span>
          <span>Container: {selectedExplorer.container}</span>
          <span>User: {activeConnection.user}</span>
        </div>
        <div className="statusbar__section">
          <span>{statusBar.version}</span>
        </div>
      </footer>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function resolveExplorerSelection(selection: {
  clusterId: string;
  namespaceId: string;
  podId: string;
  container: string;
}) {
  const cluster = clusterTree.find((entry) => entry.id === selection.clusterId);
  const namespace = cluster?.namespaces.find((entry) => entry.id === selection.namespaceId);
  const pod = namespace?.pods.find((entry) => entry.id === selection.podId);

  return {
    cluster: cluster?.name ?? appLocation.cluster,
    namespace: namespace?.name ?? appLocation.namespace,
    pod: pod?.name ?? appLocation.pod,
    container: selection.container,
  };
}

function getParentPath(path: string) {
  if (path === "/") {
    return "/";
  }

  const trimmed = path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;
  const segments = trimmed.split("/").filter(Boolean);

  if (segments.length <= 1) {
    return "/";
  }

  return `/${segments.slice(0, -1).join("/")}`;
}

function joinPath(basePath: string, segment: string) {
  if (basePath === "/") {
    return `/${segment}`;
  }

  return `${basePath.replace(/\/$/, "")}/${segment}`;
}

export default App;
