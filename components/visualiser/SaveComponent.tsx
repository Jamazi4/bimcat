import { MenubarItem } from "../ui/menubar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";
import { AiOutlineReload } from "react-icons/ai";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useEffect, useState } from "react";
import { getIfcDataById } from "@/utils/ifc/ifcjs";
import { ComponentGeometry, Pset } from "@/utils/types";
import { createComponentAction } from "@/utils/actions";
import FormContainer from "../global/FormContainer";

const SaveComponent = ({
  selected,
  file,
}: {
  selected: number | null;
  file: File | null;
}) => {
  const [open, setOpen] = useState(false);
  const [geometry, setGeometry] = useState<ComponentGeometry[] | null>(null);
  const [psets, setPsets] = useState<Pset[] | null>(null);
  const [retrieved, setRetrieved] = useState(false);

  useEffect(() => {
    if (!open || !file || !selected) return;

    const loadData = async () => {
      const data = await getIfcDataById(file, selected);
      setGeometry(data.geometry);
      setPsets(data.psets);
      setRetrieved(true);
    };

    loadData();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <MenubarItem
          disabled={selected === null}
          onSelect={(e) => {
            e.preventDefault();
          }}
        >
          Save
        </MenubarItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Component To Your Library:</DialogTitle>
          <DialogDescription>
            Please provide a name for the component.
          </DialogDescription>
        </DialogHeader>
        <FormContainer
          action={createComponentAction}
          onSuccess={() => {
            setOpen(false);
          }}
        >
          <Label htmlFor="name">
            <p className="text-sm text-secondary-foreground">Component Name</p>
          </Label>
          <Input name="name" id="name"></Input>
          {geometry && (
            <input
              type="hidden"
              name="geometry"
              value={JSON.stringify(geometry)}
            />
          )}
          {psets && (
            <input type="hidden" name="psets" value={JSON.stringify(psets)} />
          )}
          <DialogFooter>
            <SubmitButton retrieved={retrieved} />
          </DialogFooter>
        </FormContainer>
      </DialogContent>
    </Dialog>
  );
};
export default SaveComponent;

function SubmitButton({ retrieved }: { retrieved: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending || !retrieved}
      className="w-30 mt-4"
    >
      {pending || !retrieved ? (
        <AiOutlineReload className="animate-spin" />
      ) : (
        "Accept"
      )}
    </Button>
  );
}
