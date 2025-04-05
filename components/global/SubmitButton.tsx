import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import { AiOutlineReload } from "react-icons/ai";

export default function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-30 mt-4"
      onClick={(e) => e.stopPropagation()}
    >
      {pending ? <AiOutlineReload className="animate-spin" /> : "Accept"}
    </Button>
  );
}
