import { checkRole } from "@/utils/roles"
import { redirect } from "next/navigation"


export default async function AdminPage() {
  const isAdmin = await checkRole('admin')
  if (!isAdmin) {
    redirect('/')
  }     

  return <div>Admin Page</div>
}