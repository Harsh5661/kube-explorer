package k8s

import (
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

type ClusterInfo struct {
	Name      string
	ClusterID string
	Server    string
	IsCurrent bool
}

// ListContexts reads the kubeconfig and returns metadata about every context.
func ListContexts(kubeconfigPath string) ([]ClusterInfo, error) {
	loadingRules := clientcmd.NewDefaultClientConfigLoadingRules()
	if kubeconfigPath != "" {
		loadingRules.ExplicitPath = kubeconfigPath
	}

	rawConfig, err := loadingRules.Load()
	if err != nil {
		return nil, err
	}

	var clusters []ClusterInfo
	for contextName, ctx := range rawConfig.Contexts {
		cluster := rawConfig.Clusters[ctx.Cluster]
		server := ""
		if cluster != nil {
			server = cluster.Server
		}

		clusters = append(clusters, ClusterInfo{
			Name:      contextName,
			ClusterID: ctx.Cluster,
			Server:    server,
			IsCurrent: contextName == rawConfig.CurrentContext,
		})
	}

	return clusters, nil
}

// restConfig builds the low-level *rest.Config for a given kubeconfig + context.
// Both NewClient and the exec executor are built from this.
func restConfigFor(kubeconfigPath, contextName string) (*rest.Config, error) {
	loadingRules := clientcmd.NewDefaultClientConfigLoadingRules()
	if kubeconfigPath != "" {
		loadingRules.ExplicitPath = kubeconfigPath
	}

	overrides := &clientcmd.ConfigOverrides{}
	if contextName != "" {
		overrides.CurrentContext = contextName
	}

	clientConfig := clientcmd.NewNonInteractiveDeferredLoadingClientConfig(
		loadingRules,
		overrides,
	)

	return clientConfig.ClientConfig()
}

// NewClient builds a Kubernetes clientset for the given context.
func NewClient(kubeconfigPath string, contextName string) (*kubernetes.Clientset, error) {
	restConfig, err := restConfigFor(kubeconfigPath, contextName)
	if err != nil {
		return nil, err
	}
	return kubernetes.NewForConfig(restConfig)
}