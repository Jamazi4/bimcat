ShadCN dialog overflow workaround

```
<Dialog>
  <DialogTrigger asChild>
    <Button variant={"ghost"} title={"Text""} />
  </DialogTrigger>
  <DialogContent className={"lg:max-w-screen-lg overflow-y-scroll max-h-screen"}>
   todo...
  </DialogContent>
</Dialog>
```

TO DO: 0. Layout - propsets size in creator

1. PSETS - add support for bool values (frontend) - maybe differentiate between types of properties (backend) - don't allow to save empty pset
2. LOADING FILES/COMPONENTS - fix component placement, maybe add modification option - rename component
3. Libraries - user assigned or public libraries of elements - private/public - owner functionality - add/remove users, add/remove components
4. USERS - delete user
5. General - add fallbacks and error screens - styling for mobile - navbar and data tables

Idea:
BIM application for managing 3D BIM components.
features:

- Model viewer where you pick which components to add to your library
- Component editor where you modify geometry parametrically and edit psets
- Parametric workshop where you can create parametrical constraints so users can use them for modyfing the components
  think of something ai

![[Pasted image 20250311232620.png]]

https://ifc43-docs.standards.buildingsmart.org/IFC/RELEASE/IFC4x3/HTML/lexical/IfcPropertySingleValue.htm

https://ifc43-docs.standards.buildingsmart.org/IFC/RELEASE/IFC4x3/HTML/lexical/IfcSimpleValue.htm

also quantities

- maybe differentiate between types of properties
- don't allow to save empty pset

-- Validation service throws warning here: read 'description'
https://github.com/buildingSMART/IFC4.x-IF/tree/header-policy/docs/IFC-file-header#description

---

### **Rendering `FragmentsGroup` in R3F (`react-three-fiber`)**

Here’s how you can integrate it inside your `Canvas`:

```tsx
"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { FragmentsGroup, FragmentMesh } from "web-ifc-three";
import * as THREE from "three";

const FragmentsComponent = () => {
  const { scene } = useThree();
  const fragmentsRef = useRef<FragmentsGroup | null>(null);

  useEffect(() => {
    const fragments = new FragmentsGroup();
    fragmentsRef.current = fragments;
    scene.add(fragments);

    // Example: Create a sample fragment mesh (replace with actual IFC fragment data)
    const material = new THREE.MeshStandardMaterial({ color: "blue" });
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const fragment = new FragmentMesh(geometry, material);
    fragments.add(fragment); // Add fragment to group

    return () => {
      scene.remove(fragments);
    };
  }, [scene]);

  return null; // Nothing to render, it's added to the scene
};

const Visualizer = () => {
  return (
    <Canvas camera={{ position: [5, 5, 5] }}>
      <ambientLight intensity={1.5} />
      <OrbitControls enableZoom={true} />
      <FragmentsComponent />
    </Canvas>
  );
};

export default Visualizer;
```

---

### **Key Points**

1. **Using `FragmentsGroup` from `web-ifc-three`**
   - This allows handling fragment-based rendering efficiently in IFC.js.
2. **Why `useEffect`?**

   - Since `FragmentsGroup` is a Three.js class and not a React component, we need to manually manage its lifecycle.

3. **Why `FragmentMesh`?**
   - `FragmentMesh` is the actual mesh that belongs to a fragment. In real cases, you'll load IFC fragment data dynamically.

---

### **Next Steps**

- **Load an IFC file into the `FragmentsGroup`** using `IFCLoader`.
- **Implement selection/highlighting** for fragment elements.
- **Optimize rendering** for large models using **BVH (Bounding Volume Hierarchy)**.

Would this work for you, or do you need help loading actual IFC data? 🚀

!! I'm not checking units, that's why if I load a file in meters - it will keep the same numbers but output the ifc file in milimeters resulting in 1000x size
psets in component picker too wide for phone

- dodać teamsy

current:

1. components dropdown not in the middle
2. when accessing component from library, change breadcrumbs somehow
3. add spinner when component browser currently is searching
4. locale date is wrong on prod
5. loading tsx is spinning top left corner
6. sonner styling for success and error (border color maybe) - link on upload - or uploading toast and success toast
7. duplicated psets sometimes - also opens both

now added /libraries/[libraryId]/[componentId], which is the same as components/browser/[id]. Need to send to correct link in ComponentList.tsx on handleRowClick

library browser

- no private, but editable would be good - non-editable as button to create copy
- search bar, make component copy
- add users or share library via link, current users - on link click add user to
- if private component added to public library - ask component toggle private
- for entering library - 'private' doesn't matter for component

libraries:

- labels? also for components would be good
- Your libraries checkbox
- searchbar
- either toggleprivate/delete or favorites

on favorite - become guest user - for invitation to library auto fav, removing fav is going out of library. Owner can't add to fav

Plan:
Components:

- persist search params
  Libraries:
- add to faves (become guest user)
- search library / your libraries / fav libraries (in which I'm a guest user)
  LibraryBrowser:
- add to faves
- searchBar, share library,

edge cases:

- user already has library of that name
- user already has component of that name(?)
- switch library public if contains private components
- add private component to public library
- component already in library

switch library private when it already has guests

Right now:
just managed to add warning when selected library is public but selected component are private. This automaticall changes the component "public" field. It is still possible to change the component to public afterwards.

Maybe warning that it will remove it from the public libraries and will have to be added back manually.

now I can have some components that are public, someone adds them to a library and then I switch them to private.

if component is added to a library it has to persist in the exact state no matter what. Notify to make a copy and change the name.

## Ultimate library/component rules

1. You can create private or public component and toggle the private attribute at any time
   a. If you change the component to private - it will be removed from your public library if it's in any
2. you can create private or public library and toggle the private attribute at any time
   a. If you change public library to private, all users that subscribed to the library will still be allowed to see it
   b. If you change private library to public - all private components inside (if any) will automatically become public(???)
3. You can add both public (anybody's) and private (your own) components to your libraries
   a. If library is public, and you are adding your own private component - component will toggle to public(done).
   b. If you add someone elses component to your own library - it will create your own copy of that component, component will automatically have the same privacy setting as the library

library name unique? component name unique?

fuck i need organizations(?)

the workflow of actions where modal is displayed until success vs modal closes and original button spins can be useful when I want to allow user to redo something if action fail, for example name already taken or pset already exists

Next step - remove component from public library if user switches it from public to private

teraz na backendzie usuwanie componentów z publicznych bibliotek jeśli użytkownik zmienia te komponenty na prywatne. Potem za zmiane privacy of libraries się weź.

_THE TOAST TRIGGERS ONLY ON SOME REMOVE PSET ACTIONS IDK WHY_
