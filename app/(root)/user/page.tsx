'use client'

import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card"
import { useUser } from '@clerk/nextjs';

const UserDashboard = () => {
  const [userData, setUserData] = useState<any>(null)
  const [users, setUsers] = useState<any>(null)
  const { isLoaded, user } = useUser()

  useEffect(() => {
    async function fetchUserData(name: string) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/findOne`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: name,
          }),
        });
        console.log(response)
        const data = await response.json();
        setUsers(data);
        setUserData({
          name: user?.firstName + user?.lastName,
          department: data?.club,
          completedAssessments: 5,
          pendingAssessments: 2
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }

    if (isLoaded && user) {
      const name = user.firstName + user.lastName;
      fetchUserData(name);
    }
  }, [isLoaded, user]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-8">
        个人概览
      </h2>

      {/* Basic Info Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-6">基本信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-sm text-gray-600 mb-2">姓名</p>
            <p className="text-lg font-medium">{userData?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">部门</p>
            <p className="text-lg font-medium">{userData?.department}</p>
          </div>
        </div>
      </div>

      {/* Assessment Stats Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">测评统计</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-sm text-gray-600 mb-2">已完成测评</p>
            <p className="text-lg font-medium">{userData?.completedAssessments}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">待完成测评</p>
            <p className="text-lg font-medium">{userData?.pendingAssessments}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 