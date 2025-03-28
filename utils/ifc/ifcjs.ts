import * as OBC from "@thatopen/components";
import { FragmentMesh, FragmentsGroup } from "@thatopen/fragments";
import { ComponentGeometry, Pset } from "../types";
import * as THREE from "three";

/**
 * Create instances of thatOpen components classes
 */
export const getFragmentLoader = async () => {
  const components = new OBC.Components();
  const fragments = components.get(OBC.FragmentsManager);
  const loader = components.get(OBC.IfcLoader);

  await loader.setup();
  const indexer = components.get(OBC.IfcRelationsIndexer);
  const exporter = components.get(OBC.IfcJsonExporter);

  return { fragments, loader, indexer, exporter };
};

const getIfcModel = async (file: File, loader: OBC.IfcLoader) => {
  const data = await file.arrayBuffer();
  const buffer = new Uint8Array(data);

  return await loader.load(buffer);
};

//DELETE THIS
export const getIfcPsets = async (
  model: FragmentsGroup,
  indexer: OBC.IfcRelationsIndexer
) => {
  const firstElement = model.children[0] as FragmentMesh;
  const ids = firstElement.fragment.ids;
  const idsIterator = ids.values();
  const firstId = idsIterator.next().value;

  const psets: Pset[] = [];

  await indexer.process(model);
  if (firstId) {
    const psetsExpressIds = indexer.getEntityRelations(
      model,
      firstId,
      "IsDefinedBy"
    );

    for (const expressID of psetsExpressIds) {
      // You can get the pset attributes like this
      const pset = await model.getProperties(expressID);
      if (pset) {
        const curPsetTitle = pset["Name"]?.value || " ";

        const curPset: Pset = {
          title: curPsetTitle,
          content: [],
        };

        await OBC.IfcPropertiesUtils.getPsetProps(
          model,
          expressID,
          async (propExpressID) => {
            const prop = await model.getProperties(propExpressID); //values
            if (prop) {
              const propName = prop["Name"]?.value || " ";
              const propValue = prop["NominalValue"]?.value ?? " ";
              curPset.content.push({ [propName]: propValue });
            }
          }
        );
        psets.push(curPset);
      }
    }
    return psets;
  }
};

export const getIfcGeometry = async (model: FragmentsGroup) => {
  const firstElement = model.children[0] as FragmentMesh;
  const bufferGeom = firstElement.geometry;
  const position = Array.from(bufferGeom.attributes.position.array);
  const indices = Array.from(bufferGeom.index.array);

  return { position, indices };
};

export const getIfcData = async (file: File) => {
  const { loader, indexer } = await getFragmentLoader();
  const model = await getIfcModel(file, loader);
  const geometry = await getIfcGeometry(model);
  const psets = await getIfcPsets(model, indexer);

  return { geometry, psets };
};
//////////////////ById (componentPicker)////////////////////////////////////////

export const getIfcDataById = async (file: File, id: number) => {
  const { loader, indexer } = await getFragmentLoader();
  const model = await getIfcModel(file, loader);
  const units = await model.getAllPropertiesOfType(180925521); //IFC4.IfcUnitAssignment
  let isMili: boolean = true;

  await Promise.all(
    Object.values(units!)[0].Units.map(
      async (unit: { value: number; type: number }) => {
        const unitValue = await model.getProperties(unit.value);
        if (unitValue?.UnitType?.value === "LENGTHUNIT") {
          isMili =
            unitValue?.Prefix?.value !== undefined
              ? unitValue.Prefix.value === "MILLI"
              : true;

          console.log(isMili);
          console.log(unitValue?.Prefix?.value);
        }
      }
    )
  );

  await indexer.process(model);
  const geometry = await getIfcGeometryById(model, id, isMili);

  const psets = await getIfcPsetsById(model, indexer, id);

  return { geometry, psets };
};

export const getIfcGeometryById = async (
  model: FragmentsGroup,
  id: number,
  isMili: boolean
) => {
  const elements = model.items.filter((item) => {
    const itemId = item.ids.values().next().value;
    console.log(item.ids); // checking if there are more

    if (itemId === id) {
      let transform = item.get(itemId).transforms[0];
      const scaleMatrix = new THREE.Matrix4().makeScale(1000, 1000, 1000);
      if (!isMili) transform = transform.multiply(scaleMatrix);

      item.mesh.geometry.applyMatrix4(transform);

      //TODO: saved file have messed up normals,
      // maybe it's problem with ifcBuilder

      item.mesh.geometry.attributes.position.needsUpdate = true;
      return true;
    }
    return itemId === id;
  });

  const geometry: ComponentGeometry[] = [];
  elements.forEach((element) => {
    const bufferGeom = element.mesh.geometry;

    let positionArray = Array.from(bufferGeom.attributes.position.array);
    const indicesArray = Array.from(bufferGeom.index.array);

    geometry.push({
      position: positionArray,
      indices: indicesArray,
    });
  });

  return geometry;
};
/**
 * Indexer must have processed the model before entering here
 */
export const getIfcPsetsById = async (
  model: FragmentsGroup,
  indexer: OBC.IfcRelationsIndexer,
  id: number
) => {
  const psets: Pset[] = [];

  const psetsExpressIds = indexer.getEntityRelations(model, id, "IsDefinedBy");

  for (const expressID of psetsExpressIds) {
    const pset = await model.getProperties(expressID);
    if (pset) {
      const curPsetTitle = pset["Name"]?.value || " ";

      const curPset: Pset = {
        title: curPsetTitle,
        content: [],
      };

      await OBC.IfcPropertiesUtils.getPsetProps(
        model,
        expressID,
        async (propExpressID) => {
          const prop = await model.getProperties(propExpressID); //values
          if (prop) {
            const propName = prop["Name"]?.value || " ";
            const propValue = prop["NominalValue"]?.value ?? " ";
            curPset.content.push({ [propName]: propValue });
          }
        }
      );
      psets.push(curPset);
    }
  }
  return psets;
};
