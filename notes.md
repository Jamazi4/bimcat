0. Layout - propsets size in creator
1. PSETS - add support for bool values (frontend) - maybe differentiate between types of properties (backend) - don't allow to save empty pset
2. LOADING FILES/COMPONENTS - fix component placement, maybe add modification option - rename component
3. Libraries - user assigned or public libraries of elements - private/public - owner functionality - add/remove users, add/remove components
4. USERS - delete user
5. General - add fallbacks and error screens - styling for mobile - navbar and data tables

also quantities

- maybe differentiate between types of properties
- don't allow to save empty pset

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

switch library private when it already has guests

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

known issue: the last pset won't trigger toast on removal -
instead of form do it as removeComponentButton but with optimistic ui update
