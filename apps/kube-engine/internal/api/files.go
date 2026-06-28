package api

import (
	"encoding/json"
	"net/http"

	"go.uber.org/zap"

	"github.com/Harsh5661/kube-explorer/kube-engine/internal/k8s"
)

type FileResponse struct {
	Name        string `json:"name"`
	Kind        string `json:"kind"`
	Size        int64  `json:"size"`
	Permissions string `json:"permissions"`
	Owner       string `json:"owner"`
	ModifiedAt  string `json:"modifiedAt"`
}

func ListFilesHandler(kubeconfigPath string, log *zap.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query()
		clusterID := q.Get("clusterId")
		namespace := q.Get("namespace")
		pod := q.Get("pod")
		container := q.Get("container")
		path := q.Get("path")

		if clusterID == "" || namespace == "" || pod == "" || container == "" || path == "" {
			http.Error(w, `{"error":"clusterId, namespace, pod, container, and path are all required"}`, http.StatusBadRequest)
			return
		}

		files, err := k8s.ListFiles(r.Context(), kubeconfigPath, clusterID, namespace, pod, container, path)
		if err != nil {
			log.Error("failed to list files",
				zap.String("clusterId", clusterID),
				zap.String("pod", pod),
				zap.String("path", path),
				zap.Error(err),
			)
			http.Error(w, `{"error":"failed to list files"}`, http.StatusInternalServerError)
			return
		}

		response := make([]FileResponse, 0, len(files))
		for _, f := range files {
			response = append(response, FileResponse{
				Name:        f.Name,
				Kind:        f.Kind,
				Size:        f.Size,
				Permissions: f.Permissions,
				Owner:       f.Owner,
				ModifiedAt:  f.ModifiedAtRaw,
			})
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(response); err != nil {
			log.Error("failed to encode response", zap.Error(err))
		}
	}
}