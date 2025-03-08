import * as OBC from "@thatopen/components";
import { FragmentMesh, FragmentsGroup } from "@thatopen/fragments";
import * as WEBIFC from "web-ifc";
import { Pset } from "./types";

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

  const webIfc = new WEBIFC.IfcAPI();
  webIfc.SetWasmPath("https://unpkg.com/web-ifc@0.0.66/", true);
  await webIfc.Init();

  return await loader.load(buffer);
};

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
    // const attributes = await model.getProperties(firstId); //attributes
    // if (attributes) {
    //   psets.push({ title: "attributes", content: [attributes] });
    // }

    // console.log("attributes", attributes);

    const psetsExpressIds = indexer.getEntityRelations(
      model,
      firstId,
      "IsDefinedBy"
    );

    for (const expressID of psetsExpressIds) {
      // You can get the pset attributes like this
      const pset = await model.getProperties(expressID);
      if (pset) {
        const curPsetTitle = pset["Name"]?.value || "";

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
              console.log(prop);
              const propName = prop["Name"]?.value || "";
              const propValue = prop["NominalValue"]?.value ?? "";
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
 * Returns vertices and faces of the first mesh in the file in three
 * BufferGeometry format as number[]
 *
 * @param file
 * @returns {position: number[], indices: number[]}
 */
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
