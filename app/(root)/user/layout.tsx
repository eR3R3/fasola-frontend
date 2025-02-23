'use client'

import UserSideBar from "@/components/shared/UserSideBar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function UserLayout({children}) {
  return (
    <main>
      <SidebarProvider className="w-screen">
        <UserSideBar />
        <main className="w-full">
          <SidebarTrigger />
          <div className="px-10 py-6 w-full">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </main>
  )
} 