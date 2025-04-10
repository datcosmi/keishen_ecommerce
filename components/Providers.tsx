"use client";
//implementacion para el funcionamiento de next-auth
// para acceder a la sesion con useSession

import { SessionProvider } from "next-auth/react";
import React, { ReactNode } from "react";

interface Props {
    children: ReactNode;
}
const Providers = ( props: Props ) => {
    return <SessionProvider>{props.children}</SessionProvider>
}

export default Providers;