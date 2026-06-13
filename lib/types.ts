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
