import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";

type frontendLibrary = {
  libId: string;
  libName: string;
  description: string;
  libAuthor: string;
  createdAt: Date;
  updatedAt: Date;
  numComponents: number;
  numGuests: number;
  editable: boolean;
};

const LibraryMinature = ({ library }: { library: frontendLibrary }) => {
  const {
    libId,
    libName,
    description,
    createdAt,
    updatedAt,
    libAuthor,
    numComponents,
  } = library;
  const charLimit = 150;
  return (
    <Link className="text-xl text-primary" href={`/libraries/${libId}`}>
      <Card className="hover:bg-card-highlighted h-64">
        <CardHeader>
          <CardTitle>{libName}</CardTitle>
        </CardHeader>
        <CardContent>
          {description.length > charLimit
            ? `${description.substring(0, charLimit)}...`
            : description}
        </CardContent>
        <CardFooter className="text-sm text-secondary-foreground justify-between mt-auto">
          <div>
            <p>Created: {format(createdAt, "dd-MM-yy HH:mm")}</p>
            <p>Updated: {format(updatedAt, "dd-MM-yy HH:mm")}</p>
          </div>
          <div className="align-text-bottom ">
            <p>{`Owner: ${libAuthor}`}</p>
            <p>{`Components: ${numComponents}`}</p>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};
export default LibraryMinature;

const LibraryMinatureIcons = () => {};
