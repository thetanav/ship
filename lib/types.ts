export type StoredPage = {
  id: string;
  html: string;
  kind: "html" | "files";
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
