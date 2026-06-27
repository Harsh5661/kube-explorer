import { useEffect, useMemo, useState } from "react";
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

const toolbarActions: { id: string; icon: IconName; label: string }[] = [
  { id: "upload", icon: "upload", label: "Upload" },
  { id: "download", icon: "download", label: "Download" },
  { id: "sliders", icon: "sliders", label: "Options" },
  { id: "refresh", icon: "refresh", label: "Refresh" },
];

const railItems: { id: SidebarTab; icon: IconName; label: string }[] = [
  { id: "clusters", icon: "cluster", label: "Clusters" },
  { id: "search", icon: "search", label: "Search" },
  { id: "network", icon: "globe", label: "Connections" },
  { id: "resources", icon: "boxes", label: "Resources" },
  { id: "settings", icon: "sliders", label: "Settings" },
];

function App() {
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("clusters");
  const [bottomTab, setBottomTab] = useState<BottomTab>("terminal");
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

  const normalizedQuery = query.trim().toLowerCase();
  const filteredFiles = useMemo(
    () =>
      normalizedQuery
        ? files.filter((entry) => entry.name.toLowerCase().includes(normalizedQuery))
        : files,
    [normalizedQuery],
  );

  const selectedExplorer = resolveExplorerSelection(selectedLocation);
  const activeConnection =
    connections.find((entry) => entry.name === selectedExplorer.cluster) ?? connections[0];

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

  return (
    <div className="shell">
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
            setTerminalLines((current) => [
              ...current,
              "",
              `Connected to ${resolveExplorerSelection(value).pod} (${value.container})`,
            ]);
          }}
        />

        <main className="content">
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
                          entry.kind === "file" ? "resource-icon--file" : "resource-icon--folder"
                        }`}
                        name={entry.kind === "folder" || entry.kind === "parent" ? "folder" : "file"}
                      />
                      <span>{entry.name}</span>
                    </div>
                    <span className="file-cell">{entry.kind === "folder" ? "-" : entry.size}</span>
                    <span className="file-cell">{formatModified(entry.modified)}</span>
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

          <section className="panel panel--terminal">
            <div className="panel__header">
              <div className="panel-tabs">
                <button
                  className={`panel-tab ${bottomTab === "terminal" ? "is-active" : ""}`}
                  type="button"
                  onClick={() => setBottomTab("terminal")}
                >
                  <Icon name="terminal" />
                  <span>Terminal</span>
                  <Icon name="x" className="panel-tab__close" />
                </button>
                <button
                  className={`panel-tab ${bottomTab === "logs" ? "is-active" : ""}`}
                  type="button"
                  onClick={() => setBottomTab("logs")}
                >
                  <Icon name="file" />
                  <span>Logs</span>
                  <Icon name="x" className="panel-tab__close" />
                </button>
                <button
                  className={`panel-tab ${bottomTab === "transfers" ? "is-active" : ""}`}
                  type="button"
                  onClick={() => setBottomTab("transfers")}
                >
                  <Icon name="transfer" />
                  <span>Transfers</span>
                  <span className="panel-tab__badge">{transfers.length}</span>
                  <Icon name="x" className="panel-tab__close" />
                </button>
                <button className="panel-tab panel-tab--add" type="button" title="New tab">
                  <Icon name="plus" />
                </button>
              </div>

              <div className="panel__actions">
                <button className="icon-button icon-button--quiet" type="button" title="Split">
                  <Icon name="collapse" />
                </button>
                <button className="icon-button icon-button--quiet" type="button" title="Maximize">
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
                      setTerminalLines([`root@${selectedExplorer.pod}:${currentPath}#`]);
                    }
                  }}
                >
                  <Icon name="x" />
                </button>
              </div>
            </div>

            <div className="panel__subheader">
              <span className="panel__prompt">{selectedExplorer.pod}:{currentPath}</span>
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
                      <button className="icon-button icon-button--quiet" type="button">
                        <Icon name="x" />
                      </button>
                    </div>

                    <div className="progress">
                      <div className="progress__bar" style={{ width: `${transfer.progress}%` }} />
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
                      <Icon name="folder" className="resource-icon resource-icon--folder" />
                      <span>{bookmark}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`terminal-view ${bottomTab === "logs" ? "is-log" : ""}`}>
                {(bottomTab === "terminal" ? terminalLines : logLines).map((line, index) => (
                  <div key={`${line}-${index}`} className="terminal-line">
                    {line}
                  </div>
                ))}
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
