export type FileEntry = {
  id: string;
  name: string;
  kind: "file" | "folder" | "parent";
  size: string;
  type: string;
  modified: string;
  permissions: string;
  owner: string;
  preview?: string;
};

export type TransferEntry = {
  id: string;
  direction: "Uploading" | "Downloading";
  fileName: string;
  source: string;
  target: string;
  progress: number;
  speed: string;
  transferred: string;
};

export type ConnectionEntry = {
  id: string;
  name: string;
  account: string;
  user: string;
};

export type ClusterTree = {
  id: string;
  name: string;
  status: "connected" | "warning";
  namespaces: {
    id: string;
    name: string;
    pods: {
      id: string;
      name: string;
      containers: string[];
    }[];
  }[];
};

export const appLocation = {
  cluster: "production-cluster",
  namespace: "payments",
  pod: "payments-api-7d4f9c6c8b-8k2lg",
  container: "app-container",
  path: "/app",
};

export const clusterTree: ClusterTree[] = [
  {
    id: "cluster-prod",
    name: "production-cluster",
    status: "connected",
    namespaces: [
      {
        id: "ns-default",
        name: "default",
        pods: [],
      },
      {
        id: "ns-kube-system",
        name: "kube-system",
        pods: [],
      },
      {
        id: "ns-monitoring",
        name: "monitoring",
        pods: [],
      },
      {
        id: "ns-payments",
        name: "payments",
        pods: [
          {
            id: "pod-api",
            name: "payments-api-7d4f9c6c8b-8k2lg",
            containers: ["app-container"],
          },
          {
            id: "pod-worker",
            name: "payments-worker-5f4d7c8d9f-2xj8t",
            containers: ["worker-container"],
          },
          {
            id: "pod-postgres",
            name: "postgres-0",
            containers: ["database-container"],
          },
          {
            id: "pod-redis",
            name: "redis-0",
            containers: ["cache-container"],
          },
        ],
      },
      {
        id: "ns-staging",
        name: "staging",
        pods: [],
      },
      {
        id: "ns-dev",
        name: "dev",
        pods: [],
      },
    ],
  },
  {
    id: "cluster-stage",
    name: "staging-cluster",
    status: "warning",
    namespaces: [],
  },
  {
    id: "cluster-local",
    name: "local-cluster (minikube)",
    status: "connected",
    namespaces: [],
  },
];

export const files: FileEntry[] = [
  {
    id: "parent",
    name: "..",
    kind: "parent",
    size: "",
    type: "",
    modified: "5/20/2025 10:34 AM",
    permissions: "",
    owner: "",
  },
  {
    id: "bin",
    name: "bin",
    kind: "folder",
    size: "",
    type: "Folder",
    modified: "5/19/2025 2:10 PM",
    permissions: "drwxr-xr-x",
    owner: "root",
  },
  {
    id: "config",
    name: "config",
    kind: "folder",
    size: "",
    type: "Folder",
    modified: "5/20/2025 10:20 AM",
    permissions: "drwxr-xr-x",
    owner: "root",
  },
  {
    id: "controllers",
    name: "controllers",
    kind: "folder",
    size: "",
    type: "Folder",
    modified: "5/18/2025 9:15 AM",
    permissions: "drwxr-xr-x",
    owner: "root",
  },
  {
    id: "lib",
    name: "lib",
    kind: "folder",
    size: "",
    type: "Folder",
    modified: "5/20/2025 11:00 AM",
    permissions: "drwxr-xr-x",
    owner: "root",
  },
  {
    id: "logs",
    name: "logs",
    kind: "folder",
    size: "",
    type: "Folder",
    modified: "5/20/2025 11:15 AM",
    permissions: "drwxr-xr-x",
    owner: "root",
  },
  {
    id: "public",
    name: "public",
    kind: "folder",
    size: "",
    type: "Folder",
    modified: "5/18/2025 9:15 AM",
    permissions: "drwxr-xr-x",
    owner: "root",
  },
  {
    id: "tmp",
    name: "tmp",
    kind: "folder",
    size: "",
    type: "Folder",
    modified: "5/20/2025 10:33 AM",
    permissions: "drwxr-xr-x",
    owner: "root",
  },
  {
    id: "vendor",
    name: "vendor",
    kind: "folder",
    size: "",
    type: "Folder",
    modified: "5/18/2025 9:15 AM",
    permissions: "drwxr-xr-x",
    owner: "root",
  },
  {
    id: "env",
    name: ".env",
    kind: "file",
    size: "1.2 KB",
    type: "File",
    modified: "5/20/2025 10:21 AM",
    permissions: "-rw-r--r--",
    owner: "root",
    preview: `NODE_ENV=production
PORT=3000
REDIS_URL=redis://redis:6379
DATABASE_URL=postgresql://payments@postgres:5432/payments`,
  },
  {
    id: "gitignore",
    name: ".gitignore",
    kind: "file",
    size: "612 B",
    type: "Text Document",
    modified: "5/18/2025 9:15 AM",
    permissions: "-rw-r--r--",
    owner: "root",
    preview: `node_modules
dist
.env
coverage
tmp`,
  },
  {
    id: "dockerfile",
    name: "Dockerfile",
    kind: "file",
    size: "1.1 KB",
    type: "File",
    modified: "5/18/2025 9:15 AM",
    permissions: "-rw-r--r--",
    owner: "root",
    preview: `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN yarn install --frozen-lockfile
COPY . .
CMD ["node", "server.js"]`,
  },
  {
    id: "package-json",
    name: "package.json",
    kind: "file",
    size: "2.3 KB",
    type: "JSON File",
    modified: "5/19/2025 2:15 PM",
    permissions: "-rw-r--r--",
    owner: "root",
    preview: `{
  "name": "payments-api",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}`,
  },
  {
    id: "readme",
    name: "README.md",
    kind: "file",
    size: "3.5 KB",
    type: "Markdown File",
    modified: "5/18/2025 9:15 AM",
    permissions: "-rw-r--r--",
    owner: "root",
    preview: `# Payments API

Service handling capture, refund, and payout workflows for merchant accounts.`,
  },
  {
    id: "server-js",
    name: "server.js",
    kind: "file",
    size: "4.6 KB",
    type: "JavaScript File",
    modified: "5/20/2025 11:02 AM",
    permissions: "-rw-r--r--",
    owner: "root",
    preview: `const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.send('Payments API is running');
});

app.listen(port, () => {
  console.log(\`Server running on port \${port}\`);
});`,
  },
  {
    id: "yarn-lock",
    name: "yarn.lock",
    kind: "file",
    size: "120 KB",
    type: "LOCK File",
    modified: "5/20/2025 10:21 AM",
    permissions: "-rw-r--r--",
    owner: "root",
    preview: `# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.`,
  },
];

