'use client'

import React, {useEffect, useState} from 'react';
import InfoCard from "@/components/shared/InfoCard";

const MiniClubUpdateChoose = () => {

  const [allMiniClubs, setAllMiniClubs] = useState([])

  useEffect(() => {
    const fetchAllClubs = async () => {
      const allMiniClubs = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/miniClubs/findAll`).then(async res => await res.json())
      console.log(allMiniClubs)
      setAllMiniClubs(allMiniClubs)
    }
    fetchAllClubs()
  }, [])
  console.log(allMiniClubs)

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-8">
        更新小组
      </h2>
      <div className="flex flex-wrap w-full gap-10">
        {allMiniClubs.map((miniClub: any, index: number) => (
          <InfoCard
            key={miniClub.id || index} // Prefer using unique ID if available
            name={miniClub.name}
            type="miniClubs"
            description1={`小组组长:${
              miniClub.user.find(user => user.role === "LEADER")?.name || "无"
            }`}
            description0={`小组总共有${miniClub.user.length}个员工, 属于${miniClub.club.name}`}
            content={[{
              value: miniClub.user
                .filter(user => user.role === "WORKER")
                .map(user => user.name)
                .filter(Boolean)
            }]}
          />
        ))}
      </div>
    </div>
  );
};

export default MiniClubUpdateChoose;
