"use client";

import { signOut } from "next-auth/react";
import React from "react";
import { Button } from "../ui/button";

const SignOutButton = () => {
  return (
    <Button
      onClick={() =>
        signOut({
          redirect: true,
          callbackUrl: `${window.location.origin}/sign-in`,
        })
      }
    >
      Sign out
    </Button>
  );
};

export default SignOutButton;
