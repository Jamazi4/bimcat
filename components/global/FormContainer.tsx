"use client";

import { useActionState } from "react";
import { useEffect } from "react";
import { toast } from "sonner";
import { actionFunction } from "@/utils/types";

const initialState = { message: "" };

export default function FormContainer({
  action,
  children,
  onSuccess,
}: {
  action: actionFunction;
  children: React.ReactNode;
  onSuccess?: () => void;
}) {
  const [state, formAction] = useActionState(action, initialState);
  useEffect(() => {
    if (state.message) {
      toast(state.message);
      onSuccess?.();
    }
  }, [state, onSuccess]);

  return <form action={formAction}>{children}</form>;
}
