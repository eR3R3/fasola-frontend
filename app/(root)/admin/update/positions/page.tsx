'use client'

import React, {useEffect, useState} from 'react';
import InfoCard from "@/components/shared/InfoCard";
import { Briefcase, Search, Loader2, Building2, Users, UserRound } from 'lucide-react';

const PositionUpdateChoose = () => {
  const [allPositions, setAllPositions] = useState([]);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [clubFilter, setClubFilter] = useState('');
  const [uniqueClubs, setUniqueClubs] = useState<string[]>([]);

  useEffect(() => {
    const fetchAllPositions = async () => {
      try {
        setIsLoading(true);
        const allPositions = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/positions/findAll`).then(async res => await res.json());
        console.log(allPositions);
        setAllPositions(allPositions);
        setFilteredPositions(allPositions);
        
        // Extract unique club names for filtering
        const clubs = allPositions.flatMap((position: any) => 
          position.club?.map((club: any) => club.name) || []
        ).filter(Boolean);
        setUniqueClubs([...new Set(clubs)]);
      } catch (error) {
        console.error("Error fetching positions:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAllPositions();
  }, []);

  useEffect(() => {
    let filtered = [...allPositions];
    
    // Apply club filter if selected
    if (clubFilter) {
      filtered = filtered.filter((position: any) => 
        position.club?.some((club: any) => club.name === clubFilter)
      );
    }
    
    // Apply search term filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter((position: any) => 
        position.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        position.club?.some((club: any) => 
          club.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        position.user?.some((user: any) => 
          user.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    setFilteredPositions(filtered);
  }, [searchTerm, clubFilter, allPositions]);

  // Calculate statistics
  const totalEmployees = allPositions.reduce((acc: number, position: any) => 
    acc + (position.user?.length || 0), 0
  );
  
  const avgEmployeesPerPosition = allPositions.length > 0 
    ? Math.round((totalEmployees / allPositions.length) * 10) / 10
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-100">
                <Briefcase className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">更新岗位</h2>
                <p className="text-gray-500 mt-1">管理和更新现有岗位信息</p>
              </div>
            </div>
            
            {/* Search input */}
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="搜索岗位或部门..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-purple-50 rounded-lg p-3 flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 rounded-full">
                <Briefcase className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">总岗位数</p>
                <p className="text-2xl font-bold text-purple-700">{allPositions.length}</p>
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
            
            <div className="bg-emerald-50 rounded-lg p-3 flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 rounded-full">
                <Users className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">平均员工数/岗位</p>
                <p className="text-2xl font-bold text-emerald-700">{avgEmployeesPerPosition}</p>
              </div>
            </div>
          </div>
          
          {/* Club Filter */}
          {uniqueClubs.length > 0 && (
            <div className="border-t border-gray-100 pt-4 mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">按部门筛选</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    clubFilter === '' 
                      ? 'bg-purple-100 text-purple-700 font-medium' 
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
                        ? 'bg-purple-100 text-purple-700 font-medium' 
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
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
            <span className="ml-2 text-gray-700 font-medium">加载岗位数据中...</span>
          </div>
        ) : (
          <>
            {filteredPositions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="inline-flex items-center justify-center p-4 bg-gray-100 rounded-full mb-4">
                  <Search className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">未找到匹配的岗位</h3>
                <p className="text-gray-600 mb-4">尝试使用不同的搜索词或清除筛选条件</p>
                <div className="flex justify-center gap-3">
                  <button 
                    className="text-purple-600 hover:text-purple-800 font-medium"
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
                {filteredPositions.map((position: any, index: number) => (
                  <div key={position.id || index} className="h-full">
                    <InfoCard
                      name={position.name}
                      type="positions"
                      description1={`此岗位属于${position.club.map((club: any) => club.name).join(', ')}`}
                      description0={`此岗位总共有${position.user.length}个员工`}
                      content={[{
                        value: position.user
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

export default PositionUpdateChoose;
