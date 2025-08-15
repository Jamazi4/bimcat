"use server";

import { prisma } from "@/db";
import {
  validateWithZodSchema,
  geometrySchema,
  Pset,
  geometryArraySchema,
  componentWithGeometrySchema,
  PsetActionsComponentSchema,
  PsetArraySchema,
  componentArraySchema,
  NodeProjectSchema,
  ComponentControlsType,
} from "../schemas";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { getDbUser } from "./globalActions";
import {
  createNodeId,
  psetContentToString,
  renderError,
  searchInsensitive,
} from "../utilFunctions";
import { BrowserSearchParamsType, ComponentGeometry } from "../types";
import { Prisma } from "@prisma/client";
import { GeomNodeBackType, NodeEdgeType } from "../nodeTypes";

const addEditableToComponent = async <T extends { userId: string }>(
  component: T,
): Promise<T & { editable: boolean }> => {
  const dbUser = await getDbUser(); //TODO: usually dbUser can already be passsed here
  const dbUserId = dbUser?.id;

  if (!component.userId)
    throw new Error("Could not find the owner of the component");

  const componentWithEditable = {
    ...component,
    editable: dbUserId === component.userId,
  };

  return componentWithEditable;
};

export const createNodeComponentAction = async (
  name: string,
  makePrivate: boolean,
) => {
  try {
    const dbUser = await getDbUser();
    const author = `${dbUser?.firstName} ${dbUser?.secondName}`;
    if (!dbUser) throw new Error("Could not find user");

    const data: Prisma.ComponentCreateInput = {
      name,
      psets: [],
      public: !makePrivate,
      geometry: {
        create: [],
      },
      User: {
        connect: {
          id: dbUser.id,
        },
      },
      author,
    };

    const outputNode: GeomNodeBackType = {
      id: createNodeId(),
      type: "output",
      x: 300,
      y: 300,
    };

    data["nodes"] = { create: { nodes: [outputNode], edges: [] } };

    const component = await prisma.component.create({
      data,
    });
    revalidatePath(`/components`);
    revalidateTag("allComponents");
    return {
      message: `Component ${name} created successfully!`,
      componentId: component.id,
    };
  } catch (error) {
    throw error;
  }
};

export const updateNodeProject = async (
  uiControls: ComponentControlsType,
  nodes: GeomNodeBackType[],
  edges: NodeEdgeType[],
  componentId: string,
  geometry: ComponentGeometry[],
) => {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) throw new Error("Could not find user");

    const component = await prisma.component.findUnique({
      where: { id: componentId },
      select: {
        userId: true,
        id: true,
        geometry: { select: { id: true } },
        nodes: { select: { id: true } },
      },
    });

    if (!component) throw new Error("Could not find component");
    if (dbUser.id !== component?.userId || !component)
      throw new Error("No Component or unauthorized");
    if (!component.nodes || !component.nodes.id)
      throw new Error("No node project for this component");

    const oldGeomIds = component.geometry.map((geom) => geom.id);

    await prisma.$transaction(async (tx) => {
      const newGeometryRecords = await Promise.all(
        geometry.map((g) => tx.componentGeometry.create({ data: g })),
      );

      const usage = await tx.component.findMany({
        where: {
          geometry: {
            some: {
              id: { in: oldGeomIds },
            },
          },
        },
        select: {
          id: true,
          geometry: {
            select: { id: true },
            where: { id: { in: oldGeomIds } },
          },
        },
      });

      await tx.component.update({
        where: { id: componentId },
        data: {
          geometry: { set: [] },
        },
      });

      const usageMap: Record<string, number> = {};

      for (const component of usage) {
        for (const geo of component.geometry) {
          usageMap[geo.id] = (usageMap[geo.id] || 0) + 1;
        }
      }

      const geomsToDelete = oldGeomIds.filter(
        (id) => !usageMap[id] || usageMap[id] <= 1,
      );

      await tx.component.update({
        where: { id: componentId },
        data: {
          geometry: {
            connect: newGeometryRecords.map((g) => ({ id: g.id })),
          },
          updatedAt: new Date(),
        },
      });

      if (geomsToDelete.length > 0) {
        await tx.componentGeometry.deleteMany({
          where: { id: { in: geomsToDelete } },
        });
      }

      await tx.nodeProject.update({
        where: { id: component.nodes?.id },
        data: { nodes: nodes, edges: edges, uiControls: uiControls },
      });
    });

    return { message: "Node project succesfully saved" };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchNodeProject = async (componentId: string) => {
  try {
    const dbUser = getDbUser();
    if (!dbUser) throw new Error("Unauthorized");
    const nodeProject = await prisma.component.findUnique({
      where: { id: componentId },
      select: { nodes: true },
    });

    if (!nodeProject) throw new Error("Could not find component");

    const validatedNodeProject = validateWithZodSchema(
      NodeProjectSchema,
      nodeProject.nodes,
    );
    return validatedNodeProject;
  } catch (error) {
    throw error;
  }
};

