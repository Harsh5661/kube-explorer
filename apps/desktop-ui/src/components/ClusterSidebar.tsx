import { useState, type Dispatch, type SetStateAction } from "react";
import type { ClusterTree, ConnectionEntry } from "../data/mockData";
import { Icon, type IconName } from "./Icon";

export type SidebarTab = "clusters" | "search" | "network" | "resources" | "settings";

export function ClusterSidebar({
  sidebarTab,
  onSidebarTabChange,
  railItems,
  clusterTree,
  connections,
  selectedClusterId,
  selectedNamespaceId,
  selectedPodId,
  selectedContainer,
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
  const [expandedClusters, setExpandedClusters] = useState<Record<string, boolean>>({
    "cluster-prod": true,
  });
  const [expandedNamespaces, setExpandedNamespaces] = useState<Record<string, boolean>>({
    "ns-payments": true,
  });
  const [expandedPods, setExpandedPods] = useState<Record<string, boolean>>({
    "pod-api": true,
  });

  const activeTab = railItems.find((item) => item.id === sidebarTab);

  function toggleExpanded(
    setter: Dispatch<SetStateAction<Record<string, boolean>>>,
    id: string,
  ) {
    setter((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  return (
    <>
      <aside className="rail">
        <div className="rail__group">
          {railItems.map((item) => (
            <button
              key={item.id}
              className={`rail__button ${sidebarTab === item.id ? "is-active" : ""}`}
              type="button"
              title={item.label}
              onClick={() => onSidebarTabChange(item.id)}
            >
              <Icon name={item.icon} />
            </button>
          ))}
        </div>

        <div className="rail__group rail__group--bottom">
          <button className="rail__button" type="button" title="Preferences">
            <Icon name="sliders" />
          </button>
          <button className="rail__button" type="button" title="Settings">
            <Icon name="gear" />
          </button>
        </div>
      </aside>

      <section className="sidebar">
        <div className="sidebar__header">
          <span>{activeTab?.label ?? "Explorer"}</span>
          <div className="sidebar__actions">
            <button className="icon-button" type="button">
              <Icon name="refresh" />
            </button>
            <button className="icon-button" type="button">
              <Icon name="plus" />
            </button>
          </div>
        </div>

        <div className="sidebar__tree">
          {sidebarTab === "clusters" ? (
            clusterTree.map((cluster) => {
              const clusterOpen = expandedClusters[cluster.id] ?? false;
              const namespacesOpen = clusterOpen && cluster.namespaces.length > 0;

              return (
                <div key={cluster.id} className="tree-block">
                  <button
                    className={`tree-row tree-row--cluster ${
                      selectedClusterId === cluster.id ? "tree-row--active" : ""
                    }`}
                    type="button"
                    onClick={() => toggleExpanded(setExpandedClusters, cluster.id)}
                  >
                    <Icon
                      name={
                        cluster.namespaces.length > 0 && clusterOpen
                          ? "chevron-down"
                          : "chevron-right"
                      }
                    />
                    <span className={`status-dot status-dot--${cluster.status}`} />
                    <span>{cluster.name}</span>
                  </button>

                  {namespacesOpen && (
                    <div className="tree-indent">
                      <div className="tree-row tree-row--section">
                        <Icon name="chevron-down" />
                        <Icon name="folder" />
                        <span>Namespaces</span>
                      </div>

                      <div className="tree-indent">
                        {cluster.namespaces.map((namespace) => {
                          const namespaceOpen = expandedNamespaces[namespace.id] ?? false;
                          const isNamespaceActive = selectedNamespaceId === namespace.id;

                          return (
                            <div key={namespace.id}>
                              <button
                                className={`tree-row ${isNamespaceActive ? "tree-row--active" : ""}`}
                                type="button"
                                onClick={() => {
                                  if (namespace.pods.length > 0) {
                                    toggleExpanded(setExpandedNamespaces, namespace.id);
                                  }
                                }}
                              >
                                <Icon
                                  name={
                                    namespace.pods.length > 0 && namespaceOpen
                                      ? "chevron-down"
                                      : "chevron-right"
                                  }
                                />
                                <Icon name="folder" />
                                <span>{namespace.name}</span>
                              </button>

                              {namespaceOpen && namespace.pods.length > 0 && (
                                <div className="tree-indent">
                                  <div className="tree-row tree-row--section">
                                    <Icon name="chevron-down" />
                                    <Icon name="folder" />
                                    <span>Pods</span>
                                  </div>

                                  <div className="tree-indent">
                                    {namespace.pods.map((pod) => {
                                      const podOpen = expandedPods[pod.id] ?? false;
                                      const isPodActive = selectedPodId === pod.id;

                                      return (
                                        <div key={pod.id}>
                                          <button
                                            className={`tree-row ${isPodActive ? "tree-row--active" : ""}`}
                                            type="button"
                                            onClick={() => {
                                              toggleExpanded(setExpandedPods, pod.id);
                                              onSelectLocation({
                                                clusterId: cluster.id,
                                                namespaceId: namespace.id,
                                                podId: pod.id,
                                                container: pod.containers[0],
                                              });
                                            }}
                                          >
                                            <Icon
                                              name={
                                                pod.containers.length > 0 && podOpen
                                                  ? "chevron-down"
                                                  : "chevron-right"
                                              }
                                            />
                                            <span className="status-dot status-dot--connected" />
                                            <span>{pod.name}</span>
                                          </button>

                                          {podOpen && pod.containers.length > 0 && (
                                            <div className="tree-indent">
                                              {pod.containers.map((container) => (
                                                <button
                                                  key={container}
                                                  className={`tree-row ${
                                                    isPodActive && selectedContainer === container
                                                      ? "tree-row--active"
                                                      : ""
                                                  }`}
                                                  type="button"
                                                  onClick={() =>
                                                    onSelectLocation({
                                                      clusterId: cluster.id,
                                                      namespaceId: namespace.id,
                                                      podId: pod.id,
                                                      container,
                                                    })
                                                  }
                                                >
                                                  <Icon name="terminal" />
                                                  <span>{container}</span>
                                                </button>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="sidebar__empty">
              <h3>{activeTab?.label}</h3>
              <p>
                This panel is ready for the next feature pass. We can wire search,
                resource browsing, or settings into the same shell now.
              </p>
            </div>
          )}
        </div>

        <div className="connections">
          <div className="sidebar__header sidebar__header--secondary">
            <span>Connections</span>
          </div>

          <div className="connections__list">
            {connections.map((connection) => (
              <article key={connection.id} className="connection-card">
                <h4>{connection.name}</h4>
                <p>{connection.account}</p>
                <p>User: {connection.user}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
