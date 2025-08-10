# Node Editor

## Geometry processing and node rules

### Geometry processing

- all buffer geometry output should have position, index and normal attributes
  but no uv
- linestring is a nested array of vectors. each array is one connected linestring

### Node

- node values of index >= 100 are list inputs, where 100 is the index of the
  parent list input

## DIARY

### --08-06-2025--

just added a button that appears when user selects "create" from component menu
need to think of creating a node-project prisma schema and add
nodes?: node project which will contain Noses[] and Edges[], it will be an
optional field in normal component.

componentPicker route will have componentId as an optional parameter, so
when user creates an empty object it will save it with empty node project

added useNodeEditor to utils, now need to add DragableNode component to render

but first I think it should open a dialog to ask for a name, and then add the
componentId to the route. only then it can be saved

### --09-06-2025--

edited prisma schema and created zod schemas for node, edge and node project
this is now an optional field in component model. Now to trigger component
creation dialog when clicking on create to save it with an empty psets, geom and
node project.
node project will start off with an output node.

### --10-06-2025--

now it creates a new component when I use create in componentPicker. It creates
component with empty nodeProject.
Now before I start with that I need to create exit nodemode and switch navigation
and also create an initial node with object.

### --14-06-2025--

component picker is now visualiser and currently I get the componentId in the
nodeEditor, need to fetch component with node project

### --15-06-2025--

ok now it fetches correct node project, it validates it nd displays a draggable
node. Added /nodes/utils.ts with object defining nodes that I search based on
type.

Now addnodemenu so I can select a node type to add

need to create exit node mode, actual panning and zooming, switching nav mode
saving node project

add button to open node project from browser.

### --16-06-2025--

Today only fixed error, couldnt remove components with node projects because
of connection, reversed the relation and added cascade on delete

### --18-06-2025--

Yesterday implemented add node and save button which updated node project, also
need to support enter to trigger the create component

in near future need to be able to enter the node project from component page.
button over renderer to open in node editor. it just needs to go to visualiser
with correct componentId

probably good to get those with tanstack query

### --19-06-2025--

Added number node, it works and saves the value to the server, it fetches
correctly.

shaky system, might break...

now need to connect nodes and implement basic processing

milestone: make point appear in 3d

first step: click on output and render temp edge following mouse

oh my fucking god: selecting node, box select, drag multiple, copy paste delete
pan zoom

### --22-06-2025--

now I have references to all the node slots, copied some boilerplate to set
it up in useNodeSystem and created EdgeLine.tsx

### --23-06-2025--

Now the temp edge appears when user starts dragging, next make it connect
to the slot under the cursor on mouse up

next step is to display temp line on clicking the output slot

### --24-06-2025--

Now connecting works, I can start implementing the runtime and mesh generation

also just to remember: need to be able to open node editor in the browser,
remove main menu when node editor and exiting node editor?

add measuring tool

### --27-06-2025--

forgot to mention I implemented creating point with nodes!

now I'm implementing zooming and soon also panning. Need to figure out why
edges no loger highlight on hover

### --28-06-2025--

panning and zooming now works perfectly. ALMOST - newly created nodes point to
slightly wrong node slot local coords

I think that before implementing the next nodes or logic I need to implement
box selection and copy, delete, move selected

### --30-06-2025--

now selecting, deleting copying and pasting works.

Additionally there's now new AST generation workflow to handle mesh generation

### --01-07-2025--

Now you can save geometry to the DB and open node editor from /browse

button needs hiding for components without node project

### --03-07-2025--

button now displays conditionally

I need to create a new nodeOutputType which is shape - capped/noCapped

now working on a circle

Idea next is solidify and support for multiple elements
at some point it would be awesome to create dynamic attributes and expose
parameters to ui

what I absolutely need to do is to cache the nodes, recompute only what changed
and update only when values or edges change

### --05-07-2025--

so far - managed to stop recalculating them each time a node moves.
also added support for multiple output nodes

### --06-07-2025--

color coded inputs, categorized the addNode menu
gemini optimized rendering the draggable node
boolean switches now supported
now I can do default values for nodes

changed node values to be objects and now it supports values "inline" along
slots within one node

Now I want to control the output type of plane if user selects closed: false
so that output changes from mesh to linestring

