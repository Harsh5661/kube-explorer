import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ClusterSidebar, type SidebarTab } from "./components/ClusterSidebar";
import { Icon, type IconName } from "./components/Icon";
import {
  appLocation,
  bookmarks,
  clusterTree,
  connections,
  files,
  logOutput,
  terminalOutput,
  transfers,
} from "./data/mockData";

type BottomTab = "terminal" | "logs" | "transfers";

const SIDEBAR_MIN_WIDTH = 180;
const SIDEBAR_MAX_WIDTH = 480;
const SIDEBAR_DEFAULT_WIDTH = 250;

const PANEL_MIN_HEIGHT = 120;
const PANEL_MAX_HEIGHT = 560;
const PANEL_DEFAULT_HEIGHT = 232;

const toolbarActions: { id: string; icon: IconName; label: string }[] = [
  { id: "upload", icon: "upload", label: "Upload" },
  { id: "download", icon: "download", label: "Download" },
  { id: "sliders", icon: "sliders", label: "Options" },
  { id: "refresh", icon: "refresh", label: "Refresh" },
];

const panelTabMeta: Record<BottomTab, { icon: IconName; label: string }> = {
  terminal: { icon: "terminal", label: "Terminal" },
  logs: { icon: "file", label: "Logs" },
  transfers: { icon: "transfer", label: "Transfers" },
};

const panelToolbarActions: { id: BottomTab; icon: IconName; label: string }[] =
  (Object.keys(panelTabMeta) as BottomTab[]).map((id) => ({
    id,
    ...panelTabMeta[id],
  }));

const railItems: { id: SidebarTab; icon: IconName; label: string }[] = [
  { id: "clusters", icon: "cluster", label: "Clusters" },
  { id: "search", icon: "search", label: "Search" },
  { id: "network", icon: "globe", label: "Connections" },
  { id: "resources", icon: "boxes", label: "Resources" },
  { id: "settings", icon: "sliders", label: "Settings" },
];

