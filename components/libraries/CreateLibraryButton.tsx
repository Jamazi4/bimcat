"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import SubmitButton from "../global/SubmitButton";
import FormContainer from "../global/FormContainer";
import { createLibraryAction } from "@/utils/actions/libraryActions";
import { useCallback, useState } from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useDispatch } from "react-redux";
import { fetchUserLibraries } from "@/lib/features/user/userSlice";
import { AppDispatch } from "@/lib/store";
import { useQueryClient } from "@tanstack/react-query";

const CreateLibraryButton = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isSignedIn } = useUser();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const onSuccess = useCallback(async () => {
    setOpen(false);
    dispatch(fetchUserLibraries());
    await queryClient.invalidateQueries({ queryKey: ["libraryBrowser"] });
    await queryClient.refetchQueries({ queryKey: ["libraryBrowser"] });
  }, []);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="cursor-pointer m-0">
          Create
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Library</DialogTitle>
          <DialogDescription>
            Provide a name and a short description for your new library.
          </DialogDescription>
        </DialogHeader>
        <FormContainer action={createLibraryAction} onSuccess={onSuccess}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" name="name" className="col-span-4" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                className="col-span-4"
              />
            </div>
            <div className="flex space-x-2">
              <Checkbox name="makePrivate" id="makePrivate" />
              <Label htmlFor="makePrivate" className="text-right">
                Make private
              </Label>
            </div>
          </div>
          <DialogFooter>
            {isSignedIn ? (
              <SubmitButton />
            ) : (
              <div>
                <SignInButton>
                  <Button
                    type="button"
                    className="w-30 mt-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Log in
                  </Button>
                </SignInButton>
              </div>
            )}
          </DialogFooter>
        </FormContainer>
      </DialogContent>
    </Dialog>
  );
};
export default CreateLibraryButton;