plan to do it is following:
add optional field to NodeInputType and define it in the nodeDefinition -
it will be smth like "controlsOutput" and it will be an object like:
{"true" : 5, "false": 6}
then I will conditionally render (in DraggableNode) either output with
index 5 or 6.
separately this value will be used to change processing of nodeDef function

two main challanges now are:

- adding more inputs to things like linestring
- switching or conditionally disabling inputs - extrude for example

### --07-07-2025--

now multiple inputs are possible (plane can also output a string), types a bit
more strict and edges with a better visibility

now ideally I'd lock input conditionally or change it when I switch a bool or
sth. The idea is to have one extrude that can work both for mesh and linestring

also want to add color picker for output and position for circle,
evenutaly create a transform node that will be taken for plane and circle
that will contain rotation, scale and translate.

Maybe plane middle should be plane center?

### --08-07-2025--

cosmetics and removing edge that leads to the same slot
shift select
combo inputs are working in new vector node!

### --09-07-2025--

combo added to vector and plane, some more cosmetics making nodes bigger.
two burning things are - transform node and conditional input slot

now panning is on rmb

REFACTORED THE FUNCS TO GET VALS - UPDATE REST OF NODES

added extrudeTest to test out interchangeable inputs.
slot now has optional input groupIndex.
slots with the same groupIndex will be rendered

### --10-07-2025--

before anything else: finish group input - go back to combo and add support for
bool

solved issue where I broke rerendering stability of nodes by calculating
connectedSlotIds.

I need to think about all possible situations

- default value for switch input (should be handled out of the box).
- other switch inputs than slots?
- automatic output switch?

unfortunately the switch input can only be slot for now, as it saves active
input as node value where key is inputId and value is bool indicating if slot
is active

### --11-07-2025--

So now the group input works. Only for slots but works.

Implemented extrude node again and gemini did the manual indexing as
ConvexGeometry closed all faces. This is not a good long term approach.
Need to come up with custom method for doing a standardized approach to
triangulation.

Also currently the switch works even if I connect the wrong type.

### --12-07-2025--

Refactored all node inputs and outputs to separate files. Did the same with
nodes, nodes file now serves only as a collector.

extrude is all messed up all the time.

extrude is all good now. Now I need to implement conditional output.
it will output linestring as a second output from extrude when input is
linestring and will output mesh when input is mesh

solved issue with extruding circle

tomorrow work on this conditional output and then straight to transform

### --13-07-2025--

conditional and transform implemented
added capped bool to extrude to allow for capped/uncapped

!!When extruding inside of cylinder - it creates faces for every edge!!

transform and scale point of reference is broken

now add group node to group all extrusion chains
add math nodes
expose controls to UI and implement dynamic props
boolean

### --14-07-2025--

extrusion finally debugged and transform scale point of reference too.
now need to think about the output of linestring. Because it can output two
linestrings from extrude. Right now they are connected by an edge. (example of
pipe extruded inwards and linestring extrusion output.)

--this needs fixing--
okay extrusion still a bit bugged: when extruding from capped and rotation
applied - one wall in circle is not rendered

uncapped mesh based extrusion output gives additional edge in cylinder insides
probably needs multiple linestrings output

lighting
--this needs fixing--

think about applying transform because now it doesn't make sense? probably
correct way is to multiply the transform by normal vector of prev face -
correct now because now I'm transforming to the global coords, I can
output normal from extrusion and multiply the transform to get local

the extrude geometry seems not to be indexed for some reason- fixed

### --15-07-2025--

extrude debugging -
component :

--Linestring-Extrusion-Bugs--
has bugs in planes and cylinder:

make use of three-mesh-bvh and replace orderBoundaryEdges and
extractBoundaryEdges.

mess with merging vertices.

a lot of redundant code and flags done by gemini - tidy it up

### --19-07-2025--

Still redoing extrude node from scratch. A lot of logic works, but just changed
linestring type to be a list of lists of vectors. Need to refactor extrusion
logic to handle that.

### --20-07-2025--

it's still in progress -

### --26-07-2025--

Seems like working - now complete extrude node with correct outputs under
correct conditions

### --29-07-2025--

last extrusion error - earcut not working for 90 degree linestring cap

now group input changes it's type automatically if allowed output is connected

you can't connect wrong inputs to outputs anymore

### --30-07-2025--

Start working on group node

### --31-07-2025--

