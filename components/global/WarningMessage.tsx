import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

const WarningMessage = ({ message }: { message: string }) => {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};
export default WarningMessage;
