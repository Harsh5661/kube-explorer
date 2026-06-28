package k8s

import (
	"context"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

type PodInfo struct {
	Name       string
	Namespace  string
	Status     string
	Containers []string
}

// ListPods connects to the given context and returns pods in the given namespace.
func ListPods(ctx context.Context, kubeconfigPath, contextName, namespace string) ([]PodInfo, error) {
	clientset, err := NewClient(kubeconfigPath, contextName)
	if err != nil {
		return nil, err
	}

	podList, err := clientset.CoreV1().Pods(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, err
	}

	result := make([]PodInfo, 0, len(podList.Items))
	for _, pod := range podList.Items {
		containerNames := make([]string, 0, len(pod.Spec.Containers))
		for _, c := range pod.Spec.Containers {
			containerNames = append(containerNames, c.Name)
		}

		result = append(result, PodInfo{
			Name:       pod.Name,
			Namespace:  pod.Namespace,
			Status:     string(pod.Status.Phase),
			Containers: containerNames,
		})
	}

	return result, nil
}