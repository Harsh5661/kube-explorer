package api

import (
	"encoding/json"
	"net/http"

	"go.uber.org/zap"

	"github.com/Harsh5661/kube-explorer/kube-engine/internal/k8s"
)

type NamespaceResponse struct {
	Name   string `json:"name"`
	Status string `json:"status"`
}

func ListNamespacesHandler(kubeconfigPath string, log *zap.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		clusterID := r.URL.Query().Get("clusterId")
		if clusterID == "" {
			http.Error(w, `{"error":"clusterId query param is required"}`, http.StatusBadRequest)
			return
		}

		namespaces, err := k8s.ListNamespaces(r.Context(), kubeconfigPath, clusterID)
		if err != nil {
			log.Error("failed to list namespaces", zap.String("clusterId", clusterID), zap.Error(err))
			http.Error(w, `{"error":"failed to list namespaces"}`, http.StatusInternalServerError)
			return
		}

		response := make([]NamespaceResponse, 0, len(namespaces))
		for _, ns := range namespaces {
			response = append(response, NamespaceResponse{
				Name:   ns.Name,
				Status: ns.Status,
			})
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(response); err != nil {
			log.Error("failed to encode response", zap.Error(err))
		}
	}
}