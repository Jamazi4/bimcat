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
