import * as OBC from "@thatopen/components";
import { FragmentMesh, FragmentsGroup } from "@thatopen/fragments";
import * as WEBIFC from "web-ifc";
import { Pset } from "./types";
import { v4 as uuidv4 } from "uuid";

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

/**
 * Combines the functions to get geometry and psets
 */
export const getIfcData = async (file: File) => {
  const { loader, indexer } = await getFragmentLoader();
  const model = await getIfcModel(file, loader);
  const geometry = await getIfcGeometry(model);
  const psets = await getIfcPsets(model, indexer);

  return { geometry, psets };
};

export const downloadIfcFile = async () => {
  const ifcApi = new WEBIFC.IfcAPI();
  ifcApi.SetWasmPath("/web-ifc/");
  await ifcApi.Init();

  const newIfcModel: WEBIFC.NewIfcModel = {
    schema: WEBIFC.Schemas.IFC4X3,
    name: "Model",
    description: ["demo ifc model"],
    authors: ["Jakub Zimnoch"],
    organizations: [],
  };

  const modelId = ifcApi.CreateModel(newIfcModel);

  // IfcOrganization
  const org = new WEBIFC.IFC4X3.IfcOrganization(
    null,
    new WEBIFC.IFC4X3.IfcLabel("Jakub"),
    null,
    null,
    null
  );

  // IfcApplication
  const app = new WEBIFC.IFC4X3.IfcApplication(
    org,
    new WEBIFC.IFC4X3.IfcLabel("0.0.1"),
    new WEBIFC.IFC4X3.IfcLabel("BIMCat"),
    new WEBIFC.IFC4X3.IfcLabel("app")
  );

  // Units
  // prettier-ignore
  const cubicMetre = new WEBIFC.IFC4X3.IfcSIUnit(
    WEBIFC.IFC4X3.IfcUnitEnum.VOLUMEUNIT,
    WEBIFC.IFC4X3.IfcSIPrefix.MILLI,
    WEBIFC.IFC4X3.IfcSIUnitName.CUBIC_METRE
  );

  const unitAssignment = new WEBIFC.IFC4X3.IfcUnitAssignment([cubicMetre]);

  // Geometrical representation
  const originCoords = [
    new WEBIFC.IFC4X3.IfcLengthMeasure(0),
    new WEBIFC.IFC4X3.IfcLengthMeasure(0),
    new WEBIFC.IFC4X3.IfcLengthMeasure(0),
  ];

  const cartPoint = new WEBIFC.IFC4X3.IfcCartesianPoint(originCoords);

  const dirCoords = [
    new WEBIFC.IFC4X3.IfcLengthMeasure(0),
    new WEBIFC.IFC4X3.IfcLengthMeasure(0),
    new WEBIFC.IFC4X3.IfcLengthMeasure(1),
  ];

  const dir = new WEBIFC.IFC4X3.IfcDirection(dirCoords);

  const axis = new WEBIFC.IFC4X3.IfcAxis2Placement2D(cartPoint, dir); //maybe 3d?

  const geomContext = new WEBIFC.IFC4X3.IfcGeometricRepresentationContext(
    new WEBIFC.IFC4X3.IfcLabel("3D context"),
    new WEBIFC.IFC4X3.IfcLabel("Model"),
    new WEBIFC.IFC4X3.IfcDimensionCount(3),
    null,
    axis,
    dir
  );

  const proj = new WEBIFC.IFC4X3.IfcProject(
    new WEBIFC.IFC4X3.IfcGloballyUniqueId(uuidv4()), //ref tutorial
    null,
    new WEBIFC.IFC4X3.IfcLabel("project"),
    new WEBIFC.IFC4X3.IfcLabel("project desc"),
    null,
    null,
    null,
    [geomContext],
    unitAssignment
  );

  //TODO buidling, relcontainedinspatialstructure, relaggregates

  /*
  const cartesianPointList = new WEBIFC.IFC4X3.IfcCartesianPointList3D(
    [[new WEBIFC.IFC4X3.IfcLengthMeasure()]], // verts here
    null
  );

  const triangulatedFaceset = new WEBIFC.IFC4X3.IfcTriangulatedFaceSet(
    cartesianPointList,
    new WEBIFC.IFC4X3.IfcBoolean(true),
    null,
    [[new WEBIFC.IFC4X3.IfcPositiveInteger()]], // faces here
    null
  );

  const shapeRepresentation = new WEBIFC.IFC4X3.IfcShapeRepresentation(
    geomContext,
    new WEBIFC.IFC4X3.IfcLabel("Body"),
    new WEBIFC.IFC4X3.IfcLabel("Tesselation"),
    [triangulatedFaceset]
  );

  const axis2Placement3d = new WEBIFC.IFC4X3.IfcAxis2Placement3D(
    cartPoint,
    null,
    null
  );

  const localPlacement = new WEBIFC.IFC4X3.IfcLocalPlacement(
    null,
    axis2Placement3d
  );

  const productDefinitionShape = new WEBIFC.IFC4X3.IfcProductDefinitionShape(
    null,
    null,
    [shapeRepresentation]
  );

  const buildingElementProxy = new WEBIFC.IFC4X3.IfcBuildingElementProxy(
    new WEBIFC.IFC4X3.IfcGloballyUniqueId(uuidv4()),
    null,
    null,
    null,
    null,
    localPlacement,
    productDefinitionShape,
    null,
    null
  );
  */

  ifcApi.WriteLine(modelId, org);
  ifcApi.WriteLine(modelId, app);
  ifcApi.WriteLine(modelId, unitAssignment);
  ifcApi.WriteLine(modelId, cartPoint);
  ifcApi.WriteLine(modelId, dir);
  ifcApi.WriteLine(modelId, geomContext);
  ifcApi.WriteLine(modelId, proj);

  const bin = ifcApi.SaveModel(modelId);

  const blob = new Blob([bin], { type: "application/octet-stream" });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "model.ifc";
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
