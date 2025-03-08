export type Pset = {
  title: string;
  content: PsetContent[];
};

export type PsetContent = {
  name: string;
  value: string;
};

export type ComponentGeometry = {
  position: number[];
  indices: number[];
};
