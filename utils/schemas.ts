import { z, ZodSchema } from "zod";

export function validateWithZodSchema<T>(
  schema: ZodSchema<T>,
  data: unknown
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
  z.union([z.string(), z.boolean(), z.number()])
);

export const PsetContentSchema = z.array(PsetAttributeSchema);

export const PsetSchema = z.object({
  title: z.string(),
  content: PsetContentSchema,
});

export type Pset = z.infer<typeof PsetSchema>;

export type PsetContent = z.infer<typeof PsetContentSchema>;

export const componentSchema = z.object({
  id: z.string(),
  name: z.string(),
  // geometry: geometryArraySchema, //used in lists, no need for geom
  psets: z.array(PsetSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const componentWithGeometrySchema = z.object({
  id: z.string(),
  name: z.string(),
  geometry: geometryArraySchema,
  psets: z.array(PsetSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Component = z.infer<typeof componentSchema>;

export const componentsArraySchema = z.array(componentSchema);

export const editPsetSchema = z.object({
  componentId: z.string().uuid(),
  psetTitle: z.string(),
  psets: z.record(z.union([z.string(), z.number(), z.boolean()])),
});
