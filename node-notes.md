# Node Editor

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

## General

the problems to solve can be divided into two categories:

Runtime:

- cache node outputs
- solidify node, transform node with translate/scale/angles or quaternion,
- change/lock inputs conditionally
- pick reference from 3D

UI:

- combo needs to support boolean
- highlight wrong links - at least to wrong input type will be easy - then also
  eval errors
- lock node menu buttons
- for extrude remove buffer positions ending up as not a part of indices
- color picker in output node
- addNode menu to have search
- ctrl-z and ctrl-r

additionally some tools that might need adding

- measure tool
- expose var (so it's adjustable in the browser) and dynamic props
- don't allow to open node editor/don't fetch node project if not author

done:

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

AI reverse engineering geometry to nodes

matrix X (node type hot encoded) x Y (number of nodes) let's say max 20? x
Z (Z dim = Y dim = connectivity)
above idea doesn't capture values in nodes...

loss based on both generated geom accuracy(not differentiable?) and node scheme
