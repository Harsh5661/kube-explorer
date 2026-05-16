export {};

declare global {
  interface Window {
    kubeExplorerDesktop?: {
      window: {
        minimize: () => Promise<void>;
        toggleMaximize: () => Promise<boolean>;
        close: () => Promise<void>;
        isMaximized: () => Promise<boolean>;
        onMaximizedChanged: (callback: (maximized: boolean) => void) => () => void;
      };
    };
  }
}
