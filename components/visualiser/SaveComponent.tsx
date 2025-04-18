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
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useCallback, useEffect, useState } from "react";
import { getIfcDataById } from "@/utils/ifc/ifcjs";
import { ComponentGeometry, Pset } from "@/utils/types";
import { createComponentAction } from "@/utils/actions";
import FormContainer from "../global/FormContainer";
import { Checkbox } from "../ui/checkbox";
import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import { AiOutlineReload } from "react-icons/ai";

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
  }, [open, file, selected]);

  const handleSuccess = useCallback(() => {
    setOpen(false);
  }, []);

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
          <DialogTitle>Upload component to BimCAT:</DialogTitle>
          <DialogDescription>
            Please provide a name for the component.
          </DialogDescription>
        </DialogHeader>
        <FormContainer action={createComponentAction} onSuccess={handleSuccess}>
          <Label htmlFor="name">
            <p className="text-sm text-secondary-foreground">Component Name</p>
          </Label>
          <Input name="name" id="name"></Input>
          <div className="flex mt-4 space-x-2">
            <Checkbox name="makePrivate" id="makePrivate" />
            <Label htmlFor="makePrivate">Make private</Label>
          </div>
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