export const createComponentAction = async (
  _prevState: unknown,
  formData: FormData,
) => {
  const name = formData.get("name") as string;
  const geometry = formData.get("geometry") as string;
  const psets = formData.get("psets") as string;
  const makePrivate = formData.get("makePrivate") === "on";

  const parsedGeometry = validateWithZodSchema(
    geometryArraySchema,
    JSON.parse(geometry),
  );
  const parsedPsets = JSON.parse(psets);

  try {
    const dbUser = await getDbUser();
    const author = `${dbUser?.firstName} ${dbUser?.secondName}`;
    if (!dbUser) throw new Error("Could not find user");

    const data: Prisma.ComponentCreateInput = {
      name,
      psets: parsedPsets,
      public: !makePrivate,
      geometry: {
        create: parsedGeometry,
      },
      User: {
        connect: {
          id: dbUser.id,
        },
      },
      author,
    };

    await prisma.component.create({
      data,
    });
    revalidatePath(`/components`);
    revalidateTag("allComponents");
    return { message: `Component ${name} created successfully!` };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchSingleComponentAction = async (id: string) => {
  try {
    const dbUser = await getDbUser();

    const component = await prisma.component.findUnique({
      where: { id },
      include: {
        geometry: true,
        nodes: { select: { uiControls: true, id: true, componentId: true } },
        //TODO: this is only used to check if nodes exist, optimize query so
        //it doesn't fetch entire nodes if I'm just looking at the component
      },
    });

    if (!component) throw new Error("No component with this id");

    if (!component.public && component.userId !== dbUser?.id)
      throw new Error("Unauthorized");

    const componentWithEditable = {
      ...component,
      editable: component.userId === dbUser?.id,
    };

    const validatedComponent = validateWithZodSchema(
      componentWithGeometrySchema,
      componentWithEditable,
    );

    return validatedComponent;
  } catch (error) {
    console.log(error);
  }
};

export const fetchGeometryAction = async (id: string) => {
  if (!id) return;

  try {
    const response = await prisma.componentGeometry.findUnique({
      where: {
        id: id,
      },
    });
    if (response) {
      return validateWithZodSchema(geometrySchema, {
        position: response.position,
        indices: response.indices,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export const fetchAllComponentsAction = async (
  params: BrowserSearchParamsType,
) => {
  const {
    myComponents,
    searchAuthor,
    searchName,
    searchPsetContent,
    searchPsetTitle,
  } = params;
  try {
    const dbUser = await getDbUser();
    const dbUserId = dbUser?.id;

    const whereCondition: Prisma.ComponentWhereInput = {};

    if (!dbUserId) {
      whereCondition.public = true;
    } else if (myComponents) {
      whereCondition.userId = dbUserId;
    } else {
      whereCondition.OR = [{ public: true }, { userId: dbUserId }];
    }

    const andConditions: Prisma.ComponentWhereInput[] = [];

    if (searchName) {
      andConditions.push({
        name: { contains: searchName, mode: "insensitive" },
      });
    }
    if (searchAuthor) {
      andConditions.push({
        author: { contains: searchAuthor, mode: "insensitive" },
      });
    }

    if (andConditions.length > 0) {
      whereCondition.AND = andConditions;
    }

    const components = await prisma.component.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        author: true,
        userId: true,
        public: true,
        psets: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    const validatedComponents = validateWithZodSchema(
      componentArraySchema,
      components,
    );

    let filteredComponents = validatedComponents;

    if (searchPsetTitle) {
      filteredComponents = filteredComponents.filter((comp) =>
        comp.psets?.some((pset) =>
          searchInsensitive(searchPsetTitle, pset.title),
        ),
      );
    }

    if (searchPsetContent) {
      filteredComponents = filteredComponents.filter((comp) => {
        return comp.psets?.some((pset) => {
          const contentString = psetContentToString(pset.content);
          const found = searchInsensitive(searchPsetContent, contentString);
          return found;
        });
      });
    }

    const componentsWithEditable = filteredComponents.map((component) => {
      return {
        id: component.id,
        name: component.name,
        createdAt: component.createdAt.toISOString(),
        updatedAt: component.updatedAt.toISOString(),
        author: component.author,
        public: component.public,
        editable: component.userId === dbUserId,
      };
    });

    return componentsWithEditable;
  } catch (error) {
    throw error;
  }
};

export const cachedFetchAllComponents = unstable_cache(
  async (params: BrowserSearchParamsType) => fetchAllComponentsAction(params),
  [],
  { tags: ["allComponents"] },
);

export const updatePsetsAction = async (
  _prevState: unknown,
  formData: FormData,
) => {
  const componentId = formData.get("componentId") as string;
  const psetTitle = formData.get("psetTitle") as string;
  const keysToRemove = ["componentId", "psetTitle"];
  const newPsetData = Object.fromEntries(
    Array.from(formData.entries()).filter(
      ([key]) => !keysToRemove.includes(key),
    ),
  );

  try {
    const component = await prisma.component.findUnique({
      where: {
        id: componentId,
      },
      select: {
        psets: true,
        userId: true,
        name: true,
      },
    });

    if (!component) throw new Error("No component with this id");
    const componentWithEditable = await addEditableToComponent(component);

    if (!componentWithEditable.editable)
      throw new Error("User has no rights to edit this component");

    const validatedComponent = validateWithZodSchema(
      PsetActionsComponentSchema,
      componentWithEditable,
    );

    if (!validatedComponent.psets) throw new Error("No psets in component");

    const newPsets: Pset[] = validatedComponent.psets.map((pset: Pset) => {
      if (pset.title === psetTitle) {
        return {
          title: psetTitle,
          content: Object.entries(newPsetData).map(([key, value]) => ({
            [key]: value as string | number | boolean,
          })),
        };
      }
      return pset;
    });

    await prisma.component.update({
      where: {
        id: componentId,
      },
      data: {
        psets: newPsets,
      },
    });
    revalidatePath(`/components/${componentId}`);
    return { message: `${psetTitle} updated successfully!` };
  } catch (error) {
    return renderError(error);
  }
};

export const removePsetAction = async (
  _prevState: unknown,
  formData: FormData,
) => {
  const componentId = formData.get("componentId") as string;
  const psetTitle = formData.get("psetTitle") as string;

  try {
    const component = await prisma.component.findUnique({
      where: {
        id: componentId,
      },
      select: {
        psets: true,
        userId: true,
        name: true,
      },
    });

    if (!component) throw new Error("No component with this id");
    const componentWithEditable = await addEditableToComponent(component);

    if (!componentWithEditable.editable)
      throw new Error("User has no rights to edit this component");

    const validatedComponent = validateWithZodSchema(
      PsetActionsComponentSchema,
      componentWithEditable,
    );

    if (!validatedComponent.psets) throw new Error("No psets in component");

    const newPsets: Pset[] = validatedComponent.psets.filter(
      (pset) => pset.title !== psetTitle,
    );

    await prisma.component.update({
      where: {
        id: componentId,
      },
      data: {
        psets: newPsets,
      },
    });

    revalidatePath(`/components/${componentId}`);
    return { message: `successfully removed ${psetTitle}` };
  } catch (error) {
    return renderError(error);
  }
};

export const addPsetAction = async (
  _prevState: unknown,
  formData: FormData,
) => {
  const componentId = formData.get("componentId") as string;
  const psetTitle = formData.get("psetTitle") as string;

  try {
    const component = await prisma.component.findUnique({
      where: {
        id: componentId,
      },
      select: {
        psets: true,
        userId: true,
        name: true,
      },
    });

    if (!component) throw new Error("No component with this id");
    const componentWithEditable = await addEditableToComponent(component);

    if (!componentWithEditable.editable)
      throw new Error("User has no rights to edit this component");

    const validatedComponent = validateWithZodSchema(
      PsetActionsComponentSchema,
      componentWithEditable,
    );

    if (!component.psets) throw new Error("No psets in component");

    const newPsets: Pset[] = [
      ...validatedComponent.psets,
      { title: psetTitle, content: [] },
    ];

    await prisma.component.update({
      where: {
        id: componentId,
      },
      data: {
        psets: newPsets,
      },
    });
    revalidatePath(`/components/${componentId}`);
    return {
      message: `Pset ${psetTitle} successfully added to ${validatedComponent.name}.`,
    };
  } catch (error) {
    return renderError(error);
  }
};

export const deleteComponentAction = async (componentIds: string[]) => {
  try {
    const dbUser = await getDbUser();

    const components = await prisma.component.findMany({
      where: { id: { in: componentIds } },
      include: { geometry: true, User: true },
    });

    const userIds = components.map((component) => component.userId);

    if (!components || !userIds.every((id) => id === dbUser?.id)) {
      throw new Error("Error deleting component(s) or unauthorized.");
    }

    const geometryIds = components.map((component) =>
      component.geometry.map((g) => g.id),
    );

    const geometriesToRemove = [];
    for (const geometryId of geometryIds) {
      const geometries = await prisma.componentGeometry.findMany({
        where: { id: { in: geometryId } },
        include: { components: { select: { id: true } } },
      });

      for (const geometry of geometries) {
        if (geometry.components.length === 1) {
          geometriesToRemove.push(geometry.id);
        }
      }
    }

    await prisma.componentGeometry.deleteMany({
      where: { id: { in: geometriesToRemove } },
    });

    await prisma.component.deleteMany({
      where: {
        id: { in: componentIds },
      },
    });

    revalidatePath(`/components/browse`);
    return {
      message: `Successfully removed ${components.length} component${
        components.length > 1 ? "s" : ""
      }.`,
    };
  } catch (error) {
    return renderError(error);
  }
};

export const toggleComponentPrivateAction = async (componentIds: string[]) => {
  try {
    const dbUser = await getDbUser();

    const components = await prisma.component.findMany({
      where: { id: { in: componentIds } },
      select: {
        User: true,
        public: true,
        name: true,
        userId: true,
        libraries: { select: { id: true, public: true } },
      },
    });

    const userIds = components.map((component) => component.userId);

    if (!components || !userIds.every((id) => id === dbUser?.id)) {
      throw new Error("Error deleting component(s) or unauthorized");
    }

    const curPublics = components.map((component) => component.public);

    const publicComponents = components.filter((component) => component.public);

    const affectedLibraries =
      publicComponents.length > 0
        ? publicComponents.flatMap((component) => {
            return component.libraries.filter((library) => library.public);
          })
        : [];

    const affectedLibrariesUnique = Object.values(
      affectedLibraries.reduce(
        (acc, library) => {
          acc[library.id] = library;
          return acc;
        },
        {} as Record<string, (typeof affectedLibraries)[number]>,
      ),
    );

    await Promise.all(
      componentIds.map((id, i) => {
        return prisma.component.update({
          where: { id },
          data: {
            public: !curPublics[i],
            libraries: {
              disconnect: affectedLibrariesUnique.map((lib) => ({
                id: lib.id,
              })),
            },
          },
        });
      }),
    );

    await Promise.all([
      ...componentIds.map((id, i) =>
        prisma.component.update({
          where: { id },
          data: {
            public: !curPublics[i],
            libraries: {
              disconnect: affectedLibrariesUnique.map((lib) => ({
                id: lib.id,
              })),
            },
          },
        }),
      ),
      prisma.library.updateMany({
        where: {
          id: { in: affectedLibrariesUnique.map((lib) => lib.id) },
        },
        data: {
          updatedAt: new Date(),
        },
      }),
    ]);

    revalidateTag("allComponents");
    revalidatePath(`/components/browse`);

    return {
      message: `Successfully toggled private for ${
        components.length
      } component${components.length > 1 ? "s" : ""}.`,
    };
  } catch (error) {
    return renderError(error);
  }
};

export const renameComponentAction = async (
  componentId: string,
  newName: string,
) => {
  try {
    const component = await prisma.component.findUnique({
      where: { id: componentId },
      select: { id: true, name: true, userId: true },
    });

    const oldName = component?.name;

    if (!component) throw new Error("Component not found.");

    const componentWithEditable = await addEditableToComponent(component);

    if (!componentWithEditable.editable) throw new Error("Unauthorized");

    await prisma.component.update({
      where: { id: componentId },
      data: { name: newName, updatedAt: new Date() },
    });

    revalidatePath(`/components/browse`);
    revalidatePath(`/components/browse/${componentId}`);

    return { message: `Succesfully renamed ${oldName} to ${newName}` };
  } catch (error) {
    return renderError(error);
  }
};

export const copyComponentAction = async (id: string, name: string) => {
  try {
    const oldComponent = await prisma.component.findUnique({
      where: { id },
      include: { geometry: { select: { id: true } }, nodes: true },
    });

    const dbUser = await getDbUser();
    const author = `${dbUser?.firstName} ${dbUser?.secondName}`;

    if (!dbUser) throw new Error("Unauthorized");
    if (!oldComponent) throw new Error("Could not find original component");

    const validatedPsets = validateWithZodSchema(
      PsetArraySchema,
      oldComponent.psets,
    );

    const newComponent = await prisma.component.create({
      data: {
        userId: dbUser.id,
        name,
        psets: validatedPsets,
        author,
        geometry: {
          connect: oldComponent.geometry.map((geom) => ({ id: geom.id })),
        },
      },
    });

    // If the old component had a NodeProject, copy it
    if (oldComponent.nodes) {
      await prisma.nodeProject.create({
        data: {
          componentId: newComponent.id,
          nodes: JSON.parse(JSON.stringify(oldComponent.nodes.nodes)),
          edges: JSON.parse(JSON.stringify(oldComponent.nodes.edges)),
        },
      });
    }

    revalidatePath(`/components/browse`);

    return { message: `Component ${name} created succesfully` };
  } catch (error) {
    return renderError(error);
  }
};
