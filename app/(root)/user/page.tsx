'use client'

import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card"
import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';

const UserDashboard = () => {
  const [userData, setUserData] = useState<any>(null)
  const [users, setUsers] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { isLoaded, user } = useUser()
  const [numSuccess, setNumSuccess] = useState(0)
  const [numPending, setNumPending] = useState(0)
  const { signOut } = useClerk()

  useEffect(() => {
    async function fetchUserData(name: string) {
      try {
        setIsLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/findOne`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: name,
          }),
        });
        
        const testDataResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/getTestData/${user?.firstName+user?.lastName}`);
        const testData = await testDataResponse.json();
        console.log(1, testData)
        
        // Use local variables to count
        let successCount = 0;
        let pendingCount = 0;
        
        // Make sure testData is an array before iterating
        if (Array.isArray(testData)) {
          for (const each of testData) {
            if (each.status === 'COMPLETED') {
              successCount++;
            } else if (each.status === 'PENDING') {
              pendingCount++;
            }
          }
        }
        
        // Update state once after counting
        setNumSuccess(successCount);
        setNumPending(pendingCount);
        
        const data = await response.json();
        setUsers(data);
        setUserData({
          name: user?.firstName + user?.lastName,
          department: typeof data?.club === 'object' ? data?.club?.name || '未分配' : data?.club || '未分配',
          completedAssessments: successCount,
          pendingAssessments: pendingCount
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false)
      }
    }

    if (isLoaded && user) {
      const name = user.firstName + user.lastName;
      fetchUserData(name);
    }
  }, [isLoaded, user]);

  

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header with back button */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">个人概览</h2>
            <p className="text-gray-500 mt-1">查看您的个人信息和测评状态</p>
          </div>
          <div className="flex gap-2">
            <Link 
              href="/"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors flex items-center gap-2 hover:shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Home
            </Link>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors flex items-center gap-2 hover:shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* User Profile Card */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>
              
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">
                    {userData?.name?.charAt(0) || '?'}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{userData?.name || '加载中...'}</h3>
                  <div className="flex items-center mt-1">
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {userData?.department || '未分配'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Completed Assessments Card */}
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">已完成测评</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{userData?.completedAssessments || 0}</p>
                  </div>
                  <div className="bg-emerald-100 p-3 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">上次完成: 2023-05-15</p>
                </div>
              </div>
              
              {/* Pending Assessments Card */}
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-amber-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">待完成测评</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{userData?.pendingAssessments || 0}</p>
                  </div>
                  <div className="bg-amber-100 p-3 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">下次截止: 2023-06-30</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">最近活动</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">完成了季度能力评估</p>
                    <p className="text-sm text-gray-500">2023-05-15 14:30</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">查看了团队绩效报告</p>
                    <p className="text-sm text-gray-500">2023-05-10 09:15</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">收到新的技能评估通知</p>
                    <p className="text-sm text-gray-500">2023-05-05 11:45</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserDashboard; 