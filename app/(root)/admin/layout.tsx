'use client'

import SideBar from "@/components/shared/SideBar"
import { Card } from "@/components/ui/card"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useEffect, useState } from "react"

export default function UserDashboard({children}) {
  

  return (
    <main>
      <SidebarProvider className="w-screen">
        <SideBar />
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