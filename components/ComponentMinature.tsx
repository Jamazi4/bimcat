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
}: {
  id: string;
  name: string;
  created: Date;
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="mx-auto">
          <Link className="text-xl text-primary" href={`/components/${id}`}>
            {name}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent></CardContent>
      <CardFooter className="text-sm text-secondary-foreground">
        Created: {format(created, "dd-MM-yy HH:mm")}
      </CardFooter>{" "}
    </Card>
  );
};
export default ComponentMinature;
