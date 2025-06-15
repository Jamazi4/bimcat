"use client";
import { Dispatch, SetStateAction, useState } from "react";
import { MenubarItem } from "../ui/menubar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { createNodeComponentAction } from "@/utils/actions/componentActions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";

const CreateComponent = ({ disabled }: { disabled: boolean }) => {
  const [open, setOpen] = useState(false);
  const [makePrivate, setMakePrivate] = useState(false);
  const [componentName, setComponentName] = useState("");
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setPending(true);
    const { message, componentId } = await createNodeComponentAction(
      componentName,
      makePrivate,
    );
    const searchParams = new URLSearchParams();
    searchParams.set("component", componentId);
    router.push(`?${searchParams.toString()}`);
    setOpen(false);
    setPending(false);
    toast(message);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <MenubarItem disabled={disabled} onSelect={(e) => e.preventDefault()}>
          Create
        </MenubarItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new node project.</DialogTitle>
          <DialogDescription>
            Please provide a name for the component.
          </DialogDescription>
        </DialogHeader>
        <Label htmlFor="name">
          <p className="text-sm text-secondary-foreground">Component Name</p>
        </Label>
        <Input
          name="name"
          id="name"
          value={componentName}
          onChange={(e) => setComponentName(e.target.value)}
        ></Input>
        <div className="flex mt-4 space-x-2">
          <Checkbox
            name="makePrivate"
            id="makePrivate"
            checked={makePrivate}
            onCheckedChange={(checked) => setMakePrivate(checked === true)}
          />
          <Label htmlFor="makePrivate">Make private</Label>
        </div>
        <DialogFooter>
          <Button
            onClick={(e) => {
              handleClick(e);
            }}
            disabled={componentName === "" && pending}
            className="w-30 mt-4"
          >
            {pending ? <LoaderCircle className="animate-spin" /> : "Accept"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateComponent;
