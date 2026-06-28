package config

import (
	"strings"

	"github.com/spf13/viper"
)

type Config struct {
	Server     ServerConfig
	Kubernetes KubernetesConfig
}

type ServerConfig struct {
	Port int
}

type KubernetesConfig struct {
	Kubeconfig string
}

func Load() (*Config, error) {
	v := viper.New()

	v.SetConfigName("config")
	v.SetConfigType("yaml")
	v.AddConfigPath(".")

	// Defaults, used if nothing else sets a value
	v.SetDefault("server.port", 8080)

	// Env vars override file values, e.g. KUBE_ENGINE_SERVER_PORT=9090
	v.SetEnvPrefix("KUBE_ENGINE")
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	v.AutomaticEnv()

	if err := v.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, err
		}
		// file not found is fine, we have defaults
	}

	cfg := &Config{
		Server: ServerConfig{
			Port: v.GetInt("server.port"),
		},
		Kubernetes: KubernetesConfig{
			Kubeconfig: v.GetString("kubernetes.kubeconfig"),
		},
	}

	return cfg, nil
}