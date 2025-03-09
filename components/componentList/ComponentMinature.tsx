import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";

const ComponentMinature = ({
  id,
  name,
  created,
  updated,
}: {
  id: string;
  name: string;
  created: Date;
  updated: Date;
}) => {
  return (
    <Link className="text-xl text-primary" href={`/components/${id}`}>
      <Card className="hover:bg-card-highlighted">
        <CardHeader>
          <CardTitle className="mx-auto">{name}</CardTitle>
        </CardHeader>
        <CardContent></CardContent>
        <CardFooter className="text-sm text-secondary-foreground">
          <div>
            <p>Created: {format(created, "dd-MM-yy HH:mm")}</p>
            <p>Updated: {format(updated, "dd-MM-yy HH:mm")}</p>
          </div>
        </CardFooter>{" "}
      </Card>
    </Link>
  );
};
export default ComponentMinature;
