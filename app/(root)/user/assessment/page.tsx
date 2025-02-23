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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/assignments/findAll`);
      const data = await response.json();
      setAssessments(data.map((each: any)=>(
        {
          name: each.test.name,
          status: each.status,
          reviewee: each.reviewee.name
        }
      )));
      console.log(data)
    }
    fetchAssessments();
    setAssessments([
      {
        id: "1",
        name: "2024年第一季度测评",
        deadline: "2024-03-31",
        status: "pending"
      },
      {
        id: "2",
        name: "2023年第四季度测评",
        deadline: "2023-12-31",
        status: "completed"
      }
    ]);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-8">
        测评列表
      </h2>

      <div className="space-y-6">
        {assessments.map((assessment, index) => (
          <div 
            key={index} 
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {assessment.name}
                </h3>
                <p className="text-sm text-gray-600">
                  被评价人: {assessment.reviewee}
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