Group node progress. Now list inputs work in frontend. Need to allow user to
delete additional slots by hand or remove automatically?

### --02-08-2025--

adding delete button to group node dynamic virtual slots

Things to remember now: group input only works for group slots right now.

now start on making the logic for group node work

### --03-08-2025--

so group node is done and it works automatically.

[X] THE EXTRUDE CAPPING FOR LINESTRINGS DOES NOT WORK CORRECTLY FOR GROUP
[X] and the edges are deleted from non-list inputs on switchGroupInputActive
[X] copied group node needs to clear it's values

### --05-08-2025--

now math nodes!

also the nodeNavigation flag is now done using redux - move more state to redux

### --06-08-2025--

added scalar math node with new select input (no slot)
Now work on displaying

### --07-08-2025--

work on displaying connected value in combo input
displaying now works: here's how.

In the evaluateAST function I store the output values for all number outputs
in redux as nodeId: {outputId: value}

then in draggableNode under comboInput map I pass in connecting node and
connecting slot (i get that from filtering edges)

And if the slot is connected I switch the value to the one from redux

tomorrow think of optimizing this and:
also add slider node

### --09-08-2025--

So because the node output value for numbers is assigned at evaluateAST - I
can't make the disconnected nodes to update the value. So for now it doesn't
do that.

I think that the next thing is to add bool combo output and vector nodes.

also solve the issues of deleting and copying the node project with component

only fixed deleting node values from redux state and copying them - also fixed
id for virtual nodes and not storing values inside

okay now combo can handle boolean

planes and extruded geometry don't work in one group:

`groupNode.ts:54 THREE.BufferGeometryUtils: .mergeGeometries() failed with
geometry at index 1. Make sure all geometries have the same number of
attributes. function @ groupNode.ts:54`

### --10-08-2025--

so far - copying and deleting component now handles node project
database purged
planes and circles now don't output 'uv' attribute in buffergeom

slider done.

vector math (would be best with get vector?) get length would be also good
but that's the best when I already have pick edge and pick face.

#### plan for ui controls

- 'EXPOSE' node would have a number/bool input and a string input for control
  name and no output
- it would store the node id of connected node
- on component save it would save additional field into component:
  a. control name
  b. control type (number, slider, bool)
  c. cur val (or start, stop, step curval for slider)
  d. node id
- on opening component add button to enable controls.
- on enable controls the stored geom disappears and I spawn headless node
  runtime

### current plan

- finish group node - done
- apply list inputs to linestring node - done
- math nodes - progress/finish later?
- ui/pset nodes and component view integration

## General

BUGS:

- left-click on node
- enabled node menu buttons when not in node navigation
- ctrl-c not working in input fields

Runtime:

- cache node outputs
- now runtime has liveNodeIds - need to use this to store nodes output so eval
  doesn't go through the same node couple of times
- pick reference from 3D
- fill polygon node (triangulate)

UI:

- highlight wrong links - at least to wrong input type will be easy - then also
  eval errors
- lock node menu buttons
- color picker in output node
- addNode menu to have search - and display under right click
- ctrl-z and ctrl-shift-r
- measure tool
- expose var (so it's adjustable in the browser) and dynamic props

Nodes:

a. easy

- triangulate linestring (w/ holes?)
- apply transform
- get length/get area/ get volume
- add origin to transform node (and in transform object type)

b. hard

- boolean operations
- pick from 3D
- solidify
- subdivide?

done:

- delete component doesn't delete node project?
- copy component doesn't copy node project
- earcut doesn't work for completely vertical polygons
- delete node outputValue from state when output gets disconnected
- combo needs to support boolean
- group node
- ctrl-r or something to switch between node and 3d navigation
- capped/uncapped shapes
- remove edge if another is connected to the same slot
- multiple outputs
- icons/tooltips for input types // for now just color coded
- memoize draggable nodes to optimize rendering
- categories for add node menu
- add boolean input - switch
- shift + click to select and shift box select
- combo slot/input = input locks on connection
- left click in node editor to pan, hide context menu
- switching node type in real time (euler-quaternion and extrude mesh/linestring)
- for extrude remove buffer positions ending up as not a part of indices
- solidify(can do with extrude) node, transform node with
- translate/scale/angles or quaternion,
- change/lock inputs conditionally
- error when switching capped and the extrusion output is switching
