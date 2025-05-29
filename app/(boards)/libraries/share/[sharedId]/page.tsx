"use client";

import { Button } from "@/components/ui/button";
import { fetchUserLibraries } from "@/lib/features/user/userSlice";
import { useAppDispatch } from "@/lib/hooks";
import { giveAccessToLibraryAction } from "@/utils/actions/libraryActions";
import { LibraryErrors } from "@/utils/types";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { useEffect, useState } from "react";
import { toast } from "sonner";

const Page = () => {
  const { isSignedIn, isLoaded } = useUser();
  const { sharedId } = useParams();

  if (typeof sharedId !== "string") {
    return <div>Invalid library ID</div>;
  }
  if (!isLoaded) return <div className="flex mx-auto">Loading...</div>;
  return (
    <>
      {isSignedIn ? <ProcessingScreen sharedId={sharedId} /> : <SignInScreen />}
    </>
  );
};
export default Page;

const SignInScreen = () => {
  return (
    <div className="flex flex-col mx-auto">
      <h1 className="font-bold text-2xl mx-auto py-4">User not logged in.</h1>
      <p className="w-full">
        To access private libraries you must have an account and be logged in.
      </p>
      <div className="flex mx-auto gap-4 my-6">
        <Button asChild className="w-30 mx-auto">
          <SignInButton />
        </Button>
        <Button asChild className="w-30 mx-auto">
          <SignUpButton />
        </Button>
      </div>
    </div>
  );
};

const ProcessingScreen = ({ sharedId }: { sharedId: string }) => {
  const [failed, setFailed] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isComposite = useSearchParams().get("isComposite") === "true";
  const giveAccessToLibraryMutation = useMutation({
    mutationFn: (sharedId: string) => {
      return giveAccessToLibraryAction(sharedId, isComposite);
    },
  });
  const { mutate } = giveAccessToLibraryMutation;
  const addMessage = "Access the library from Libraries tab.";
  useEffect(() => {
    mutate(sharedId, {
      onSuccess: (result) => {
        toast("Library shared succesfully.");
        const finalRoute = `/libraries${isComposite ? "/composite" : ""}/${result}`;
        router.replace(finalRoute);
        dispatch(fetchUserLibraries());
      },
      onError: (error) => {
        setFailed(true);
        switch (error.message) {
          case LibraryErrors.OwnLibrary:
            toast(`${LibraryErrors.OwnLibrary}, ${addMessage}`);
            break;
          case LibraryErrors.UserNotFound:
            toast(LibraryErrors.UserNotFound);
            break;
          case LibraryErrors.Unauthorized:
            toast(LibraryErrors.Unauthorized);
            break;
          case LibraryErrors.NotShared:
            toast(LibraryErrors.NotShared);
            break;
          case LibraryErrors.AlreadyShared:
            toast(`${LibraryErrors.AlreadyShared}, ${addMessage}`);
            break;
        }
      },
    });
  }, [mutate, dispatch, sharedId, router, isComposite]);

  return (
    <>
      {failed ? (
        <h1 className="font-bold text-2xl mx-auto py-4">
          Something went wrong.
        </h1>
      ) : (
        <div className="flex flex-col mx-auto">
          <h1 className="font-bold text-2xl mx-auto py-4">Please wait.</h1>
          <p className="w-full">
            You will be redirected to the library shortly.
          </p>
        </div>
      )}
    </>
  );
};
