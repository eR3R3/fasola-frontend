'use client'

import React, {useEffect, useState} from 'react';
import InfoCard from "@/components/shared/InfoCard";

const ClubUpdateChoose = () => {

  const [allClubs, setAllClubs] = useState([])

  useEffect(() => {
    const fetchAllClubs = async () => {
      const allClubs = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/clubs/findAll`).then(async res => await res.json())
      console.log(allClubs)
      setAllClubs(allClubs)
    }
    fetchAllClubs()
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-8">
        更新部门
      </h2>
      <div className="flex flex-wrap w-full gap-10">
        {allClubs.map((club: any, index: number)=>(
          <InfoCard key={index} name={club.name} type="clubs" description1={`部门主管:${club?.user?.find((user:any)=>(user?.role==="MANAGER"))?.name||"无"}`}
          description0={`部门总共有${club.user.length}个员工`} content={club?.miniClub?.map(miniClub=>({key: miniClub.name, value: miniClub.name?[`小组组长:${miniClub?.user?.find((user:any)=>user?.role==="LEADER")?.name||"无"}`,`小组人数:${miniClub?.user?.length}`]:[]}))}/>
        ))}
      </div>
    </div>
  );
};

export default ClubUpdateChoose;
