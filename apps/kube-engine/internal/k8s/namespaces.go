package k8s

import (
	"context"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

type NamespaceInfo struct {
	Name   string
	Status string
}

// ListNamespaces connects to the given context and returns its namespaces.
func ListNamespaces(ctx context.Context, kubeconfigPath, contextName string) ([]NamespaceInfo, error) {
	clientset, err := NewClient(kubeconfigPath, contextName)
	if err != nil {
		return nil, err
	}

	nsList, err := clientset.CoreV1().Namespaces().List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, err
	}

	result := make([]NamespaceInfo, 0, len(nsList.Items))
	for _, ns := range nsList.Items {
		result = append(result, NamespaceInfo{
			Name:   ns.Name,
			Status: string(ns.Status.Phase),
		})
	}

	return result, nil
}