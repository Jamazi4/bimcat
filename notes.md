0. Layout - propsets size in creator
1. PSETS - add support for bool values (frontend) - maybe differentiate
   between types of properties (backend) - don't allow to save empty pset
2. LOADING FILES/COMPONENTS - show link to component in toast on creation/copy
3. Libraries - user assigned or public libraries of elements - private/public

- owner functionality - add/remove users, add/remove components

4. USERS - delete user
5. when accessing component from library, change breadcrumbs somehow
6. locale date is wrong on prod
7. sonner styling for success and error (border color maybe) - link on upload

- or uploading toast and success toast

8. duplicated psets sometimes - also opens both

edge cases:

- user already has library of that name
- user already has component of that name(?)
- switch library private when it already has guests

## Ultimate library/component rules

1. You can create private or public component and toggle the private attribute
   at any time

   - If you change the component to private - it will be removed from your
     public library if it's in any

2. you can create private or public library and toggle the private attribute
   at any time

   - If you change public library to private, all users that subscribed to the
     library will still be allowed to see it

   - If you change private library to public - all private components inside
     (if any) will automatically become public(???)

3. You can add both public and private components to your libraries, but only
   the ones you authored

   - If library is public, and you are adding your own private component -
     component will toggle to public(done).

   - If you add someone elses component to your own library - it will create
     your own copy of that component, component will automatically have the
     same privacy setting as the library

fuck i need organizations(?)

the workflow of actions where modal is displayed until success vs modal closes
and original button spins can be useful when I want to allow user to redo
something if action fail, for example name already taken or pset already exists

known issue: the last pset won't trigger toast on removal -
instead of form do it as removeComponentButton but with optimistic ui update

23.04.2025 - implemented copy component but because componentListWrapper
is now a client component and preserves the data in useState - it doesn't
revalidate. Maybe finally preserve the data in redux state and dispatch
refresh action -

24.04.2025 - revalidation solved by retriggering async thunk as browser
components now reside in redux state.

sharing library through a link - when user logs in under this link - they
will be assigned as guest.

Users can create their own private libraries of their own private components
and then share their libraries so another user can merge the libraries

You can only merge libraries that are shared with you, or are public

when a user merges your library with their own, you automatically become a
guest of this library.

a Composite Library will just keep references to all the libraries and track
changes all the changes. It will have one owner that can include or remove
sub-libraries from it.

Composite library will have different views, history log, they can be public
(all the components and libraries inside have to be public) or private
(components and libraries inside can be either public or private).

open book icon - your library
closed book icon - someone elses library
library icon - composite library

plan for all that:

[x] don't allow adding someone elses component to your library
[x] become guest of public libraries by clicking on a star

[x] now doing download ifc button - refactor to always dwnld zip file
[x] also finally fix breadcrumbs in library component
[x] router.back() is a bad idea for breadcrumbs link

// now the editing pset doesn't work in [libraryId]/[componentId] cant
component with this id - then filters in libraries

[ ] generate invitation link for private library -> become guest on enter
[ ] create composite library
[ ] merge libraries

!
tanstack query has meta that invalidates queries and it auto refetches.
In forms however I'm not using mutations so I have to do it manually, but
for some reason invalidateQueries works only as await and followed by
refetchQueries!
