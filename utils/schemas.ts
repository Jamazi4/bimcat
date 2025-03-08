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
  name: z.string(),
  psets: z.array(PsetSchema),
  id: z.string(),
  geomId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
