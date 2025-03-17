'use client'

import React, {useEffect, useState} from 'react';
import InfoCard from "@/components/shared/InfoCard";
import { House, Search, Loader2, Users, UserRound, Building2 } from 'lucide-react';

const ClubUpdateChoose = () => {
  const [allClubs, setAllClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllClubs = async () => {
      try {
        setIsLoading(true);
        const allClubs = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/clubs/findAll`).then(async res => await res.json());
        console.log(allClubs);
        setAllClubs(allClubs);
        setFilteredClubs(allClubs);
      } catch (error) {
        console.error("Error fetching clubs:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAllClubs();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClubs(allClubs);
    } else {
      const filtered = allClubs.filter((club: any) => 
        club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.user?.some((user: any) => 
          user.name?.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        club.miniClub?.some((miniClub: any) => 
          miniClub.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredClubs(filtered);
    }
  }, [searchTerm, allClubs]);

  // Calculate statistics
  const totalEmployees = allClubs.reduce((acc: number, club: any) => 
    acc + (club.user?.length || 0), 0
  );
  
  const totalMiniClubs = allClubs.reduce((acc: number, club: any) => 
    acc + (club.miniClub?.length || 0), 0
  );
  
  const managersCount = allClubs.reduce((acc: number, club: any) => {
    const hasManager = club.user?.some((user: any) => user.role === "MANAGER");
    return acc + (hasManager ? 1 : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-emerald-100">
                <House className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">更新部门</h2>
                <p className="text-gray-500 mt-1">管理和更新现有部门信息</p>
              </div>
            </div>
            
            {/* Search input */}
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="搜索部门或员工..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-emerald-50 rounded-lg p-3 flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 rounded-full">
                <Building2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">总部门数</p>
                <p className="text-2xl font-bold text-emerald-700">{allClubs.length}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-full">
                <UserRound className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">总员工数</p>
                <p className="text-2xl font-bold text-blue-700">{totalEmployees}</p>
              </div>
            </div>
            
            <div className="bg-indigo-50 rounded-lg p-3 flex items-center gap-2">
              <div className="p-1.5 bg-indigo-100 rounded-full">
                <Users className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">总小组数</p>
                <p className="text-2xl font-bold text-indigo-700">{totalMiniClubs}</p>
              </div>
            </div>
            
            <div className="bg-amber-50 rounded-lg p-3 flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-700 font-medium">已分配主管</p>
                <p className="text-2xl font-bold text-amber-700">{managersCount}/{allClubs.length}</p>
              </div>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
            <span className="ml-2 text-gray-700 font-medium">加载部门数据中...</span>
          </div>
        ) : (
          <>
            {filteredClubs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="inline-flex items-center justify-center p-4 bg-gray-100 rounded-full mb-4">
                  <Search className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">未找到匹配的部门</h3>
                <p className="text-gray-600 mb-4">尝试使用不同的搜索词或清除搜索</p>
                <button 
                  className="text-emerald-600 hover:text-emerald-800 font-medium"
                  onClick={() => setSearchTerm('')}
                >
                  清除搜索
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredClubs.map((club: any, index: number) => (
                  <div key={index} className="h-full">
                    <InfoCard 
                      name={club.name} 
                      type="clubs" 
                      description1={`部门主管: ${club?.user?.find((user: any) => (user?.role === "MANAGER"))?.name || "无"}`}
                      description0={`部门总共有 ${club.user.length} 个员工`} 
                      content={club?.miniClub?.map((miniClub: any) => ({
                        key: miniClub.name, 
                        value: miniClub.name ? [
                          `小组组长: ${miniClub?.user?.find((user: any) => user?.role === "LEADER")?.name || "无"}`,
                          `小组人数: ${miniClub?.user?.length}`
                        ] : []
                      }))}
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

export default ClubUpdateChoose;
