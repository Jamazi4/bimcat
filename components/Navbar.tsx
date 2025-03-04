import { ModeToggle } from "./ModeToggle";

const Navbar = () => {
  return (
    <nav className="mx-auto border-b p-4 bg-muted mb-12">
      <div className=" max-w-3xl mx-auto flex justify-between">
        <h1 className="font-black text-3xl text-primary">BimCAT</h1>
        <ModeToggle />
      </div>
    </nav>
  );
};
export default Navbar;
