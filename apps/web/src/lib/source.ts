export interface PageTreePage {
  $id?: string;
  name: string;
  type: "page";
  url: string;
}

export interface PageTreeFolder {
  $id?: string;
  name: string;
  type: "folder";
  children: PageTreeNode[];
}

export type PageTreeNode = PageTreePage | PageTreeFolder;

export interface PageTree {
  name: string;
  children: PageTreeNode[];
}

export const labs = {
  pageTree: {} as PageTree,
};
