import { AiOutlineReload } from "react-icons/ai";

const LoadingSpinner = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <AiOutlineReload className="animate-spin w-10 h-10" />
    </div>
  );
};
export default LoadingSpinner;
