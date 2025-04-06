import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { ComponentSchemaType, librarySchemaType } from "@/utils/schemas";

type LibraryMinatureType = {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    firstName: string;
    secondName: string | null;
    premium: boolean;
  } | null;
  Components?: Partial<ComponentSchemaType>[];
  public: boolean;
};

type frontendLibrary = {
  libId: string;
  libName: string;
  description: string;
  libAuthor: string;
  createdAt: Date;
  updatedAt: Date;
  numComponents: number;
  numGuests: number;
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
  console.log(library);
  return (
    <Link className="text-xl text-primary" href={`/libraries/${libId}`}>
      <Card className="hover:bg-card-highlighted">
        <CardHeader>
          <CardTitle>{libName}</CardTitle>
        </CardHeader>
        <CardContent>{description}</CardContent>
        <CardFooter className="text-sm text-secondary-foreground justify-between">
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
