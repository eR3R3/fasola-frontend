'use client'

import React, { useEffect, useState } from 'react';
import { Button } from "@heroui/button";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import InfoCard from "@/components/shared/InfoCard";
import { ClipboardList, Search, Loader2, FileText, HelpCircle, BarChart } from 'lucide-react';

interface MiniTest {
  id: string;
  name: string;
  question: {
    name: string;
    content: string
  }[];
  proportion: number[];
  test: any[]
}

const UpdateMiniTests = () => {
  const [miniTests, setMiniTests] = useState<MiniTest[]>([]);
  const [filteredMiniTests, setFilteredMiniTests] = useState<MiniTest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [testFilter, setTestFilter] = useState('');
  const [uniqueTests, setUniqueTests] = useState<string[]>([]);
  
  const router = useRouter();

  useEffect(() => {
    fetchMiniTests();
  }, []);

  const fetchMiniTests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/miniTests/findAll`);
      if (!response.ok) {
        throw new Error('Failed to fetch mini tests');
      }
      const data = await response.json();
      console.log(data);
      setMiniTests(data);
      setFilteredMiniTests(data);
      
      // Extract unique test names for filtering
      const tests = data.flatMap((miniTest: MiniTest) => 
        miniTest.test?.map((t: any) => t.name) || []
      ).filter(Boolean);
      setUniqueTests([...new Set(tests)]);
    } catch (error) {
      console.error('Error fetching mini tests:', error);
      toast({
        variant: "default",
        title: "错误",
        description: "获取小测试列表失败",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...miniTests];
    
    // Apply test filter if selected
    if (testFilter) {
      filtered = filtered.filter((miniTest: MiniTest) => 
        miniTest.test?.some((t: any) => t.name === testFilter)
      );
    }
    
    // Apply search term filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter((miniTest: MiniTest) => 
        miniTest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        miniTest.question?.some((q: any) => 
          q.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.content?.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        miniTest.test?.some((t: any) => 
          t.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    setFilteredMiniTests(filtered);
  }, [searchTerm, testFilter, miniTests]);

  // Calculate statistics
  const totalQuestions = miniTests.reduce((acc: number, miniTest: MiniTest) => 
    acc + (miniTest.question?.length || 0), 0
  );
  
  const avgQuestionsPerTest = miniTests.length > 0 
    ? Math.round((totalQuestions / miniTests.length) * 10) / 10
    : 0;
    
  const totalProportions = miniTests.reduce((acc: number, miniTest: MiniTest) => 
    acc + miniTest.proportion.reduce((sum: number, prop: number) => sum + prop, 0), 0
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-100">
                <ClipboardList className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">小测试管理</h2>
                <p className="text-gray-500 mt-1">管理和更新现有小测试信息</p>
              </div>
            </div>
            
            {/* Search input */}
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="搜索小测试或问题..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-amber-50 rounded-lg p-3 flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 rounded-full">
                <ClipboardList className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">总小测试数</p>
                <p className="text-2xl font-bold text-amber-700">{miniTests.length}</p>
              </div>
            </div>
            
            <div className="bg-cyan-50 rounded-lg p-3 flex items-center gap-2">
              <div className="p-1.5 bg-cyan-100 rounded-full">
                <HelpCircle className="h-4 w-4 text-cyan-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">总问题数</p>
                <p className="text-2xl font-bold text-cyan-700">{totalQuestions}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-full">
                <BarChart className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">平均问题数/测试</p>
                <p className="text-2xl font-bold text-blue-700">{avgQuestionsPerTest}</p>
              </div>
            </div>
            
            <div className="bg-rose-50 rounded-lg p-3 flex items-center gap-2">
              <div className="p-1.5 bg-rose-100 rounded-full">
                <FileText className="h-4 w-4 text-rose-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">关联测试数</p>
                <p className="text-2xl font-bold text-rose-700">{uniqueTests.length}</p>
              </div>
            </div>
          </div>
          
          {/* Test Filter */}
          {uniqueTests.length > 0 && (
            <div className="border-t border-gray-100 pt-4 mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">按测试筛选</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    testFilter === '' 
                      ? 'bg-amber-100 text-amber-700 font-medium' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setTestFilter('')}
                >
                  全部
                </button>
                
                {uniqueTests.map((test, index) => (
                  <button
                    key={index}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors flex items-center gap-1 ${
                      testFilter === test 
                        ? 'bg-amber-100 text-amber-700 font-medium' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setTestFilter(test)}
                  >
                    <FileText size={14} />
                    {test}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
            <span className="ml-2 text-gray-700 font-medium">加载小测试数据中...</span>
          </div>
        ) : (
          <>
            {filteredMiniTests.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="inline-flex items-center justify-center p-4 bg-gray-100 rounded-full mb-4">
                  <Search className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">未找到匹配的小测试</h3>
                <p className="text-gray-600 mb-4">尝试使用不同的搜索词或清除筛选条件</p>
                <div className="flex justify-center gap-3">
                  <button 
                    className="text-amber-600 hover:text-amber-800 font-medium"
                    onClick={() => {
                      setSearchTerm('')
                      setTestFilter('')
                    }}
                  >
                    清除所有筛选
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMiniTests.map((miniTest) => (
                  <div key={miniTest.id} className="h-full">
                    <InfoCard
                      name={miniTest.name}
                      type="miniTests"
                      description0={`此小测试属于: ${miniTest?.test?.map((t) => (t.name)).join(', ') || "无"}`}
                      description1={`总问题数: ${miniTest.question.length}`}
                      content={
                        miniTest.question.map((q, index) => ({
                          key: q.name, 
                          value: [q.content, `占比: ${miniTest.proportion[index]}`]
                        }))
                      }
                    />
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

export default UpdateMiniTests; 