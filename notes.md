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
9. Write guides and usage, explain filters (don't forget 04.05.2025 key: val)

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

   - If you want to have someone else's component in your own library, you can
     copy this component and provide your own name, then add normally

4. You can share your private library by generating a private share link

   - You can disable the link at any time, and manage all subscribed users list

   - If the Library is switched to public when it already has link generated,
     it will automatically disable this link

   - When Library is public and already have guests, the guests will stay even
     if you change the library to private, then however you'll be able to remove
     them

5. You can create private or public Composite Library

   - After creation of the composite library you can not change it's privacy,
     as you don't necessarily own the content.

   - You can share the composite private library just as your normal private
     libraries

   - if the composite library is public, you can merge any public library,
     that's either your own or you have added it to favorites.

   - if the composite library is private, you can merge private or public
     libraries, it they are either yours or have been shared with you and
     you're still their guest

   - There is a chance that a public library that's in your composite library
     will become private. In this case it will still be in your composite library
     until the owner removes you from the guests.

   - Removing a library from your favorites will remove you from it's guests and
     therefore remove all occurances of this library in any composite library you
     own

## KNOWN ISSUES

- the last pset won't trigger toast on removal -
  instead of form do it as removeComponentButton but with optimistic ui update

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
all the changes. It will have one owner that can include or remove
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

### --27.04.2025--

Share link mutates library by adding a sharedId. It is then
displayed on frontend and available to copy. Now work on the route, consider
not leaking libraryId in the link (currently route is inside [libraryId] -
change that). And add user to the guests when they enter. Tidy up what's saved

library privateToggle removes shared link

now I need to implement disable link functionality

and then resolve library on share link

### --28.04.2025--

disable link works now. You can now share libraries - there's redirection or
login. Works as expected. Checked if user is added, if user can unsubscribe or
is not logged in and logs in. Had to modify fetchAllLibraries to include guest

to check:

- if I need to update redux state
- if it will work on account creation (might be too quick)

### --01.05.2025--

Fixed sharing a little bit, plans before implementing composite libraries:

[x] in componentContent allow change private
[x] deleting user
[x] user list in shared library so owner can remove them
[x] split search to author, user and desc in library and componentbrowser,
maybe add searching by psets too

### --02.05-2025--

Current task: -[ ] user list in shared library so owner can remove them
Notes:
Implementing guest list as a button on title that will display dialog
check what do I do with guests on private status change

### --03.05-2025--

Current task - split search params as you did in the browser
Coming next: start implementation of composite libraries or maybe pagination in
libraries, and also limiting the number of fetched components in browser/libs?
I already did some composite libraries progress - added prisma model and came
up with the rules for that, also implemented more advanced filters for library
browser

### --04.05.2025--

Current task: implementing psetcontent filter

above is implemented. !Reminder to myself to include in guides that searching
for pset content works like [key]: [value] so for example I can do
pset content: stage: A, where space after : is necessary

currently I want to implement server side pagination - combine with frontend?
I don't think I need a server-side pagination now. I can handle maybe a thousand
components which is more than enough. Libraries will also stay as just a long
scroll

starting with composite lib
or maybe first filters in library components - I dont think they make a lot of
sense in the end.

persisting params finally -never use breadcrumb links - use next links

### --06.05.2025--

yesterday I implemented creating and fetching composite libraries. Now I will work
on that further - first by creating more specific conditions on
libraryminitature

and then finally CompositeLibraryView
The things I for sure still need to do:

    - composite check in filters for libraries
    - will probably need to add starred to state

Today implemented old functionality but now with displaying composite libraries
along normal ones, and updated state so that both are inside. Added visual
guidance to show user which libraries are composite or which are their own ones

### --07.05.2025--

Composite check filter added - plan for tomorrow is to add displaying of
component list in composite library but actually with split for different libraries

maybe will need to add another rote /libraries/composite/libraryId
so I will be able to:

- use a different function for fetching a library content and also have a custom
  page and not one where everything is dependent on isComposite boolean.
- also add option to modify library description

### --08.05-2025--

Noticed that I do handling function inside which I perform mutations as async
functions, they dont have to be async.

first add merge functionality, then on a merged library build nested table
as here

MergeLibraryButton is in progress, DialogLibraryList as an example.

today added guestlibraries to userslice and isFavorite flag to all entries
there

### --09.05.2025--

Now merge dialog displays correct libraries that you can select. Next mark the
ones that are already merged, also consider reusing libraryList from
addComponentToLibraryButton's libraryList.

then follow with actually merging the libraries and as stated above, display
nested list -> then implement history log which is already started in prisma
schema but it hasn't been neither generated nor pushed.

### --10.05.2025--

Implemented merging functionality

- Note to self - support searching for components of nested libraries when
  filtering by content in library browser.
- another note to self - if you have a library that's private and you remove
  someone from its guests, I need to iterate over the guests authored composite
  libraries and potentially remove the library that you have just been thrown
  out from.

### --11.05.2025--

Implemented merging functionality and display of composite library yesterday.
working on title bar. now thinking about sharing functionality which is diffucult
because I'll need to check access to components now also based on a requesting
user being a guest of a composite library containing a library containing
the component.

download implemented. think about switching library to private and consequences
of that in regards to it being present in a compositeLibrary

also it's redundant to display author of a component in a library

above is done along with some cosmetics, now thinking about paths, maybe include
catchall route at libraries to display component from library?
no, in order to keep a clean route path I will do that as a separate route
/libraries/composite/compositeLibraryId/componentId and just reuse the
viewer.
that doesn't make any sense, instead I think it needs both componentId but
nested in libraryId

so for the first one I created routes and refactored componentContent

more height on empty library in composite table

### --12.05.2025--

Implemented navigating to component from compositeLibrary and persisting the
state in the state but that breaks on page refresh. But once I implement
actually fetching the data in this location I can use this data to actually
render breadcrumbs which may mean that the compositestate is useless?

implemented that with useQuery and no redux (only for the searchParams).
now the buttons in the title don't work. I can add psets, but renameComponent
doesnt work and also toggling private.

### --13.05.2025--

Fixed renaming in the titlebar as it wasnt always working, broke at some point
while refactoring to work in libraries.

there is one more edge case - when I enter the component from a composite, and
the component is in a public library, i can then change this component to
private therefore removing it from the public library, it kinda works anyway.

### --14.05.2025--

You can now navigate to the library from the composite menu
still need to add button from the composite list
either add private inside library title bar or remove it from component

!ISSUE when editing psets while accessing component from composite library,it
doesn't refetch but works when accessed from normal library????

### --15-05-2025--

Sorted the issue with editing psets, the problem was that I used query to fetch
composite component, as opposed to the other places (component browser and
normal library, where it's just a normal server action)
In the future it might be beneficial to use guery in all these places and switch
formcontainer everywhere to just mutations

Also created libraryInfo component, visually not okay - maybe do as one with
description?

### --18-05-2025--

Fixed a bit the liraryInfo component and also removed select column from all
library views if library is not editable

Also instead of handling the togglecomponentPrivate from inside library inside
a component I removed the toggle button from component view at all.

### --19-05-2025--

Today only managed to filter libraries in merge library dialog so that user cant
add private lib to public composite. NEED TO DO THAT ALSO ON BACKEND.

tommorrow remember that a library is only removed automatically from composite
if its owner removes composite owner from guests.
and handling the privacy change in library with regards to containing composite:

- from public to private if it's in private composite - nothing appears
- from public to private if it's in public composite - remove from composite
- from private to public if it's in private composite - nothing happens
- from private to public if it's in public composite - can't reach this

removing guest always removes the library from their composites.

maybe in merge library dialog add option to remove selected library

### --20-05-2025--

Now composites are only displayed when you click composite filter, and not
showing up if it's not checked.
The rows are no longer clickable, everything is handled by an additional column
that's a GoToLibraryButton which I should probably rename since it's also now
used for going to component.
User can now see the type of library they're in because the icon is in the title.

first thing tomorrow is to handle removing library from composite when its
inside a public composite and lib goes private (keeps guests, maybe asks if
remove all, and then remove from all public composites)
then removing guests which will inadvertedly result in removing librs from their
composites
and composite logic should be done, only sharing left before implementing logs

### --21-05-2025--

First of all let's actually implement removing library from composite.

### --24-05-2025--

That's done and some other improvements. Now the idea is to:
Do nothing when user changes a lib to private, just deactivate this row.

The same thing happens when you are removed from the guests.

That should be all. Then implement hisotry log and get into cool stuff funally.

### --25-05-2025--

Okay so I have two options when a public library inside someone elses public
composite
goes private:

- it gets removed automatically - i choose this one
- i get a weird case where it's still there until the composite author gets
  removed from guests.

Make sure that clerk ids dont get to frontend with guests

Another milestone achieved - now handling removing guests and changing privacy
for library and its membership to composites

I want to add info how many composites include cur library while managing it's
guests

### --26-05-2025--

Now you can see the number of composite libraries that include current library
in the manage users dialog

tomorrow I will want to create a dialog before removing shared library from
favs - maybe showing how many composite libraries will be affected.

Also current number of things happening without any notice:

- when user is removed from guests - no info even if it removes the libs
  from composites
- When library is changed to private - will be removed from composite libraries

Above things are crucial to record in the composite history log

It will be only things like - composite library created, library added, user
joined, library went private
or user removed it from favs or library disappeared because you were kicked out
of guests.

Maybe also add number of stars in public library

### Current task list

[x]sort out the navigation to library and/or component from composite
[x]show if composite is private or not
[x]handle user changing component private from inside libraries (just removed button)
[x]restrict merging libraries with uncompatible privacy status
[x]handle user changing library to private and removing someone from guests.
[ ]handle removing library from favorites
[ ]sharing composite library
[ ]pagination in libraries view and component browser
[ ]history log
[ ]handle pset values and stats
