import { Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

const InfoMessage = ({ message }: { message: string }) => {
  return (
    <Alert className="text-constructive">
      <Info className="h-4 w-4" />
      <AlertTitle>Info</AlertTitle>
      <AlertDescription className="text-constructive">
        {message}
      </AlertDescription>
    </Alert>
  );
};
export default InfoMessage;
