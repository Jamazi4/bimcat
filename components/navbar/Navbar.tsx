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
import { Cuboid } from "lucide-react";

const Navbar = () => {
  return (
    <nav className=" mx-auto px-4 py-4 border-b bg-secondary h-[72px]">
      <div className="flex justify-between max-w-[1024px] mx-auto items-center">
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
        <div className="flex text-center w-full">
          <Button variant="link" asChild className="text-primary-foreground">
            <Link href="/componentPicker">Create</Link>
          </Button>
          <Button variant="link" asChild className="text-primary-foreground">
            <Link href="/">Library</Link>
          </Button>
        </div>
        {/* Mode/account */}

        <div className="flex gap-2 justify-center items-center">
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
            <div className="flex items-center">
              <UserButton />
            </div>
          </SignedIn>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
