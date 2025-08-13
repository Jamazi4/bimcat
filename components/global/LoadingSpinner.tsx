import { LoaderCircle } from "lucide-react";

const LoadingSpinner = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-[100] mx-auto my-auto h-screen w-full">
      <LoaderCircle className="animate-spin w-10 h-10" />
    </div>
  );
};
export default LoadingSpinner;

export const LoadingSpinnerFixed = () => {
  return (
    <div className="fixed inset-0 flex mx-auto my-auto items-center justify-center z-[200] ">
      <LoaderCircle className="animate-spin w-10 h-10" />
    </div>
  );
};
