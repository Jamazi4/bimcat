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
  email: string;
  clerkId: string;
  firstName: string;
  secondName: string | null;
  authoredLibraries: Library[];
  guestLibraries: Library[];
  Components: ComponentSchemaType[];
}

export interface Library {
  id: string;
  name: string;
  components?: ComponentSchemaType[];
  createdAt: Date;
  updatedAt: Date;
  User?: User;
  userId?: string | null;
}
