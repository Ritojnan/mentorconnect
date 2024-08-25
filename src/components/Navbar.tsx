import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { HandMetal } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SignOutButton from "./buttons/SignOutButton";

const Navbar = async () => {
  const session = await getServerSession(authOptions);

  return (
    <div className=" bg-zinc-100 py-2 border-b border-s-zinc-200 fixed w-full z-10 top-0">
      <div className="container flex items-center justify-between">
        <Link href="/">
          <HandMetal />
        </Link>
        {session?.user ? (
          <SignOutButton />
        ) : (
          <div className="flex items-center space-x-2">
            <Link href="/sign-in">
              <button className={buttonVariants()}>Sign in</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
