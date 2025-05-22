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
  premium: boolean;
}

export interface Library {
  id: string;
  name: string;
  description: string;
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

export type SelectedComposite = Record<string, { name: string }>;

export type LibraryInfoType = {
  updatedAt: string;
  createdAt: string;
  author: string;
  empty: boolean;
  name: string;
  desc: string;
  sharedId: string;
  isPublic: boolean;
  isEditable: boolean;
  guests: { name: string; id: string }[];
  isComposite?: boolean;
};

export type BrowserSearchParamsType = {
  myComponents: boolean;
  searchAuthor: string;
  searchName: string;
  searchPsetContent: string;
  searchPsetTitle: string;
};

export type LibrariesSearchParamsType = {
  myLibraries: boolean;
  favorites: boolean;
  composite: boolean;
  searchName: string;
  searchAuthor: string;
  searchDescription: string;
  searchContent: string;
};

export enum LibraryErrors {
  UserNotFound = "Could not find user.",
  OwnLibrary = "Can not become a guest of your own library.",
  NotShared = "Library is not shared.",
  AlreadyShared = "Library is already shared.",
  Unauthorized = "Unauthorized.",
  LibraryNotFound = "Could not find library.",
}

export type frontendLibrary = {
  id: string;
  name: string;
  description: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  numElements: number;
  numGuests: number;
  editable: boolean;
  publicFlag: boolean;
  isGuest: boolean;
  isComposite: boolean;
};
