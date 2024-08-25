"use client";

import { SessionProvider } from "next-auth/react";
import { FC, ReactNode } from "react";

interface ProviderProps {
    children: ReactNode;
}

const Provider: FC<ProviderProps> = ({ children }) => (
    <SessionProvider>
        {children}
    </SessionProvider>
);

export default Provider;
