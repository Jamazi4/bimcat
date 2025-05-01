"use client";

import { Button } from "@/components/ui/button";
import { giveAccessToLibraryAction } from "@/utils/actions/libraryActions";
import { ShareLibraryErrors } from "@/utils/types";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import { toast } from "sonner";

const Page = () => {
  const { sharedId } = useParams();
  const { isSignedIn, isLoaded } = useUser();

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
  const giveAccessToLibraryMutation = useMutation({
    mutationFn: (sharedId: string) => {
      return giveAccessToLibraryAction(sharedId);
    },
  });
  const { mutate } = giveAccessToLibraryMutation;
  const addMessage = "Access the library from Libraries tab.";
  useEffect(() => {
    mutate(sharedId, {
      onSuccess: (result) => {
        toast("Library shared succesfully.");
        router.replace(`/libraries/${result}`);
      },
      onError: (error) => {
        setFailed(true);
        switch (error.message) {
          case ShareLibraryErrors.OwnLibrary:
            toast(`${ShareLibraryErrors.OwnLibrary}, addMessage`);
            break;
          case ShareLibraryErrors.UserNotFound:
            toast(ShareLibraryErrors.UserNotFound);
            break;
          case ShareLibraryErrors.Unauthorized:
            toast(ShareLibraryErrors.Unauthorized);
            break;
          case ShareLibraryErrors.NotShared:
            toast(ShareLibraryErrors.NotShared);
            break;
          case ShareLibraryErrors.AlreadyShared:
            toast(`${ShareLibraryErrors.AlreadyShared}, addMessage`);
            break;
        }
      },
    });
  }, [mutate, sharedId, router]);

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
