package api

import (
	"encoding/json"
	"net/http"

	"go.uber.org/zap"

	"github.com/Harsh5661/kube-explorer/kube-engine/internal/k8s"
)

type ClusterResponse struct {
	ID        string `json:"id"`        // context name — use this to query other endpoints
	ClusterID string `json:"clusterId"` // raw cluster name from kubeconfig (metadata only)
	Name      string `json:"name"`
	Server    string `json:"server"`
	IsCurrent bool   `json:"isCurrent"`
}

func ListClustersHandler(kubeconfigPath string, log *zap.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		contexts, err := k8s.ListContexts(kubeconfigPath)
		if err != nil {
			log.Error("failed to list contexts", zap.Error(err))
			http.Error(w, `{"error":"failed to read kubeconfig"}`, http.StatusInternalServerError)
			return
		}

		response := make([]ClusterResponse, 0, len(contexts))
		for _, c := range contexts {
			response = append(response, ClusterResponse{
				ID:        c.Name,
				ClusterID: c.ClusterID,
				Name:      c.Name,
				Server:    c.Server,
				IsCurrent: c.IsCurrent,
			})
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(response); err != nil {
			log.Error("failed to encode response", zap.Error(err))
		}
	}
}