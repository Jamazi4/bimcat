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
import type { Pset, PsetContent } from "@/utils/types";
import { Pencil, Plus } from "lucide-react";

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
            Make changes to component's properties. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {content.map((row, index) => {
            return <Row name={row.name} value={row.value} key={index} />;
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

const Row = ({ name, value }: { name: string; value: string }) => {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="username" className="text-right">
        {name}
      </Label>
      <Input id="username" defaultValue={value} className="col-span-3" />
    </div>
  );
};
