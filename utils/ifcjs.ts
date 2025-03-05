import * as OBC from "@thatopen/components";
// import * as WEBIFC from "web-ifc";
//fragmentIfcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;

export const getFragmentLoader = async () => {
  const components = new OBC.Components();
  components.init();
  const fragments = components.get(OBC.FragmentsManager);
  const fragmentIfcLoader = components.get(OBC.IfcLoader);

  // fragmentIfcLoader.settings.wasm = {
  //   path: "web-ifc/web-ifc.wasm", // Make sure this points to the correct location
  //   absolute: true,
  // };

  await fragmentIfcLoader.setup();
  return [fragments, fragmentIfcLoader];
};
