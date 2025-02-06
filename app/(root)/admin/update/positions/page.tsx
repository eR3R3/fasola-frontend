'use client'

import React, {useEffect, useState} from 'react';
import InfoCard from "@/components/shared/InfoCard";

const PositionUpdateChoose = () => {

  const [allPositions, setAllPositions] = useState([])

  useEffect(() => {
    const fetchAllClubs = async () => {
      const allPositions = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/positions/findAll`).then(async res => await res.json())
      console.log(allPositions)
      setAllPositions(allPositions)
    }
    fetchAllClubs()
  }, [])
  console.log(allPositions)

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-8">
        更新岗位
      </h2>
      <div className="flex flex-wrap w-full gap-10">
        {allPositions.map((position: any, index: number) => (
          <InfoCard
            key={position.id || index}
            name={position.name}
            type="positions"
            description1={`此岗位属于${position.club.map(club=>club.name)}`}
            description0={`此岗位总共有${position.user.length}个员工,`}
            content={[{
              value: position.user
                .map(user => user.name)
                .filter(Boolean)
            }]}
          />
        ))}
      </div>
    </div>
  );
};

export default PositionUpdateChoose;
