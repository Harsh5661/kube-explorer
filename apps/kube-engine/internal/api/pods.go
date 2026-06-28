package api

import (
	"encoding/json"
	"net/http"

	"go.uber.org/zap"

	"github.com/Harsh5661/kube-explorer/kube-engine/internal/k8s"
)

type PodResponse struct {
	Name       string   `json:"name"`
	Namespace  string   `json:"namespace"`
	Status     string   `json:"status"`
	Containers []string `json:"containers"`
}

func ListPodsHandler(kubeconfigPath string, log *zap.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		clusterID := r.URL.Query().Get("clusterId")
		namespace := r.URL.Query().Get("namespace")

		if clusterID == "" {
			http.Error(w, `{"error":"clusterId query param is required"}`, http.StatusBadRequest)
			return
		}
		if namespace == "" {
			http.Error(w, `{"error":"namespace query param is required"}`, http.StatusBadRequest)
			return
		}

		pods, err := k8s.ListPods(r.Context(), kubeconfigPath, clusterID, namespace)
		if err != nil {
			log.Error("failed to list pods",
				zap.String("clusterId", clusterID),
				zap.String("namespace", namespace),
				zap.Error(err),
			)
			http.Error(w, `{"error":"failed to list pods"}`, http.StatusInternalServerError)
			return
		}

		response := make([]PodResponse, 0, len(pods))
		for _, p := range pods {
			response = append(response, PodResponse{
				Name:       p.Name,
				Namespace:  p.Namespace,
				Status:     p.Status,
				Containers: p.Containers,
			})
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(response); err != nil {
			log.Error("failed to encode response", zap.Error(err))
		}
	}
}