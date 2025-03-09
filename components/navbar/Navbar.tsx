import { ModeToggle } from "./ModeToggle";

import Link from "next/link";
import UploadDialog from "../UploadDialog";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "../ui/button";

const Navbar = () => {
  return (
    <nav className="  px-4 pb-4 pt-6 border-b bg-secondary mb-12 ">
      <div className="flex justify-between max-w-[1120px] mx-auto">
        {/* LOGO */}
        <h1 className="font-black text-3xl text-primary-foreground">
          <Link href="/">
            <div className="flex flex-col gap-0 leading-none">
              <span className="font-extralight leading-4 tracking-[0.08em]">
                BIM
              </span>
              <span className="tracking-tighter">CAT</span>
            </div>
          </Link>
        </h1>
        {/* Navigation */}
        <div>
          <UploadDialog />
        </div>
        {/* Mode/account */}

        <div className="flex gap-2 justify-center align-middle">
          <ModeToggle />
          <SignedOut>
            <Button asChild>
              <SignInButton />
            </Button>
            <Button asChild>
              <SignUpButton />
            </Button>
          </SignedOut>
          <SignedIn>
            <Button size="icon" asChild>
              <UserButton />
            </Button>
          </SignedIn>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
