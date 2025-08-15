import { z } from "zod";
import { GeomNodeSchemaBack, NodeEdgeSchema } from "./nodeTypes";

export function validateWithZodSchema<T>(
  schema: z.ZodType<T>,
  data: unknown,
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error("Zod validation errors:", result.error.errors);
    const errors = result.error.errors.map((error) => {
      return `${error.path.join(".")}: ${error.message}`;
    });
    throw new Error(errors.join(", "));
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

export const ComponentControlsSchema = z.array(
  z.object({
    controlName: z.string(),
    nodeId: z.string(),
    outputValue: z.union([z.string(), z.boolean(), z.number()]),
    controlValue: z.union([z.string(), z.boolean(), z.number()]),
    //controlValue will be different only for sliders, it's used to initially
    //render correct slider state in UI
    controlType: z.enum(["numberInput", "slider", "checkbox"]),
  }),
);

export type ComponentControlsType = z.infer<typeof ComponentControlsSchema>;

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

export const NodeProjectSchema = z.object({
  id: z.string(),
  nodes: z.array(GeomNodeSchemaBack).optional(),
  edges: z.array(NodeEdgeSchema).optional(),
  componentId: z.string(),
  uiControls: ComponentControlsSchema.nullable().optional(),
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
  nodes: NodeProjectSchema.nullable().optional(),
});

export type componentWithGeometrySchemaType = z.infer<
  typeof componentWithGeometrySchema
>;
export const PsetActionsComponentSchema = z.object({
  psets: z.array(PsetSchema),
  userId: z.string(),
  name: z.string(),
});
