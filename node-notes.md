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
