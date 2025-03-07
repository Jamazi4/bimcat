import * as OBC from "@thatopen/components";
import { FragmentMesh } from "@thatopen/fragments";
import * as WEBIFC from "web-ifc";

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

/*
export const getPsets = async (
  model: FragmentsGroup,
  indexer: OBC.IfcRelationsIndexer
) => {
  const firstElement = model.children[0] as FragmentMesh;
  const ids = firstElement.fragment.ids;
  const idsIterator = ids.values();
  const firstId = idsIterator.next();
  
  const data = firstElement.geometry;
  const verts = Array.from(data.attributes.position.array);
  const faces = Array.from(data.index.array);
  

 const geom = await createGeometryAction({
   position: verts,
   indices: faces,
  });
  console.log("ADDED THE GEOM: ", geom);
  
  await indexer.process(model);
  if (firstId.value) {
    // console.log("SUCCESS!!!!");
    
    const attributes = await model.getProperties(firstId.value); //attributes
    // console.log(attributes);
    
    const psets = indexer.getEntityRelations(
      model,
      firstId.value,
      "IsDefinedBy"
    );
    // console.log(psets);
    for (const expressID of psets) {
      // You can get the pset attributes like this
      const pset = await model.getProperties(expressID);
      
      // console.log(pset); // pset

      await OBC.IfcPropertiesUtils.getPsetProps(
        model,
        expressID,
        async (propExpressID) => {
          const prop = await model.getProperties(propExpressID); //values

          // console.log(prop);
        }
      );
    }
  }
};
*/

/**
 * Returns vertices and faces of the first mesh in the file in three
 * BufferGeometry format as number[]
 *
 * @param file
 * @returns {position: number[], indices: number[]}
 */
export const getIfcGeometry = async (file: File) => {
  const data = await file.arrayBuffer();
  const buffer = new Uint8Array(data);
  const { loader, indexer } = await getFragmentLoader();

  const webIfc = new WEBIFC.IfcAPI();
  webIfc.SetWasmPath("https://unpkg.com/web-ifc@0.0.66/", true);
  await webIfc.Init();

  const model = await loader.load(buffer);
  const firstElement = model.children[0] as FragmentMesh;
  const bufferGeom = firstElement.geometry;
  const position = Array.from(bufferGeom.attributes.position.array);
  const indices = Array.from(bufferGeom.index.array);

  return { position, indices };
};
