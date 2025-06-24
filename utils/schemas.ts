import { z, ZodSchema } from "zod";

export function validateWithZodSchema<T>(
  schema: ZodSchema<T>,
  data: unknown,
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map((error) => error.message);
    throw new Error(errors.join(","));
  }
  return result.data;
}

export const geometrySchema = z.object({
  position: z.coerce.number().array(),
  indices: z.coerce.number().array(),
});

export const geometryArraySchema = z.array(geometrySchema);

export const PsetAttributeSchema = z.record(
  z.union([z.string(), z.boolean(), z.number()]),
);

export const PsetContentSchema = z.array(PsetAttributeSchema);
export type PsetContentSchemaType = z.infer<typeof PsetContentSchema>;
export const PsetSchema = z.object({
  title: z.string(),
  content: PsetContentSchema,
});

export const PsetArraySchema = z.array(PsetSchema);

export type Pset = z.infer<typeof PsetSchema>;

export type PsetContent = z.infer<typeof PsetContentSchema>;

export const componentSchema = z.object({
  id: z.string(),
  name: z.string(),
  psets: z.array(PsetSchema).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
  author: z.string(),
  public: z.boolean(),
  //editable is not stored in db, but assigned
  //on backend depending on the user
});

export const componentArraySchema = z.array(componentSchema);

export const GeomNodeSchemaFront = z.object({
  id: z.string(),
  type: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  text: z.string(),
  inputs: z.array(z.string()),
  outputs: z.array(z.string()),
});

export type GeomNodeFrontType = z.infer<typeof GeomNodeSchemaFront>;

export const GeomNodeSchemaBack = z.object({
  id: z.string(),
  type: z.string(),
  x: z.number(),
  y: z.number(),
  values: z.optional(z.array(z.string())),
});

export type GeomNodeBackType = z.infer<typeof GeomNodeSchemaBack>;

export const NodeEdgeSchema = z.object({
  id: z.string(),
  fromNodeId: z.string(),
  fromSlotId: z.number(),
  toNodeId: z.string(),
  toSlotId: z.number(),
});

export type NodeEdgeType = z.infer<typeof NodeEdgeSchema>;

export const NodeProjectSchema = z.object({
  id: z.string(),
  nodes: z.array(GeomNodeSchemaBack),
  edges: z.array(NodeEdgeSchema),
});

export type NodeProjectType = z.infer<typeof NodeProjectSchema>;

export const componentWithGeometrySchema = z.object({
  id: z.string(),
  name: z.string(),
  geometry: geometryArraySchema,
  psets: z.array(PsetSchema).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
  author: z.string(),
  public: z.boolean(),
  editable: z.boolean(),
  nodes: NodeProjectSchema.optional(),
});

export type componentWithGeometrySchemaType = z.infer<
  typeof componentWithGeometrySchema
>;
export const PsetActionsComponentSchema = z.object({
  psets: z.array(PsetSchema),
  userId: z.string(),
  name: z.string(),
});
