export type StoredPage = {
  id: string;
  html: string;
  kind: "html";
};

export type PageMeta = {
  url: string;
  createdAt: string;
  size: number;
  kind: "html";
};

export type PublishResponse = {
  success: true;
  id: string;
  url: string;
};

export type ApiError = {
  success: false;
  error: string;
  code?: string;
};

export type HealthResponse = {
  status: "ok";
  storage: "blob+redis" | "local";
  hasBlobStorage: boolean;
  hasRedis: boolean;
  siteUrl: string;
  timestamp: string;
};
