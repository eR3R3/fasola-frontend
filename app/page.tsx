'use client'

import { checkRole } from "@/utils/roles";
import { useEffect } from "react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { useUser } from "@clerk/clerk-react";

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser()

  useEffect(() => {
    if (isLoaded) {
      checkUserRole()
    }

    if (!isSignedIn) {
      console.log('User is not signed in');
      return;
    }

    console.log('User data:', user);
  }, [isLoaded, isSignedIn, user])

  async function checkUserRole() {
    const foundUser = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/findOne`, {
      method: 'POST',
      body: JSON.stringify({
        name: user?.firstName+user?.lastName,
      }),
    })
    const data = await foundUser.json()
    const isAdmin = await checkRole("admin")
    if (data?.role === 'ADMIN' && !isAdmin) {
      await fetch("/api/setRole", {
        method: 'POST',
        body: JSON.stringify({
          role: "admin",
        }),
      })
    }
    if (data?.role !== 'ADMIN' && isAdmin) {
      await fetch("/api/setRole", {
        method: 'POST',
        body: JSON.stringify({
          role: "user",
        }),
      })
    }
  }

  return (
    <div className="">
      {isLoaded ? (
        isSignedIn ? (
          <div>Welcome, {user?.firstName}!</div>
        ) : (
          redirect('/')
        )
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