function App() {
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("clusters");
  const [openTabs, setOpenTabs] = useState<BottomTab[]>([
    "terminal",
    "logs",
    "transfers",
  ]);
  const [bottomTab, setBottomTab] = useState<BottomTab | null>("terminal");
  const [query, setQuery] = useState("");
  const [currentPath, setCurrentPath] = useState(appLocation.path);
  const [selectedFileId, setSelectedFileId] = useState("logs");
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
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const [panelHeight, setPanelHeight] = useState(PANEL_DEFAULT_HEIGHT);
  const [isResizingPanel, setIsResizingPanel] = useState(false);
  const [isPanelMinimized, setIsPanelMinimized] = useState(false);
  const [isPanelMaximized, setIsPanelMaximized] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleSidebarResizeStart = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setIsResizingSidebar(true);
  }, []);

  const handlePanelResizeStart = useCallback(
    (event: React.MouseEvent) => {
      if (isPanelMaximized || isPanelMinimized) {
        return;
      }

      event.preventDefault();
      setIsResizingPanel(true);
    },
    [isPanelMaximized, isPanelMinimized],
  );

  useEffect(() => {
    if (!isResizingSidebar) {
      return undefined;
    }

    function handleMouseMove(event: MouseEvent) {
      const workspaceLeft =
        workspaceRef.current?.getBoundingClientRect().left ?? 0;
      const nextWidth = event.clientX - workspaceLeft;
      const clampedWidth = Math.min(
        SIDEBAR_MAX_WIDTH,
        Math.max(SIDEBAR_MIN_WIDTH, nextWidth),
      );
      setSidebarWidth(clampedWidth);
    }

    function handleMouseUp() {
      setIsResizingSidebar(false);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizingSidebar]);

  useEffect(() => {
    if (!isResizingPanel) {
      return undefined;
    }

    function handleMouseMove(event: MouseEvent) {
      const contentBottom =
        contentRef.current?.getBoundingClientRect().bottom ?? 0;
      const nextHeight = contentBottom - event.clientY;
      const clampedHeight = Math.min(
        PANEL_MAX_HEIGHT,
        Math.max(PANEL_MIN_HEIGHT, nextHeight),
      );
      setPanelHeight(clampedHeight);
    }

    function handleMouseUp() {
      setIsResizingPanel(false);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizingPanel]);

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

  const selectedExplorer = resolveExplorerSelection(selectedLocation);
  const activeConnection =
    connections.find((entry) => entry.name === selectedExplorer.cluster) ??
    connections[0];

  useEffect(() => {
    if (logPaused) {
      return undefined;
    }

    const streamLines = [
      "[11:16:34] INFO queued settlement batch id=st_842",
      "[11:16:38] INFO /payments/refund completed in 18ms",
      "[11:16:41] WARN fraud-checker response exceeded 250ms",
      "[11:16:45] INFO cache refresh completed for dashboard",
    ];

    const timer = window.setInterval(() => {
      setLogLines((current) => [
        ...current.slice(-7),
        streamLines[streamIndex % streamLines.length],
      ]);
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
      return;
    }

    setSelectedFileId(fileId);

    if (entry.kind === "folder") {
      setCurrentPath(joinPath(currentPath, entry.name));
    }
  }

  function handleToolbarAction(actionId: string) {
    if (actionId === "refresh") {
      setTerminalLines((current) => [
        ...current,
        "",
        `root@${selectedExplorer.pod}:${currentPath}# ls -la`,
      ]);
    }
  }

  function openTab(tab: BottomTab) {
    setOpenTabs((current) =>
      current.includes(tab) ? current : [...current, tab],
    );
    setBottomTab(tab);
    setIsPanelMinimized(false);
  }

  function closeTab(tab: BottomTab) {
    setOpenTabs((current) => {
      const next = current.filter((item) => item !== tab);

      setBottomTab((activeTab) => {
        if (activeTab !== tab) {
          return activeTab;
        }

        return next.length > 0 ? next[next.length - 1] : null;
      });

      return next;
    });
  }

  function closeAllTabs() {
    setOpenTabs([]);
    setBottomTab(null);
    setIsPanelMinimized(false);
    setIsPanelMaximized(false);
  }

  function toggleMinimize() {
    setIsPanelMinimized((current) => !current);
    setIsPanelMaximized(false);
  }

  function toggleMaximize() {
    setIsPanelMaximized((current) => !current);
    setIsPanelMinimized(false);
  }

  return (
    <div className="shell">
      <div
        className={`workspace ${isResizingSidebar ? "is-resizing" : ""}`}
        ref={workspaceRef}
        style={{ gridTemplateColumns: `${sidebarWidth}px 4px minmax(0, 1fr)` }}
      >
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
            setTerminalLines((current) => [
              ...current,
              "",
              `Connected to ${resolveExplorerSelection(value).pod} (${value.container})`,
            ]);
          }}
        />

        <div
          className="workspace__resize-handle"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          onMouseDown={handleSidebarResizeStart}
        />

        <main
          className={`content ${isResizingPanel ? "is-resizing" : ""}`}
          ref={contentRef}
          style={{
            gridTemplateRows: isPanelMaximized
              ? "40px 0px 0px 1fr"
              : `40px minmax(0, 1fr) 4px ${isPanelMinimized ? 45 : panelHeight}px`,
          }}
        >
          <header className="content__topbar">
            <div className="pathbar">
              <span>{selectedExplorer.container}</span>
              <strong>{currentPath}</strong>
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

            <div className="toolbar">
              {toolbarActions.map((action) => (
                <button
                  key={action.id}
                  className="toolbar__action"
                  type="button"
                  title={action.label}
                  onClick={() => handleToolbarAction(action.id)}
                >
                  <Icon name={action.icon} />
                </button>
              ))}

              <span className="toolbar__divider" aria-hidden="true" />

              {panelToolbarActions.map((action) => (
                <button
                  key={action.id}
                  className={`toolbar__action ${bottomTab === action.id ? "is-active" : ""}`}
                  type="button"
                  title={
                    openTabs.includes(action.id)
                      ? `Show ${action.label}`
                      : `Open ${action.label}`
                  }
                  onClick={() => openTab(action.id)}
                >
                  <Icon name={action.icon} />
                </button>
              ))}
            </div>
          </header>

          <section className="file-table">
            <header className="file-table__header">
              <span>Name</span>
              <span>Size</span>
              <span>Modified</span>
            </header>

            <div className="file-table__body">
              {filteredFiles.length > 0 ? (
                filteredFiles.map((entry) => (
                  <button
                    key={entry.id}
                    className={`file-row ${selectedFileId === entry.id ? "is-selected" : ""} ${
                      entry.kind === "parent" ? "is-muted" : ""
                    }`}
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
                    <span className="file-cell">
                      {entry.kind === "folder" ? "-" : entry.size}
                    </span>
                    <span className="file-cell">
                      {formatModified(entry.modified)}
                    </span>
                  </button>
                ))
              ) : (
                <div className="file-table__empty">
                  <div className="file-table__empty-icon">
                    <Icon name="search" />
                  </div>
                  <h3>No files match "{query}"</h3>
                  <p>Clear the search to return to the container directory.</p>
                </div>
              )}
            </div>
          </section>

          <div
            className={`content__resize-handle ${
              isPanelMaximized || isPanelMinimized ? "is-disabled" : ""
            }`}
            role="separator"
            aria-orientation="horizontal"
            aria-label="Resize panel"
            onMouseDown={handlePanelResizeStart}
          />

          <section className="panel panel--terminal">
            <div className="panel__header">
              <div className="panel-tabs">
                {openTabs.map((tab) => {
                  const meta = panelTabMeta[tab];

                  return (
                    <button
                      key={tab}
                      className={`panel-tab ${bottomTab === tab ? "is-active" : ""}`}
                      type="button"
                      onClick={() => {
                        setBottomTab(tab);
                        setIsPanelMinimized(false);
                      }}
                    >
                      <Icon name={meta.icon} />
                      <span>{meta.label}</span>
                      {tab === "transfers" && (
                        <span className="panel-tab__badge">
                          {transfers.length}
                        </span>
                      )}
                      <span
                        className="panel-tab__close"
                        role="button"
                        tabIndex={0}
                        aria-label={`Close ${meta.label}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          closeTab(tab);
                        }}
                      >
                        <Icon name="x" />
                      </span>
                    </button>
                  );
                })}
              </div>

              {bottomTab && (
                <div className="panel__actions">
                  <button
                    className={`icon-button icon-button--quiet ${isPanelMinimized ? "is-active" : ""}`}
                    type="button"
                    title={isPanelMinimized ? "Restore panel" : "Minimize"}
                    onClick={toggleMinimize}
                  >
                    <Icon name="minimize" />
                  </button>
                  <button
                    className={`icon-button icon-button--quiet ${isPanelMaximized ? "is-active" : ""}`}
                    type="button"
                    title={isPanelMaximized ? "Restore panel" : "Maximize"}
                    onClick={toggleMaximize}
                  >
                    <Icon name="maximize" />
                  </button>
                  <button
                    className="icon-button icon-button--quiet"
                    type="button"
                    title={bottomTab === "logs" ? "Pause logs" : "Clear"}
                    onClick={() => {
                      if (bottomTab === "logs") {
                        setLogPaused((current) => !current);
                        return;
                      }

                      if (bottomTab === "terminal") {
                        setTerminalLines([
                          `root@${selectedExplorer.pod}:${currentPath}#`,
                        ]);
                      }
                    }}
                  >
                    <Icon name="x" />
                  </button>
                  <button
                    className="icon-button icon-button--quiet"
                    type="button"
                    title="Close panel"
                    onClick={closeAllTabs}
                  >
                    <Icon name="x" />
                  </button>
                </div>
              )}
            </div>

            {bottomTab && (
              <div
                className={`panel__body ${isPanelMinimized ? "is-minimized" : ""}`}
              >
                <div className="panel__subheader">
                  <span className="panel__prompt">
                    {selectedExplorer.pod}:{currentPath}
                  </span>
                  <span className="panel__badge">
                    <span className="status-dot status-dot--connected" />
                    connected
                  </span>
                </div>

                {bottomTab === "transfers" ? (
                  <div className="transfer-list">
                    {transfers.map((transfer) => (
                      <article key={transfer.id} className="transfer-card">
                        <div className="transfer-card__header">
                          <div className="transfer-card__title">
                            <Icon
                              name="file"
                              className="resource-icon resource-icon--file"
                            />
                            <div>
                              <h4>
                                {transfer.direction} {transfer.fileName}
                              </h4>
                              <p>
                                {transfer.source} -&gt; {transfer.target}
                              </p>
                            </div>
                          </div>
                          <button
                            className="icon-button icon-button--quiet"
                            type="button"
                          >
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
                    ))}

                    <div className="bookmark-list">
                      {bookmarks.map((bookmark) => (
                        <button
                          key={bookmark}
                          className="bookmark-row"
                          type="button"
                          onClick={() => setCurrentPath(bookmark)}
                        >
                          <Icon
                            name="folder"
                            className="resource-icon resource-icon--folder"
                          />
                          <span>{bookmark}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`terminal-view ${bottomTab === "logs" ? "is-log" : ""}`}
                  >
                    {(bottomTab === "terminal" ? terminalLines : logLines).map(
                      (line, index) => (
                        <div key={`${line}-${index}`} className="terminal-line">
                          {line}
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            )}

            {!bottomTab && (
              <div className="panel__empty">
                <p>All panels are closed.</p>
                <p className="panel__empty-hint">
                  Use the Terminal, Logs, or Transfers icons in the toolbar
                  above to reopen one.
                </p>
              </div>
            )}

            <footer className="content__status">
              <span>{selectedExplorer.namespace}</span>
              <span>{selectedExplorer.container}</span>
              <span>{activeConnection.user}</span>
            </footer>
          </section>
        </main>
      </div>
    </div>
  );
}

function resolveExplorerSelection(selection: {
  clusterId: string;
  namespaceId: string;
  podId: string;
  container: string;
}) {
  const cluster = clusterTree.find((entry) => entry.id === selection.clusterId);
  const namespace = cluster?.namespaces.find(
    (entry) => entry.id === selection.namespaceId,
  );
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

  const trimmed =
    path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;
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

function formatModified(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const month = date.toLocaleString("en-US", { month: "short" });
  const day = String(date.getDate()).padStart(2, " ");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${month} ${day} ${hours}:${minutes}`;
}

export default App;
