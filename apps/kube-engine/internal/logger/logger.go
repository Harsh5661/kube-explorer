package logger

import "go.uber.org/zap"

func New() (*zap.Logger, error) {
	// Development config: human-readable, colored, includes line numbers
	logger, err := zap.NewDevelopment()
	if err != nil {
		return nil, err
	}
	return logger, nil
}