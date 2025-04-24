import { fetchAllLibrariesAction } from "@/utils/actions/libraryActions";
import LibraryMinature from "./LibraryMinature";

const LibraryList = async () => {
  const libraries = await fetchAllLibrariesAction();

  if (!libraries) return <div>Nothing to look at here...</div>;

  const frontendLibraries = libraries.map((library) => {
    return {
      libId: library.id,
      libName: library.name,
      description: library.description,
      libAuthor: `${library.author.firstName} ${library.author.secondName}`,
      createdAt: library.createdAt,
      updatedAt: library.updatedAt,
      numComponents: library.Components.length,
      numGuests: library.guests.length,
      editable: library.editable,
      publicFlag: library.public,
      isGuest: library.isGuest,
    };
  });

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      {frontendLibraries.map((library) => {
        return <LibraryMinature key={library.libId} library={library} />;
      })}
    </div>
  );
};
export default LibraryList;
