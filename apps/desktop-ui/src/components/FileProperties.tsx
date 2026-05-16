import type { FileEntry } from "../data/mockData";
import { Icon } from "./Icon";

export function FileProperties({
  entry,
  currentPath,
  context,
}: {
  entry: FileEntry;
  currentPath: string;
  context: {
    cluster: string;
    namespace: string;
    pod: string;
    container: string;
  };
}) {
  const targetPath =
    entry.kind === "parent"
      ? currentPath
      : currentPath === "/"
        ? `/${entry.name}`
        : `${currentPath.replace(/\/$/, "")}/${entry.name}`;

  const details = [
    { label: "Type", value: entry.type || "Folder" },
    { label: "Path", value: targetPath },
    { label: "Modified", value: entry.modified || "Unknown" },
    { label: "Permissions", value: entry.permissions || "Inherited" },
    { label: "Owner", value: entry.owner || "root" },
    { label: "Size", value: entry.size || "Directory" },
  ];

  return (
    <div className="properties-pane">
      <div className="properties-pane__hero">
        <div className="properties-pane__icon">
          <Icon
            name={entry.kind === "file" ? "file" : "folder"}
            className={`resource-icon ${
              entry.kind === "file"
                ? "resource-icon--file"
                : "resource-icon--folder"
            }`}
          />
        </div>
        <div>
          <h3>{entry.name}</h3>
          <p>{entry.kind === "file" ? "Ready for preview and edit" : "Directory selected in explorer"}</p>
        </div>
      </div>

      <section className="properties-section">
        <h4>Details</h4>
        <div className="properties-grid">
          {details.map((detail) => (
            <div key={detail.label} className="properties-grid__row">
              <span>{detail.label}</span>
              <strong>{detail.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="properties-section">
        <h4>Runtime Context</h4>
        <div className="properties-grid">
          <div className="properties-grid__row">
            <span>Cluster</span>
            <strong>{context.cluster}</strong>
          </div>
          <div className="properties-grid__row">
            <span>Namespace</span>
            <strong>{context.namespace}</strong>
          </div>
          <div className="properties-grid__row">
            <span>Pod</span>
            <strong>{context.pod}</strong>
          </div>
          <div className="properties-grid__row">
            <span>Container</span>
            <strong>{context.container}</strong>
          </div>
        </div>
      </section>

      <section className="properties-section">
        <h4>Quick Actions</h4>
        <div className="properties-actions">
          <button className="properties-action" type="button">
            <Icon name="download" />
            <span>Download</span>
          </button>
          <button className="properties-action" type="button">
            <Icon name="terminal" />
            <span>Open Terminal Here</span>
          </button>
          <button className="properties-action" type="button">
            <Icon name="copy" />
            <span>Copy Path</span>
          </button>
        </div>
      </section>
    </div>
  );
}
