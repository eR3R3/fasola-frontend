'use client'

import React, {useEffect, useState} from 'react';
import InfoCard from "@/components/shared/InfoCard";

const UserUpdateChoose = () => {

  const [allUsers, setAllUsers] = useState([])

  useEffect(() => {
    const handleAllUser = async () => {
      const allUsers = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/findAll`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
      }).then(async res => await res.json())
      console.log(allUsers)
      setAllUsers(allUsers)
    }
    handleAllUser()
  },[])

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-8">
        更新人员
      </h2>
      <div className="flex flex-wrap w-full gap-10">
        {allUsers.map((user: any, index: number)=>(
          <InfoCard key={index} name={user.name} type="users"
                    description1={`所属部门:${user?.club?.name||"无"}`}
                    description0={`用户级别:${user?.role}`} content={[{value:[`用户性别: ${user.gender}`,
              `所属小组: ${user.miniClub?.name||"无"}`,
              `手机号码: ${user.phone}`,
              `用户岗位: ${user?.position?.name}`]}]}/>
        ))}
      </div>
    </div>
  );
};

export default UserUpdateChoose;
