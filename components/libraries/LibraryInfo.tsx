import { format } from "date-fns";
const LibraryInfo = ({
  author,
  updatedAt,
  createdAt,
  isPublic,
}: {
  author: string;
  updatedAt: string;
  createdAt: string;
  isPublic: boolean;
}) => {
  return (
    <div className="my-2 mb-4">
      <h2 className="font-bold">Info</h2>
      <div className="grid-cols-2 grid bg-accent rounded-md p-2 my-2 text-secondary-foreground">
        <div className="mr-4">
          <div className="flex justify-between">
            <p>Author:</p>
            <div className="text-center w-full">
              <p>{author}</p>
            </div>
          </div>
          <div className="flex justify-between">
            <p>Public:</p>
            <div className="text-center w-full">
              <p>{isPublic.toString()}</p>
            </div>
          </div>
        </div>
        <div className="mr-4">
          <div className="flex justify-between">
            <p>Updated:</p>
            <div className="text-center w-full">
              <p>{format(updatedAt, "dd-MM-yy HH:mm")}</p>
            </div>
          </div>
          <div className="flex justify-between">
            <p>Created:</p>
            <div className="text-center w-full">
              <p>{format(createdAt, "dd-MM-yy HH:mm")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryInfo;
