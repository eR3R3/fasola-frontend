'use client'

import React, { useEffect, useState } from 'react';
import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";
import { useUser } from '@clerk/nextjs';

interface Assessment {
  id: string;
  name: string;
  reviewee?: string;
  deadline: string;
  status: 'pending' | 'completed';
}

const AssessmentPage = () => {
  const router = useRouter();
  const { isLoaded, user } = useUser()
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  useEffect(() => {
    const fetchAssessments = async () => {
      if (!user) return;
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/getTestData/${user?.firstName+user?.lastName}`);
        const data = await response.json();
        console.log(data)
        // Properly map the data to ensure all properties are strings
        const formattedData = data.map((each: any) => ({
          id: each.id || String(Math.random()),
          name: typeof each.test === 'object' && each.test ? each.test.name : 'Unnamed Test',
          status: each.status || 'pending',
          reviewee: typeof each.reviewee === 'object' && each.reviewee ? each.reviewee.name : 'Unnamed User',
        }));
        
        setAssessments(formattedData);
      } catch (error) {
        console.error("Error fetching assessments:", error);
        // Fallback data in case of error
        setAssessments([
          {
            id: "1",
            name: "联系er1r1@qq.com",
            deadline: "2024-03-31",
            status: "pending"
          },
        ]);
      }
    };
    
    fetchAssessments();
  }, [user]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-8">
        测评列表
      </h2>

      <div className="space-y-6">
        {assessments.map((assessment, index) => (
          <div 
            key={assessment.id || index} 
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {assessment.name}
                </h3>
                <p className="text-sm text-gray-600">
                  被评价人: {assessment.reviewee || 'N/A'}
                </p>
              </div>
              <Button
                variant="solid"
                disabled={assessment.status === 'completed'}
                onPress={() => router.push(`/user/assessment/${assessment.id}`)}
                className={`px-6 py-2 rounded-lg transition-colors duration-200 ease-in-out
                  ${assessment.status === 'completed' 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-400 hover:bg-gray-700 text-gray-100 shadow-sm hover:shadow-md'
                  }`}
              >
                {assessment.status === 'completed' ? '已完成' : '开始测评'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssessmentPage; 