export const terminalOutput = [
  "Connected to payments-api-7d4f9c6c8b-8k2lg (app-container)",
  "",
  "root@payments-api-7d4f9c6c8b-8k2lg:/app# ls -la",
  "total 80",
  "drwxr-xr-x 1 root root 4096 May 20 10:34 .",
  "drwxr-xr-x 1 root root 4096 May 18 09:15 ..",
  "drwxr-xr-x 1 root root 4096 May 20 10:21 bin",
  "drwxr-xr-x 1 root root 4096 May 20 10:20 config",
  "drwxr-xr-x 1 root root 4096 May 20 10:20 controllers",
  "drwxr-xr-x 1 root root 4096 May 20 11:00 lib",
  "drwxr-xr-x 1 root root 4096 May 20 11:15 logs",
  "drwxr-xr-x 1 root root 4096 May 20 09:15 public",
  "drwxr-xr-x 1 root root 4096 May 20 10:33 tmp",
  "drwxr-xr-x 1 root root 4096 May 20 09:15 vendor",
  "root@payments-api-7d4f9c6c8b-8k2lg:/app#",
];

export const logOutput = [
  "[11:16:20] INFO HTTP healthcheck responded in 4ms",
  "[11:16:23] INFO Fetching payout batch for merchant=pay_4821",
  "[11:16:24] WARN Retry triggered for webhook delivery id=wh_318",
  "[11:16:30] INFO Redis cache warmed for route=/payments/summary",
];

export const transfers: TransferEntry[] = [
  {
    id: "transfer-upload",
    direction: "Uploading",
    fileName: "app.js",
    source: "C:\\Users\\Admin\\Desktop\\app.js",
    target: "/app/controllers/",
    progress: 75,
    speed: "1.2 MB/s",
    transferred: "12.4 KB / 16.5 KB",
  },
  {
    id: "transfer-download",
    direction: "Downloading",
    fileName: "server.log",
    source: "/app/logs/server.log",
    target: "C:\\Users\\Admin\\Downloads\\",
    progress: 45,
    speed: "900 KB/s",
    transferred: "2.1 MB / 4.7 MB",
  },
];

export const bookmarks = [
  "/app/config",
  "/app/controllers",
  "/app/logs",
  "/app/public",
];

export const connections: ConnectionEntry[] = [
  {
    id: "connection-prod",
    name: "production-cluster",
    account: "arn:aws:eks:us-east-1:123456789012:cluster/prod",
    user: "aws-iam-authenticator",
  },
  {
    id: "connection-stage",
    name: "staging-cluster",
    account: "arn:aws:eks:us-east-1:123456789012:cluster/staging",
    user: "aws-iam-authenticator",
  },
  {
    id: "connection-local",
    name: "local-cluster (minikube)",
    account: "Context: minikube",
    user: "minikube",
  },
];

export const statusBar = {
  namespace: "payments",
  pod: "payments-api-7d4f9c6c8b-8k2lg",
  container: "app-container",
  user: "aws-iam-authenticator",
  version: "v1.0.0",
};
