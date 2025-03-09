import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PsetContent } from "@/utils/types";
import { Pencil } from "lucide-react";
import { Badge } from "../ui/badge";
import PsetEditInput from "./PsetEditInput";

type PsetDialogMode = "edit" | "add";

function PsetDialog({
  mode,
  content,
  title,
}: {
  mode: PsetDialogMode;
  content: PsetContent[];
  title: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {mode === "edit" ? (
          <Button
            size="icon"
            className="place-items-end cursor-pointer ml-auto"
          >
            <Pencil />
          </Button>
        ) : (
          <Button
            size="icon"
            className="place-items-end cursor-pointer ml-auto"
          >
            <Pencil />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="capitalize">
            {mode} {title}
          </DialogTitle>
          <DialogDescription>
            Make changes to component properties. Click save when you are done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {content.map((entry, index) => {
            const [[name, value]] = Object.entries(entry);
            return <Row name={name} value={value} key={index} />;
          })}
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PsetDialog;

const Row = ({
  name,
  value,
}: {
  name: string;
  value: string | boolean | number;
}) => {
  return (
    <div className="items-center gap-4">
      <Label htmlFor={name} className="mb-2">
        <Badge>{name}</Badge>
      </Label>
      <PsetEditInput value={value} name={name} />
    </div>
  );
};
