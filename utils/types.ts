import { ComponentSchemaType } from "./schemas";

export type Pset = {
  title: string;
  content: PsetContent[];
};

export type PsetContent = {
  [attribute: string]: unknown;
};

export type ComponentGeometry = {
  position: number[];
  indices: number[];
};

export type actionFunction = (
  prevState: unknown,
  formData: FormData,
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
  sharedId: string;
  isPublic: boolean;
  isEditable: boolean;
  guests: { name: string; id: string }[];
};

export type BrowserSearchParamsType = {
  myComponents: boolean;
  searchString: string;
};

export type LibrariesSearchParamsType = {
  myLibraries: boolean;
  favorites: boolean;
  searchName: string;
  searchAuthor: string;
  searchDescription: string;
  searchComponents: string;
};

export enum LibraryErrors {
  UserNotFound = "Could not find user.",
  OwnLibrary = "Can not become a guest of your own library.",
  NotShared = "Library is not shared.",
  AlreadyShared = "Library is already shared.",
  Unauthorized = "Unauthorized.",
  LibraryNotFound = "Could not find library.",
}
