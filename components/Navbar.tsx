import { ModeToggle } from "./ModeToggle";
import FileUpload from "./FileUpload";

import { FileUp } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

const Navbar = () => {
  return (
    <nav className="mx-auto p-4 bg-muted mb-12">
      <div className=" max-w-3xl mx-auto flex justify-between">
        <h1 className="font-black text-3xl text-primary">
          <div className="flex flex-col gap-0 leading-none">
            <span className="font-extralight leading-4">BIM</span>
            <span className="">CAT</span>
          </div>
        </h1>
        <div>
          <FileUpload />
        </div>
        <ModeToggle />
      </div>
    </nav>
  );
};
export default Navbar;
