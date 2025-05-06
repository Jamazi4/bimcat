import { Eye, EyeClosed } from "lucide-react";
import { Button } from "../ui/button";

const PrivateIcon = ({ publicFlag }: { publicFlag: boolean }) => {
  return (
    <Button variant={"ghost"} disabled>
      {publicFlag ? <Eye /> : <EyeClosed />}
    </Button>
  );
};
export default PrivateIcon;
