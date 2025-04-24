import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import { LoaderCircle } from "lucide-react";

export default function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-30 mt-4">
      {pending ? <LoaderCircle className="animate-spin" /> : "Accept"}
    </Button>
  );
}
