import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    // 获取当前登录用户
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // 解析请求体
    const { role } = await req.json()
    if (!role) {
      return NextResponse.json({ message: 'Role is required' }, { status: 400 })
    }
    // 更新用户的 publicMetadata
    const clerk = await clerkClient()
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: { role }
    })

    return NextResponse.json({ message: `Role updated to ${role}` })
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error', error }, { status: 500 })
  }
}
