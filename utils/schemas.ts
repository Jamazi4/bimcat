import { z, ZodSchema } from "zod";
import { Library, User } from "./types";

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
  psets: z.array(PsetSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
  author: z.string(),
});

export const userSchema: z.ZodType<User> = z.lazy(
  (): z.ZodType<User> =>
    z.object({
      id: z.string(),
      clerkId: z.string(),
      email: z.string(),
      firstName: z.string(),
      secondName: z.string().nullable(),
      Libraries: z.array(librarySchema),
    })
);

export type userSchemaType = z.infer<typeof userSchema>;

export const librarySchema: z.ZodType<Library> = z.lazy(
  (): z.ZodType<Library> =>
    z.object({
      id: z.string(),
      name: z.string(),
      components: z.array(componentSchema).optional(),
      createdAt: z.date(),
      updatedAt: z.date(),
      User: userSchema.optional(),
      userId: z.string().nullable(),
    })
);

export type librarySchemaType = z.infer<typeof librarySchema>;

export const componentWithGeometrySchema = z.object({
  id: z.string(),
  name: z.string(),
  geometry: geometryArraySchema,
  psets: z.array(PsetSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
  author: z.string(),
});

export type Component = z.infer<typeof componentSchema>;

export const componentsArraySchema = z.array(componentSchema);

export const editPsetSchema = z.object({
  componentId: z.string().uuid(),
  psetTitle: z.string(),
  psets: z.record(z.union([z.string(), z.number(), z.boolean()])),
});
