"use client";
//implementacion para el funcionamiento de next-auth

import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";

const SignInButton = () => {

    const { data: session } = useSession();

    if(session && session.user){
        return (
            <div>
                <p>{session.user.name}</p>
                <button onClick={() => signOut}>
                    Sign Out
                </button>
            </div>
        )
    }
    return (
        <button onClick={() => signIn()}>
            Sign In
        </button>
    )
}

export default SignInButton;