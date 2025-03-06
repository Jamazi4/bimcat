import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ComponentMinature = ({ id, name }: { id: string; name: string }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="mx-auto">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Link href={`/components/${id}`}>{name}</Link>
      </CardContent>
      <CardFooter>lorem</CardFooter>
    </Card>
  );
};
export default ComponentMinature;
