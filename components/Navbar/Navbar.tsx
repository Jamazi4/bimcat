import { ModeToggle } from "./ModeToggle";

import Link from "next/link";
import UploadDialog from "../UploadDialog";

const Navbar = () => {
  return (
    <nav className="mx-auto p-4 border-b bg-secondary mb-12">
      <div className=" max-w-3xl mx-auto flex justify-between">
        {/* LOGO */}
        <h1 className="font-black text-3xl text-secondary-foreground">
          <Link href="/">
            <div className="flex flex-col gap-0 leading-none">
              <span className="font-extralight leading-4">BIM</span>
              <span className="">CAT</span>
            </div>
          </Link>
        </h1>
        {/* Navigation */}
        <div>
          <UploadDialog />
        </div>
        {/* Mode/account */}
        <ModeToggle />
      </div>
    </nav>
  );
};
export default Navbar;
