import { useState } from "react";
import type { ClusterTree, ConnectionEntry } from "../data/mockData";
import { Icon, type IconName } from "./Icon";

export type SidebarTab =
  | "clusters"
  | "search"
  | "network"
  | "resources"
  | "settings";

export function ClusterSidebar({
  sidebarTab,
  onSidebarTabChange,
  railItems,
  clusterTree,
  connections,
  selectedClusterId,
  selectedNamespaceId,
  selectedPodId,
  onSelectLocation,
}: {
  sidebarTab: SidebarTab;
  onSidebarTabChange: (tab: SidebarTab) => void;
  railItems: { id: SidebarTab; icon: IconName; label: string }[];
  clusterTree: ClusterTree[];
  connections: ConnectionEntry[];
  selectedClusterId: string;
  selectedNamespaceId: string;
  selectedPodId: string;
  selectedContainer: string;
  onSelectLocation: (value: {
    clusterId: string;
    namespaceId: string;
    podId: string;
    container: string;
  }) => void;
}) {
  const [expandedClusters, setExpandedClusters] = useState<
    Record<string, boolean>
  >({
    "cluster-prod": true,
  });
  const [expandedNamespaces, setExpandedNamespaces] = useState<
    Record<string, boolean>
  >({
    "ns-payments": true,
  });
  const [podsOpen, setPodsOpen] = useState(true);

  const primaryCluster = clusterTree[0];
  const secondaryCluster = clusterTree[1];
  const activeConnection =
    connections.find(
      (connection) => connection.name === primaryCluster?.name,
    ) ?? connections[0];

  function toggleCluster(id: string) {
    setExpandedClusters((current) => ({ ...current, [id]: !current[id] }));
  }

  function toggleNamespace(id: string) {
    setExpandedNamespaces((current) => ({ ...current, [id]: !current[id] }));
  }

  return (
    <aside className="sidebar">
      <header className="sidebar__brand">
        <div className="sidebar__product">
          <Icon name="cluster" className="sidebar__brand-icon" />
          <span>Kube Explorer</span>
        </div>
        <button
          className="icon-button icon-button--quiet"
          type="button"
          title="More actions"
        >
          <Icon name="more" />
        </button>
      </header>

      <div className="sidebar__section">
        <button className="sidebar__section-button" type="button">
          <Icon name="chevron-down" />
          <span>Clusters</span>
        </button>
      </div>

      <div className="sidebar__tree">
        <div className="tree-block">
          <div className="tree-row tree-row--provider">
            <Icon name="chevron-down" className="tree-row__chevron" />
            <Icon name="cloud" className="tree-row__provider-icon" />
            <span className="tree-row__label">EKS</span>
          </div>

          {primaryCluster && (
            <div className="tree-children">
              <button
                className={`tree-row tree-row--cluster ${
                  selectedClusterId === primaryCluster.id
                    ? "tree-row--current"
                    : ""
                }`}
                type="button"
                aria-expanded={expandedClusters[primaryCluster.id] ?? false}
                onClick={() => toggleCluster(primaryCluster.id)}
              >
                <Icon
                  name={
                    expandedClusters[primaryCluster.id]
                      ? "chevron-down"
                      : "chevron-right"
                  }
                  className="tree-row__chevron"
                />
                <Icon name="cluster" className="tree-row__kube-icon" />
                <span className="tree-row__label">{primaryCluster.name}</span>
                <span className="tree-status tree-status--green" />
              </button>

              {expandedClusters[primaryCluster.id] && (
                <div className="tree-children">
                  {primaryCluster.namespaces.map((namespace) => {
                    const namespaceOpen =
                      expandedNamespaces[namespace.id] ?? false;
                    const isActiveNamespace =
                      selectedNamespaceId === namespace.id;

                    return (
                      <div key={namespace.id}>
                        <button
                          className={`tree-row tree-row--namespace ${
                            isActiveNamespace ? "tree-row--current" : ""
                          }`}
                          type="button"
                          aria-expanded={namespaceOpen}
                          onClick={() => toggleNamespace(namespace.id)}
                        >
                          <Icon
                            name={
                              namespaceOpen ? "chevron-down" : "chevron-right"
                            }
                            className="tree-row__chevron"
                          />
                          <Icon
                            name="namespace"
                            className="tree-row__namespace-icon"
                          />
                          <span className="tree-row__label">
                            {namespace.name}
                          </span>
                          {isActiveNamespace && (
                            <span className="tree-badge">ns</span>
                          )}
                        </button>

                        {namespaceOpen && (
                          <div className="tree-children">
                            <button
                              className="tree-row tree-row--resource"
                              type="button"
                              aria-expanded={podsOpen}
                              onClick={() => setPodsOpen((current) => !current)}
                            >
                              <Icon
                                name={
                                  podsOpen ? "chevron-down" : "chevron-right"
                                }
                                className="tree-row__chevron"
                              />
                              <Icon
                                name="boxes"
                                className="tree-row__resource-icon"
                              />
                              <span className="tree-row__label">Pods</span>
                            </button>

                            {podsOpen && namespace.pods.length > 0 && (
                              <div className="tree-children tree-children--pods">
                                {namespace.pods.map((pod) => {
                                  const isSelected = selectedPodId === pod.id;
                                  const isWarning = pod.name.includes("redis");

                                  return (
                                    <button
                                      key={pod.id}
                                      className={`tree-row tree-row--pod ${
                                        isSelected ? "tree-row--active" : ""
                                      }`}
                                      type="button"
                                      onClick={() =>
                                        onSelectLocation({
                                          clusterId: primaryCluster.id,
                                          namespaceId: namespace.id,
                                          podId: pod.id,
                                          container: pod.containers[0],
                                        })
                                      }
                                    >
                                      <span
                                        className={`tree-status ${
                                          isWarning
                                            ? "tree-status--amber"
                                            : "tree-status--green"
                                        }`}
                                      />
                                      <span className="tree-row__label">
                                        {pod.name}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {secondaryCluster && (
            <div className="tree-children">
              <button
                className="tree-row tree-row--cluster tree-row--muted"
                type="button"
                aria-expanded={expandedClusters[secondaryCluster.id] ?? false}
                onClick={() => toggleCluster(secondaryCluster.id)}
              >
                <Icon name="chevron-right" className="tree-row__chevron" />
                <Icon name="cluster" className="tree-row__kube-icon" />
                <span className="tree-row__label">{secondaryCluster.name}</span>
                <span className="tree-status tree-status--amber" />
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className="sidebar__footer">
        <div className="sidebar__transfer">
          <Icon name="transfer" />
          <span>2 transfers</span>
        </div>
        <span className="sidebar__mode">active</span>
      </footer>

      <div className="sidebar__tabs" aria-hidden="true">
        {railItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar__tab ${sidebarTab === item.id ? "is-active" : ""}`}
            type="button"
            title={item.label}
            onClick={() => onSidebarTabChange(item.id)}
          >
            <Icon name={item.icon} />
          </button>
        ))}
      </div>
      <span className="sidebar__connection">{activeConnection?.user}</span>
    </aside>
  );
}
