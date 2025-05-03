# DEVLOG

- not forget - to debug clerk webhooks run 'ngrok http 3000'

## GENERAL TODO

0. Layout - propsets size in creator
1. PSETS - add support for bool values (frontend) - maybe differentiate
   between types of properties (backend) - don't allow to save empty pset
2. LOADING FILES/COMPONENTS - show link to component in toast on creation/copy
3. Libraries - user assigned or public libraries of elements - private/public
4. USERS - delete user
5. when accessing component from library, change breadcrumbs somehow
6. locale date is wrong on prod
7. sonner styling for success and error (border color maybe) - link on upload
   - or uploading toast and success toast
   - owner functionality - add/remove users, add/remove components
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
     (if any) will automatically become public

3. You can add both public and private components to your libraries, but only
   the ones you authored

   - If library is public, and you are adding your own private component -
     component will toggle to public(done).

   - If you want to have someone elses component in your own library, you can
     copy this component and provide your own name, then add normally

4. You can share your private library by generating a private share link

   - You can disable the link at any time, and manage all subscribed users list

   - If the Library is switched to public when it already has link generated,
     it will automatically disable this link

   - When Library is public and already have guests, the guests will stay even
     if you change the library to private, then however you'll be able to remove
     them

5. You can create private or public Composite Library but can not toggle the
   private attribute after the creation

   - You can share the composite private library just as your normal private libraries

   - if the composite library is public, you can merge any public library,
     if it's either your own or you have added it to the favorites.

   - if the composite library is private, you can only merge private libraries,
     it they are either yours or have been shared with you and you're still their
     guest

   - When you merge someone else's private library, their author will
     automatically become a guest of your composite library. Removing them from
     the guests will result in removing their libraries from your composite library.

## KNOWN ISSUES

- the last pset won't trigger toast on removal -
  instead of form do it as removeComponentButton but with optimistic ui update

- When library filters are applied, and user goes into [libraryId] and then
  in [componentId], then goes back to [libraryId], the filters in /libraries
  are lost.

## WORKAROUNDS/ISSUES

tanstack query has meta that invalidates queries and it auto refetches.
In forms however I'm not using mutations so I have to do it manually, but
for some reason invalidateQueries works only as await and followed by
refetchQueries!

the workflow of actions where modal is displayed until success vs modal closes
and original button spins can be useful when I want to allow user to redo
something if action fail, for example name already taken or pset already exists

## COMPOSITE LIBRARIES

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

[x] generate invitation link for private library -> become guest on enter
[ ] create composite library
[ ] merge libraries

if user clicks on shared link and:

- a. is not logged in:

  - but has an account - logs in, I proceed
  - doesn't have an account - I need to create dbUser and then add them
    (problem here? it might take time before account gets created)

- b. is logged in:

  - I proceed normally

- user clicks share
- I do mutation on library - generating a new shareId
- I add new path like /libraries/share/[shareId]
- on this route I automatically do another mutation on library - get userDb
  and add their id to the library guests and redirect user to library page
- user is a guest, library appears in their browser
- author can disable sharing link - will be able to check users

## DIARY

23.04.2025 - implemented copy component but because componentListWrapper
is now a client component and preserves the data in useState - it doesn't
revalidate. Maybe finally preserve the data in redux state and dispatch
refresh action -

24.04.2025 - revalidation solved by retriggering async thunk as browser
components now reside in redux state.

generating the library share link:

--27.04.2025--
Share link mutates library by adding a sharedId. It is then
displayed on frontend and available to copy. Now work on the route, consider
not leaking libraryId in the link (currently route is inside [libraryId] -
change that). And add user to the guests when they enter. Tidy up what's saved

library privateToggle removes shared link

now I need to implement disable link functionality

and then resolve library on share link

--28.04.2025--
disable link works now. You can now share libraries - there's redirection or
login. Works as expected. Checked if user is added, if user can unsubscribe or
is not logged in and logs in. Had to modify fetchAllLibraries to include guest

to check:

- if I need to update redux state
- if it will work on account creation (might be too quick)

--01.05.2025--
Fixed sharing a little bit, plans before implementing composite libraries:

[x] in componentContent allow change private
[x] deleting user
[x] user list in shared library so owner can remove them
[ ] split search to author, user and desc in library and componentbrowser,
maybe add searching by psets too

--02.05-2025--
Current task: -[ ] user list in shared library so owner can remove them
Notes:
Implementing guest list as a button on title that will display dialog
check what do I do with guests on private status change

--03.05-2025--
Current task - split search params as you did in the browser
Coming next: start implementation of composite libraries or maybe pagination in
libraries, and also limiting the number of fetched components in browser/libs?
I already did some composite libraries progress - added prisma model and came
up with the rules for that, also implemented more advanced filters for library
browser
