import { LoaderCircle } from "lucide-react";

const LoadingSpinner = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <LoaderCircle className="animate-spin w-10 h-10" />
    </div>
  );
};
export default LoadingSpinner;
