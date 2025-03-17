'use client'

import React, { useEffect, useState } from 'react';
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "@/components/shared/InputField";
import { Button } from "@heroui/button";
import { toast, useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import AutoCompleteField from "@/components/shared/AutoCompleteField";
import InfoCard from "@/components/shared/InfoCard";
import { FileText, Search, Loader2, ClipboardList, BarChart } from 'lucide-react';

const UpdateTests = () => {
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTests() {
      try {
        setIsLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tests/findAll`);
        const data = await response.json();
        const formattedTests = data.map((test: any) => ({
          type: "tests",
          name: test.name,
          description0: `包含 ${test.miniTest.length} 个小测试`,
          description1: `总分值: ${test.proportion.reduce((a: number, b: number) => a + b, 0)}`,
          content: test.miniTest.map((miniTest: any, index: number) => ({
            key: miniTest.name,
            value: [`比重: ${test.proportion[index]}`, `题目数: ${miniTest.questions?.length || 0}`]
          }))
        }));
        setTests(formattedTests);
        setFilteredTests(formattedTests);
      } catch (error) {
        console.error("Error fetching tests:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTests();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTests(tests);
    } else {
      const filtered = tests.filter((test: any) => 
        test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.content?.some((item: any) => 
          item.key?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredTests(filtered);
    }
  }, [searchTerm, tests]);

  // Calculate statistics
  const totalMiniTests = tests.reduce((acc: number, test: any) => 
    acc + (test.content?.length || 0), 0
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-rose-100">
                <FileText className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">更新测试</h2>
                <p className="text-gray-500 mt-1">管理和更新现有测试信息</p>
              </div>
            </div>
            
            {/* Search input */}
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                placeholder="搜索测试或小测试..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-rose-50 rounded-lg p-3 flex items-center gap-2">
              <div className="p-1.5 bg-rose-100 rounded-full">
                <FileText className="h-4 w-4 text-rose-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">总测试数</p>
                <p className="text-2xl font-bold text-rose-700">{tests.length}</p>
              </div>
            </div>
            
            <div className="bg-amber-50 rounded-lg p-3 flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 rounded-full">
                <ClipboardList className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">总小测试数</p>
                <p className="text-2xl font-bold text-amber-700">{totalMiniTests}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-full">
                <BarChart className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">平均小测试数</p>
                <p className="text-2xl font-bold text-blue-700">
                  {tests.length > 0 ? (totalMiniTests / tests.length).toFixed(1) : '0'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 text-rose-500 animate-spin" />
            <span className="ml-2 text-gray-700 font-medium">加载测试数据中...</span>
          </div>
        ) : (
          <>
            {filteredTests.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="inline-flex items-center justify-center p-4 bg-gray-100 rounded-full mb-4">
                  <Search className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">未找到匹配的测试</h3>
                <p className="text-gray-600 mb-4">尝试使用不同的搜索词或清除搜索</p>
                <button 
                  className="text-rose-600 hover:text-rose-800 font-medium"
                  onClick={() => setSearchTerm('')}
                >
                  清除搜索
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTests.map((test: any, index: number) => (
                  <div key={index} className="h-full">
                    <InfoCard {...test} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UpdateTests; 