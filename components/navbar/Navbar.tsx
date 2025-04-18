import { ModeToggle } from "./ModeToggle";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { NavbarMenu } from "./NavbarMenu";

const Navbar = () => {
  return (
    <nav className=" mx-auto px-4 py-4 top-0 border-b bg-background h-[72px] fixed w-full z-10">
      <div className="flex justify-between  mx-auto items-center">
        {/* LOGO */}
        <h1 className="font-black text-3xl text-primary hover:brightness-150 w-20">
          <Link href="/">
            <div className="flex flex-col gap-0 leading-none">
              <span className="font-extralight leading-4 tracking-[0.08em]">
                BIM
              </span>
              <span className="tracking-tighter">CAT</span>
            </div>
          </Link>
        </h1>

        <NavbarMenu />

        <div className="flex gap-2 justify-center items-center w-20">
          <ModeToggle />
          <SignedOut>
            <Button
              asChild
              variant="link"
              className="text-primary cursor-pointer"
            >
              <SignInButton />
            </Button>
            {/* <Button asChild>
              <SignUpButton />
            </Button> */}
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
