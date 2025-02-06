'use client'

import React, {useEffect, useState} from 'react';
import {Button} from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {useParams, useRouter} from "next/navigation";
import Link from "next/link";


const UserView = () => {
  const [currentClub, setCurrentClub] = useState<any>()
  const [currentMiniClub, setCurrentMiniClub] = useState<any>()
  const [content, setContent] = useState<any>()
  const [currentPosition, setCurrentPosition] = useState()
  const [allClubs, setAllClubs] = useState([])

  const router = useRouter()

  useEffect(() => {
    const fetchAllClubs = async () => {
      const allClubs = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/clubs/findAll`).then(async res => await res.json())
      console.log(allClubs)
      setAllClubs(allClubs)
    }
    fetchAllClubs()
  }, [])

  useEffect(() => {
      const handleAllUser = async () => {
        const allUsers = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/findAll`, {
          method: 'GET',
          headers: {'Content-Type': 'application/json'},
        }).then(async res => await res.json())
        console.log(allUsers)
        setContent(allUsers)
      }
      handleAllUser()
    },[])


  async function findClubByClubName(clubName: string) {
    const club = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/clubs/findOne`, {
      method: 'POST',
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({name: clubName}),
    }).then(async res => await res.json())
    console.log("first time find clubs", club)
    return club
  }

  async function findUsersByMiniClubName() {
  }


  return (
    <div>
      <div className="flex flex-row justify-between">
        <p className="text-5xl font-extrabold pb-8">查看</p>
        <div>
          <Button onClick={() => window.location.reload()}>查看所有</Button>
        </div>
      </div>

      <div>
        <p className="px-2 text-gray-500 pb-2">选择部门</p>
      </div>
      <div className="px-2 flex flex-row gap-5 flex-wrap pb-5">
        {allClubs.map((club: any, index: number) => (
          <Button
            key={index}
            variant="outline"
            onClick={async () => {
              const foundClub = await findClubByClubName(club.name);
              setCurrentClub(foundClub);
              setContent(foundClub.user);
            }}
          >
            {club.name}
          </Button>
        ))}
      </div>

      <div className="flex justify-between items-start gap-8 relative  pb-10">
        {/* Left Section - Mini Clubs */}
        <div className="flex-1 ">
          <p className="px-2 text-gray-500 pb-2">选择小组</p>
          <div className="flex flex-wrap gap-3">
            {currentClub?.miniClub?.map((miniClub: any, index: number) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => {
                  setCurrentMiniClub(miniClub);
                  setContent(miniClub.user);
                }}
              >
                {miniClub.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Decorative Center Line */}
        <div className="absolute left-1/2 top-0 bottom-0 transform -translate-x-1/2">
          <div className="h-full w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
        </div>

        {/* Right Section - Positions */}
        <div className="flex-1 px-2">
          <p className="px-2 text-gray-500 pb-2">选择职位</p>
          <div className="flex flex-wrap gap-3">
            {currentClub?.position?.map((position: any, index: number) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => {
                  setCurrentPosition(position);
                  setContent(position.user);
                }}
              >
                {position.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">姓名</TableHead>
            <TableHead>岗位</TableHead>
            <TableHead>角色</TableHead>
            <TableHead>所属部门</TableHead>
            <TableHead>删除员工</TableHead>
            <TableHead className="text-right">所属小组</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {content?.map((user:any, index: number)=>(
            <TableRow key={index}>
              <TableCell className=""><Button variant="link" className="m-0 p-0" onClick={()=>{router.push(`/admin/update/users/${user.name}`)}}>{user?.name}</Button></TableCell>
              <TableCell>{user?.position?.name}</TableCell>
              <TableCell>{user?.role}</TableCell>
              <TableCell><Button variant="link" onClick={()=>{router.push(`/admin/update/clubs/${user.club.name}`)}}>{user?.club?.name}</Button></TableCell>
              <TableCell><Button variant="link" className="m-0 pr-2 text-red-500" onClick={async () => {
                console.log(user)
                await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/delete/${user.id}`,{
                  method:"Delete"
                })
                window.location.reload()
              }}>删除</Button></TableCell>
              <TableCell className="text-right">{user?.miniClub?.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default UserView;
