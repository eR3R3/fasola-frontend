'use client'

import { useEffect, useState } from "react";
import Image from "next/image";
import { redirect, useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { signOut } = useClerk()
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      checkUserRole()
      checkAdminStatus()
    }

    if (!isSignedIn && isLoaded) {
      console.log('User is not signed in');
      return;
    }

    if (isLoaded && isSignedIn) {
      console.log('User data:', user);
    }
  }, [isLoaded, isSignedIn, user])

  async function checkAdminStatus() {
    const adminStatus = await checkRole("admin")
    setIsAdmin(adminStatus)
  }

  async function checkRole(role: string) {
    try {
      const response = await fetch("/api/checkRole", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });
      const data = await response.json();
      return data.hasRole;
    } catch (error) {
      console.error("Error checking role:", error);
      return false;
    }
  }

  async function checkUserRole() {
    try {
      const foundUser = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/findOne`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
    } catch (error) {
      console.error("Error in checkUserRole:", error);
    }
  }

  const navigateToUserDashboard = () => {
    router.push('/user')
  }

  const navigateToAdminDashboard = () => {
    router.push('/admin')
  }

  const handleSignOut = () => {
    signOut();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-emerald-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl" />
      </div>
      
      <div className="relative flex flex-col items-center justify-center min-h-screen p-6">
        {isLoaded ? (
          isSignedIn ? (
            <div className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-100 transition-all duration-500 animate-fadeIn">
              <div className="mb-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl font-bold text-white">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mt-4">Welcome, {user?.firstName}!</h1>
                <p className="mt-2 text-gray-600">Please select a dashboard to continue</p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={navigateToUserDashboard}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center group"
                >
                  <span>User Dashboard</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
                
                {isAdmin && (
                  <button
                    onClick={navigateToAdminDashboard}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center group"
                  >
                    <span>Admin Dashboard</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                )}
                
                <button
                  onClick={handleSignOut}
                  className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center group"
                >
                  <span>Sign Out</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-500">
                  Logged in as <span className="font-medium text-emerald-600">{user?.firstName+user?.lastName}</span>
                </p>
              </div>
            </div>
          ) : (
            redirect('/sign-in')
          )
        ) : (
          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-8 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <span className="text-gray-700 font-medium">Loading your dashboard...</span>
          </div>
        )}
      </div>
    </div>
  );
}
