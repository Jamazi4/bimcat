import * as OBC from "@thatopen/components";
import { FragmentMesh, FragmentsGroup } from "@thatopen/fragments";
import { Pset } from "../types";

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
