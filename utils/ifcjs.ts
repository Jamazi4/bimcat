import * as OBC from "@thatopen/components";
import { FragmentsGroup } from "@thatopen/fragments";

export const getFragmentLoader = async () => {
  const components = new OBC.Components();
  // components.init();
  const fragments = components.get(OBC.FragmentsManager);
  const loader = components.get(OBC.IfcLoader);

  // loader.settings.wasm = {
  //   path: "web-ifc/web-ifc.wasm", // Make sure this points to the correct location
  //   absolute: true,
  // };
  await loader.setup();
  const indexer = components.get(OBC.IfcRelationsIndexer);
  const exporter = components.get(OBC.IfcJsonExporter);

  return { fragments, loader, indexer, exporter };
};

export const getModelData = async (model: FragmentsGroup) => {
  // Get geometry data
  const geometryData: any[] = [];

  model.items.forEach((fragment) => {
    const geometry = fragment.mesh.geometry;
    geometryData.push({
      attributes: {
        position: geometry.attributes.position.array,
        normal: geometry.attributes.normal.array,
        index: geometry.index?.array,
      },
      material: fragment.mesh.material,
      // Replace transform with matrix access
      matrix: fragment.mesh.matrix.toArray(), // Get the transformation matrix
      position: fragment.mesh.position.toArray(),
      rotation: fragment.mesh.quaternion.toArray(),
      scale: fragment.mesh.scale.toArray(),
    });
  });
  const properties = model.getProperties;

  // Convert to JSON with BigInt handling
  const jsonProperties = JSON.stringify(properties, (_, value) => {
    return typeof value === "bigint" ? value.toString() : value;
  });

  return {
    geometry: geometryData,
    properties: JSON.parse(jsonProperties),
  };
};
