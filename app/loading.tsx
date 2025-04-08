import { AiOutlineReload } from "react-icons/ai";

const loading = () => {
  return (
    <div className="flex mx-auto my-auto w-full h-full items-center">
      <AiOutlineReload className="animate-spin w-10 h-10" />
    </div>
  );
};
export default loading;
