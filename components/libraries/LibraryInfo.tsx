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
  const cellClassname = "text-start w-full";
  const rowClassName = "grid grid-cols-[90px_1fr]";
  const colClassname = "grid grid-rows-2 gap-2";
  return (
    <div className="my-2 mb-4 text-sm md:text-lg">
      <div className="grid-cols-2 grid  rounded-md p-2 my-2 text-secondary-foreground gap-6 ">
        <div className={colClassname}>
          <div className={rowClassName}>
            <p>Author:</p>
            <div className={cellClassname}>
              <p>{author}</p>
            </div>
          </div>
          <div className={rowClassName}>
            <p>Public:</p>
            <div className={cellClassname}>
              <p>{isPublic.toString()}</p>
            </div>
          </div>
        </div>

        <div className={colClassname}>
          <div className={rowClassName}>
            <p>Updated:</p>
            <div className={cellClassname}>
              <p>{format(updatedAt, "dd-MM-yy HH:mm")}</p>
            </div>
          </div>
          <div className={rowClassName}>
            <p>Created:</p>
            <div className={cellClassname}>
              <p>{format(createdAt, "dd-MM-yy HH:mm")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryInfo;
