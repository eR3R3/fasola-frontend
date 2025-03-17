'use client'

import React, { useEffect, useState } from 'react';
import InfoCard from "@/components/shared/InfoCard";
import { HelpCircle, Search, Loader2, FileText, ClipboardList } from 'lucide-react';

const UpdateQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [miniTestFilter, setMiniTestFilter] = useState('');
  const [uniqueMiniTests, setUniqueMiniTests] = useState<string[]>([]);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        setIsLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/questions/findAll`);
        const data = await response.json();
        setQuestions(data);
        setFilteredQuestions(data);
        
        // Extract unique mini test names for filtering
        const miniTests = data.flatMap((question: any) => 
          question.miniTest?.map((mt: any) => mt.name) || []
        ).filter(Boolean);
        setUniqueMiniTests([...new Set(miniTests)]);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  useEffect(() => {
    let filtered = [...questions];
    
    // Apply mini test filter if selected
    if (miniTestFilter) {
      filtered = filtered.filter((question: any) => 
        question.miniTest?.some((mt: any) => mt.name === miniTestFilter)
      );
    }
    
    // Apply search term filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter((question: any) => 
        question.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.miniTest?.some((mt: any) => 
          mt.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    setFilteredQuestions(filtered);
  }, [searchTerm, miniTestFilter, questions]);

  // Calculate statistics
  const totalMiniTests = questions.reduce((acc: number, question: any) => 
    acc + (question.miniTest?.length || 0), 0
  );
  
  const avgContentLength = questions.length > 0 
    ? Math.round(questions.reduce((acc: number, question: any) => 
        acc + (question.content?.length || 0), 0) / questions.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-cyan-100">
                <HelpCircle className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">更新问题</h2>
                <p className="text-gray-500 mt-1">管理和更新现有问题信息</p>
              </div>
            </div>
            
            {/* Search input */}
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="搜索问题或小测试..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-cyan-50 rounded-lg p-3 flex items-center gap-2">
              <div className="p-1.5 bg-cyan-100 rounded-full">
                <HelpCircle className="h-4 w-4 text-cyan-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">总问题数</p>
                <p className="text-2xl font-bold text-cyan-700">{questions.length}</p>
              </div>
            </div>
            
            <div className="bg-amber-50 rounded-lg p-3 flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 rounded-full">
                <ClipboardList className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">关联小测试数</p>
                <p className="text-2xl font-bold text-amber-700">{totalMiniTests}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-full">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">平均内容长度</p>
                <p className="text-2xl font-bold text-blue-700">{avgContentLength}</p>
              </div>
            </div>
          </div>
          
          {/* Mini Test Filter */}
          {uniqueMiniTests.length > 0 && (
            <div className="border-t border-gray-100 pt-4 mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">按小测试筛选</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    miniTestFilter === '' 
                      ? 'bg-cyan-100 text-cyan-700 font-medium' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setMiniTestFilter('')}
                >
                  全部
                </button>
                
                {uniqueMiniTests.map((miniTest, index) => (
                  <button
                    key={index}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors flex items-center gap-1 ${
                      miniTestFilter === miniTest 
                        ? 'bg-cyan-100 text-cyan-700 font-medium' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setMiniTestFilter(miniTest)}
                  >
                    <ClipboardList size={14} />
                    {miniTest}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
            <span className="ml-2 text-gray-700 font-medium">加载问题数据中...</span>
          </div>
        ) : (
          <>
            {filteredQuestions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="inline-flex items-center justify-center p-4 bg-gray-100 rounded-full mb-4">
                  <Search className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">未找到匹配的问题</h3>
                <p className="text-gray-600 mb-4">尝试使用不同的搜索词或清除筛选条件</p>
                <div className="flex justify-center gap-3">
                  <button 
                    className="text-cyan-600 hover:text-cyan-800 font-medium"
                    onClick={() => {
                      setSearchTerm('')
                      setMiniTestFilter('')
                    }}
                  >
                    清除所有筛选
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredQuestions.map((question: any, index: number) => (
                  <div key={index} className="h-full">
                    <InfoCard 
                      name={question.name} 
                      type="questions" 
                      description0={`此问题属于 ${question?.miniTest?.map((m: any) => m.name).join(', ') || "无"}`} 
                      content={[{value: [question.content]}]}
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

export default UpdateQuestions; 