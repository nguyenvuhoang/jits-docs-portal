export type DocumentType = "markdown" | "html";

export type GuideDocument = {
  slug: string;
  title: string;
  summary: string;
  file: string;
  type: DocumentType;
  updatedAt?: string;
};

export type GuideFolder = {
  folderCode: string;
  title: string;
  description: string;
  icon?: string;
  type?: "documents" | "playground";
  url?: string;
  documents: GuideDocument[];
};

export type GuideProject = {
  projectCode: string;
  projectName: string;
  description: string;
  icon?: string;
  status?: "active" | "inactive";
  folders: GuideFolder[];
};

export type PublicProject = Pick<
  GuideProject,
  "projectCode" | "projectName" | "description" | "icon" | "status"
> & {
  folderCount: number;
  documentCount: number;
};

export type ResolvedDocument = {
  project: GuideProject;
  folder: GuideFolder;
  document: GuideDocument;
  content: string;
};
