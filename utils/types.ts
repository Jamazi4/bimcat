import { ComponentSchemaType } from "./schemas";

export type Pset = {
  title: string;
  content: PsetContent[];
};

export type PsetContent = {
  [attribute: string]: any;
};

export type ComponentGeometry = {
  position: number[];
  indices: number[];
};

export type actionFunction = (
  prevState: any,
  formData: FormData
) => Promise<{ message: string }>;

export interface User {
  id: string;
  clerkId: string;
  firstName: string;
  secondName: string | null;
  authoredLibraries: Library[];
  guestLibraries: Library[];
  Components: Partial<ComponentSchemaType>[];
  premium: boolean;
}

export interface Library {
  id: string;
  name: string;
  description: string;
  Components?: Partial<ComponentSchemaType>[];
  createdAt: Date;
  updatedAt: Date;
  author: Partial<User>;
  userId?: string | null;
  guests: Partial<User>[];
  public: boolean;
}

export type SelectedRow = Record<
  string,
  { name: string; editable: boolean; isPublic: boolean }
>;

export type LibraryInfo = {
  empty: boolean;
  name: string;
  desc: string;
  public: boolean;
  editable: boolean;
};

export type searchParamsType = {
  myComponents: boolean;
  searchString: string;
};
