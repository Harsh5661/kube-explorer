package main

import (
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"go.uber.org/zap"

	"github.com/Harsh5661/kube-explorer/kube-engine/internal/api"
	"github.com/Harsh5661/kube-explorer/kube-engine/internal/config"
	"github.com/Harsh5661/kube-explorer/kube-engine/internal/logger"
)

func main() {
	log, err := logger.New()
	if err != nil {
		panic(err)
	}
	defer log.Sync()

	cfg, err := config.Load()
	if err != nil {
		log.Fatal("failed to load config", zap.Error(err))
	}

	r := chi.NewRouter()

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"status":"ok"}`))
	})

	r.Get("/api/clusters", api.ListClustersHandler(cfg.Kubernetes.Kubeconfig, log))
	r.Get("/api/namespaces", api.ListNamespacesHandler(cfg.Kubernetes.Kubeconfig, log))
	r.Get("/api/pods", api.ListPodsHandler(cfg.Kubernetes.Kubeconfig, log))
	r.Get("/api/files", api.ListFilesHandler(cfg.Kubernetes.Kubeconfig, log))

	addr := fmt.Sprintf(":%d", cfg.Server.Port)
	log.Info("kube-engine starting", zap.String("addr", addr))

	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatal("server crashed", zap.Error(err))
	}
}