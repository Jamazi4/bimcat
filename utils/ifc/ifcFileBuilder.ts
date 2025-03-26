import { type ComponentGeometry } from "../types";
import { createGuid } from "../createGuid";
import * as WEBIFC from "web-ifc";
import { Pset } from "../types";

export const downloadIfcFile = async (
  geometry?: ComponentGeometry[],
  psets?: Pset[]
) => {
  if (!geometry) throw new Error("Could not get the object geometry");
  if (!psets) throw new Error("Could not get the object psets");

  const ifcApi = new WEBIFC.IfcAPI();
  ifcApi.SetWasmPath("https://unpkg.com/web-ifc@0.0.66/", true);
  await ifcApi.Init();

  const newIfcModel: WEBIFC.NewIfcModel = {
    schema: WEBIFC.Schemas.IFC4,
    name: "Model",
    description: ["ViewDefinition [IFC4Precast]"],
    authors: ["Jakub Zimnoch"],
    organizations: [""],
    authorization: "None",
  };

  const modelId = ifcApi.CreateModel(newIfcModel);

  // // IfcOrganization
  // const org = new WEBIFC.IFC4.IfcOrganization(
  //   null,
  //   new WEBIFC.IFC4.IfcLabel("Jakub"),
  //   null,
  //   null,
  //   null
  // );

  // // IfcApplication
  // const app = new WEBIFC.IFC4.IfcApplication(
  //   org,
  //   new WEBIFC.IFC4.IfcLabel("0.0.1"),
  //   new WEBIFC.IFC4.IfcLabel("BIMCat"),
  //   new WEBIFC.IFC4.IfcLabel("app")
  // );

  // Units
  // prettier-ignore
  const lengthUnit = new WEBIFC.IFC4.IfcSIUnit(
    WEBIFC.IFC4.IfcUnitEnum.LENGTHUNIT,
    WEBIFC.IFC4.IfcSIPrefix.MILLI,
    WEBIFC.IFC4.IfcSIUnitName.METRE
  );

  const unitAssignment = new WEBIFC.IFC4.IfcUnitAssignment([lengthUnit]);

  // Geometrical representation
  const originCoords = [
    new WEBIFC.IFC4.IfcLengthMeasure(0.0),
    new WEBIFC.IFC4.IfcLengthMeasure(0.0),
    new WEBIFC.IFC4.IfcLengthMeasure(0.0),
  ];

  const cartPoint = new WEBIFC.IFC4.IfcCartesianPoint(originCoords);

  // const dirCoords = [
  //   new WEBIFC.IFC4.IfcLengthMeasure(0.0),
  //   new WEBIFC.IFC4.IfcLengthMeasure(0.0),
  //   new WEBIFC.IFC4.IfcLengthMeasure(1.0),
  // ];

  // const dir = new WEBIFC.IFC4.IfcDirection(dirCoords);

  const axis = new WEBIFC.IFC4.IfcAxis2Placement3D(cartPoint, null, null);

  const geomContext = new WEBIFC.IFC4.IfcGeometricRepresentationContext(
    new WEBIFC.IFC4.IfcLabel("3D context"),
    new WEBIFC.IFC4.IfcLabel("Model"),
    new WEBIFC.IFC4.IfcDimensionCount(3),
    null,
    axis,
    null
  );

  // prettier-ignore
  const geomSubcontext = new WEBIFC.IFC4.IfcGeometricRepresentationSubContext(
    new WEBIFC.IFC4.IfcLabel("Body"),
    new WEBIFC.IFC4.IfcLabel("Model"),
    geomContext,
    null,
    WEBIFC.IFC4.IfcGeometricProjectionEnum.MODEL_VIEW,
    null
  );

  const proj = new WEBIFC.IFC4.IfcProject(
    new WEBIFC.IFC4.IfcGloballyUniqueId(createGuid()),
    null,
    new WEBIFC.IFC4.IfcLabel("project"),
    new WEBIFC.IFC4.IfcLabel("project desc"),
    null,
    null,
    null,
    [geomContext],
    unitAssignment
  );

  const convertedVertices: WEBIFC.IFC4.IfcLengthMeasure[][] = [];

  const shapereps: WEBIFC.IFC4.IfcShapeRepresentation[] = [];

  geometry.forEach((geom) => {
    let curVert: WEBIFC.IFC4.IfcLengthMeasure[] = [];
    geom.position.forEach((val, index) => {
      const lengthMeasue = new WEBIFC.IFC4.IfcLengthMeasure(val);
      curVert.push(lengthMeasue);
      if ((index + 1) % 3 === 0) {
        convertedVertices.push(curVert);
        curVert = [];
      }
    });

    const cartesianPointList = new WEBIFC.IFC4.IfcCartesianPointList3D(
      convertedVertices // verts here
    );

    const convertedFaces: WEBIFC.IFC4.IfcPositiveInteger[][] = [];
    let curFace: WEBIFC.IFC4.IfcPositiveInteger[] = [];

    geom.indices.forEach((val, index) => {
      const positiveInteger = new WEBIFC.IFC4.IfcPositiveInteger(val + 1);
      curFace.push(positiveInteger);
      if ((index + 1) % 3 === 0) {
        convertedFaces.push(curFace);
        curFace = [];
      }
    });

    const triangulatedFaceset = new WEBIFC.IFC4.IfcTriangulatedFaceSet(
      cartesianPointList,
      null,
      new WEBIFC.IFC4.IfcBoolean(true),
      convertedFaces, // faces here
      null
    );

    const shapeRepresentation = new WEBIFC.IFC4.IfcShapeRepresentation(
      geomSubcontext,
      new WEBIFC.IFC4.IfcLabel("Body"),
      new WEBIFC.IFC4.IfcLabel("Tessellation"),
      [triangulatedFaceset]
    );

    shapereps.push(shapeRepresentation);
  });

  const axis2Placement3d = new WEBIFC.IFC4.IfcAxis2Placement3D(
    cartPoint,
    null,
    null
  );

  const localPlacement = new WEBIFC.IFC4.IfcLocalPlacement(
    null,
    axis2Placement3d
  );

  const productDefinitionShape = new WEBIFC.IFC4.IfcProductDefinitionShape(
    null,
    null,
    shapereps
  );

  const buildingElementProxy = new WEBIFC.IFC4.IfcBuildingElementProxy(
    new WEBIFC.IFC4.IfcGloballyUniqueId(createGuid()),
    null,
    new WEBIFC.IFC4.IfcLabel("Component"),
    null,
    null,
    localPlacement,
    productDefinitionShape,
    null,
    null
  );

  const building = new WEBIFC.IFC4.IfcBuilding(
    new WEBIFC.IFC4.IfcGloballyUniqueId(createGuid()),
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null
  );

  const relContainedInSpatialStructure =
    new WEBIFC.IFC4.IfcRelContainedInSpatialStructure(
      new WEBIFC.IFC4.IfcGloballyUniqueId(createGuid()),
      null,
      null,
      null,
      [buildingElementProxy],
      building
    );

  const relAggregates = new WEBIFC.IFC4.IfcRelAggregates(
    new WEBIFC.IFC4.IfcGloballyUniqueId(createGuid()),
    null,
    null,
    null,
    proj,
    [building]
  );

  // ifcApi.WriteLine(modelId, org);
  // ifcApi.WriteLine(modelId, app);
  ifcApi.WriteLine(modelId, unitAssignment);
  ifcApi.WriteLine(modelId, cartPoint);
  // ifcApi.WriteLine(modelId, dir);
  ifcApi.WriteLine(modelId, geomContext);
  ifcApi.WriteLine(modelId, building);
  ifcApi.WriteLine(modelId, relContainedInSpatialStructure);
  ifcApi.WriteLine(modelId, proj);
  ifcApi.WriteLine(modelId, relAggregates);
  ifcApi.WriteLine(modelId, buildingElementProxy);

  //PSETS

  psets.forEach((pset) => {
    const { title, content } = pset;
    if (content.length === 0) return;

    const propertiesArray: WEBIFC.IFC4.IfcPropertySingleValue[] = [];

    content.forEach((entry) => {
      Object.entries(entry).forEach(([key, value]) => {
        const propertySingleValue = new WEBIFC.IFC4.IfcPropertySingleValue(
          new WEBIFC.IFC4.IfcIdentifier(key),
          null,
          new WEBIFC.IFC4.IfcIdentifier(value),
          null
        );
        ifcApi.WriteLine(modelId, propertySingleValue);
        propertiesArray.push(propertySingleValue);
      });
    });

    const propertySet = new WEBIFC.IFC4.IfcPropertySet(
      new WEBIFC.IFC4.IfcGloballyUniqueId(createGuid()),
      null,
      new WEBIFC.IFC4.IfcIdentifier(title),
      null,
      propertiesArray
    );

    ifcApi.WriteLine(modelId, propertySet);

    const relDefinesByProperties = new WEBIFC.IFC4.IfcRelDefinesByProperties(
      new WEBIFC.IFC4.IfcGloballyUniqueId(createGuid()),
      null,
      null,
      null,
      [buildingElementProxy],
      propertySet
    );
    ifcApi.WriteLine(modelId, relDefinesByProperties);
  });

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
