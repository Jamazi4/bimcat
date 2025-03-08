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
