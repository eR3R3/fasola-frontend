'use client'

import React, {useEffect, useState} from 'react';
import InfoCard from "@/components/shared/InfoCard";
import { UsersRound, Search, Loader2, Building2, User } from 'lucide-react';
import Link from 'next/link';

const MiniClubUpdateChoose = () => {
  const [allMiniClubs, setAllMiniClubs] = useState([])
  const [filteredMiniClubs, setFilteredMiniClubs] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [clubFilter, setClubFilter] = useState('')
  const [uniqueClubs, setUniqueClubs] = useState<string[]>([])

  useEffect(() => {
    const fetchAllMiniClubs = async () => {
      try {
        setIsLoading(true)
        const allMiniClubs = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/miniClubs/findAll`).then(async res => await res.json())
        console.log(allMiniClubs)
        setAllMiniClubs(allMiniClubs)
        setFilteredMiniClubs(allMiniClubs)
        
        // Extract unique club names for filtering
        const clubs = allMiniClubs.map((miniClub: any) => miniClub.club?.name).filter(Boolean) as string[]
        setUniqueClubs([...new Set(clubs)])
      } catch (error) {
        console.error("Error fetching mini clubs:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAllMiniClubs()
  }, [])

  useEffect(() => {
    let filtered = [...allMiniClubs]
    
    // Apply club filter if selected
    if (clubFilter) {
      filtered = filtered.filter((miniClub: any) => 
        miniClub.club?.name === clubFilter
      )
    }
    
    // Apply search term filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter((miniClub: any) => 
        miniClub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        miniClub.club?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        miniClub.user?.some((user: any) => 
          user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }
    
    setFilteredMiniClubs(filtered)
  }, [searchTerm, clubFilter, allMiniClubs])

  // Calculate total members across all mini clubs
  const totalMembers = allMiniClubs.reduce((acc: number, miniClub: any) => 
    acc + (miniClub.user?.length || 0), 0
  )

  // Calculate total leaders
  const totalLeaders = allMiniClubs.reduce((acc: number, miniClub: any) => {
    const hasLeader = miniClub.user?.some((user: any) => user.role === "LEADER")
    return acc + (hasLeader ? 1 : 0)
  }, 0)

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-indigo-100">
                <UsersRound className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">更新小组</h2>
                <p className="text-gray-500 mt-1">管理和更新现有小组信息</p>
              </div>
            </div>
            
            {/* Search input */}
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="搜索小组或员工..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-6">
            <div className="bg-indigo-50 rounded-lg p-3 flex items-center gap-2">
              <div className="p-1.5 bg-indigo-100 rounded-full">
                <UsersRound className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">总小组数</p>
                <p className="text-2xl font-bold text-indigo-700">{allMiniClubs.length}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-full">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">总成员数</p>
                <p className="text-2xl font-bold text-blue-700">{totalMembers}</p>
              </div>
            </div>
            
            <div className="bg-emerald-50 rounded-lg p-3 flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-700 font-medium">已分配组长</p>
                <p className="text-2xl font-bold text-emerald-700">{totalLeaders}</p>
              </div>
            </div>
            
            <div className="bg-amber-50 rounded-lg p-3 flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-700 font-medium">未分配组长</p>
                <p className="text-2xl font-bold text-amber-700">{allMiniClubs.length - totalLeaders}</p>
              </div>
            </div>
          </div>
          
          {/* Department Filter */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">按部门筛选</h3>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  clubFilter === '' 
                    ? 'bg-indigo-100 text-indigo-700 font-medium' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setClubFilter('')}
              >
                全部
              </button>
              
              {uniqueClubs.map((club, index) => (
                <button
                  key={index}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors flex items-center gap-1 ${
                    clubFilter === club 
                      ? 'bg-indigo-100 text-indigo-700 font-medium' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setClubFilter(club)}
                >
                  <Building2 size={14} />
                  {club}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            <span className="ml-2 text-gray-700 font-medium">加载小组数据中...</span>
          </div>
        ) : (
          <>
            {filteredMiniClubs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="inline-flex items-center justify-center p-4 bg-gray-100 rounded-full mb-4">
                  <Search className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">未找到匹配的小组</h3>
                <p className="text-gray-600 mb-4">尝试使用不同的搜索词或清除筛选条件</p>
                <div className="flex justify-center gap-3">
                  <button 
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                    onClick={() => {
                      setSearchTerm('')
                      setClubFilter('')
                    }}
                  >
                    清除所有筛选
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMiniClubs.map((miniClub: any, index: number) => (
                  <div key={miniClub.id || index} className="h-full">
                    <InfoCard
                      name={miniClub.name}
                      type="miniClubs"
                      description1={`小组组长: ${
                        miniClub.user.find((user: any) => user.role === "LEADER")?.name || "无"
                      }`}
                      description0={`小组总共有 ${miniClub.user.length} 个员工, 属于 ${miniClub.club.name}`}
                      content={[{
                        value: miniClub.user
                          .filter((user: any) => user.role === "WORKER")
                          .map((user: any) => user.name)
                          .filter(Boolean)
                      }]}
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

export default MiniClubUpdateChoose;