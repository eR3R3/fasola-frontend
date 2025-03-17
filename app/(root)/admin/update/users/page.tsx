'use client'

import React, {useEffect, useState} from 'react';
import InfoCard from "@/components/shared/InfoCard";
import { CircleUserRound, Search, Loader2, Building2, Briefcase, Users, UserRound } from 'lucide-react';

const UserUpdateChoose = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [clubFilter, setClubFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [uniqueClubs, setUniqueClubs] = useState<string[]>([]);
  const [uniqueRoles, setUniqueRoles] = useState<string[]>([]);

  useEffect(() => {
    const handleAllUser = async () => {
      try {
        setIsLoading(true);
        const allUsers = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/findAll`, {
          method: 'GET',
          headers: {'Content-Type': 'application/json'},
        }).then(async res => await res.json());
        console.log(allUsers);
        setAllUsers(allUsers);
        setFilteredUsers(allUsers);
        
        // Extract unique club names and roles for filtering
        const clubs = allUsers.map((user: any) => user.club?.name).filter((name): name is string => Boolean(name));
        setUniqueClubs(Array.from(new Set(clubs)) as string[]);
        const roles = allUsers.map((user: any) => user.role as string).filter(Boolean);
        setUniqueRoles(Array.from(new Set(roles)) as string[]);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    }
    handleAllUser();
  }, []);

  useEffect(() => {
    let filtered = [...allUsers];
    
    // Apply club filter if selected
    if (clubFilter) {
      filtered = filtered.filter((user: any) => 
        user.club?.name === clubFilter
      );
    }
    
    // Apply role filter if selected
    if (roleFilter) {
      filtered = filtered.filter((user: any) => 
        user.role === roleFilter
      );
    }
    
    // Apply search term filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter((user: any) => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.club?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.miniClub?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.position?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredUsers(filtered);
  }, [searchTerm, clubFilter, roleFilter, allUsers]);

  // Calculate statistics
  const genderStats = allUsers.reduce((acc: any, user: any) => {
    const gender = user.gender || '未知';
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {});
  
  const roleStats = allUsers.reduce((acc: any, user: any) => {
    const role = user.role || '未知';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});
  
  const miniClubCount = allUsers.filter((user: any) => user.miniClub).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <CircleUserRound className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">更新员工</h2>
                <p className="text-gray-500 mt-1">管理和更新现有员工信息</p>
              </div>
            </div>
            
            {/* Search input */}
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="搜索员工、部门或岗位..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-6">
            <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-full">
                <UserRound className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">总员工数</p>
                <p className="text-2xl font-bold text-blue-700">{allUsers.length}</p>
              </div>
            </div>
            
            <div className="bg-emerald-50 rounded-lg p-3 flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 rounded-full">
                <Building2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">部门分布</p>
                <p className="text-2xl font-bold text-emerald-700">{uniqueClubs.length} 个部门</p>
              </div>
            </div>
            
            <div className="bg-indigo-50 rounded-lg p-3 flex items-center gap-2">
              <div className="p-1.5 bg-indigo-100 rounded-full">
                <Users className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">小组成员</p>
                <p className="text-2xl font-bold text-indigo-700">{miniClubCount} 人</p>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-3 flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 rounded-full">
                <Briefcase className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">角色分布</p>
                <div className="flex gap-2 items-center">
                  {roleStats['MANAGER'] && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      主管: {roleStats['MANAGER']}
                    </span>
                  )}
                  {roleStats['LEADER'] && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      组长: {roleStats['LEADER']}
                    </span>
                  )}
                  {roleStats['WORKER'] && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      员工: {roleStats['WORKER']}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-100 pt-4">
            {/* Club Filter */}
            {uniqueClubs.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">按部门筛选</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      clubFilter === '' 
                        ? 'bg-blue-100 text-blue-700 font-medium' 
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
                          ? 'bg-blue-100 text-blue-700 font-medium' 
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
            
            {/* Role Filter */}
            {uniqueRoles.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">按角色筛选</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      roleFilter === '' 
                        ? 'bg-blue-100 text-blue-700 font-medium' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setRoleFilter('')}
                  >
                    全部
                  </button>
                  
                  {uniqueRoles.map((role, index) => {
                    let icon;
                    let bgColor = 'bg-gray-100';
                    let textColor = 'text-gray-700';
                    
                    if (role === 'MANAGER') {
                      icon = <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>;
                      bgColor = roleFilter === role ? 'bg-amber-100' : 'bg-gray-100';
                      textColor = roleFilter === role ? 'text-amber-700' : 'text-gray-700';
                    } else if (role === 'LEADER') {
                      icon = <Users size={14} />;
                      bgColor = roleFilter === role ? 'bg-green-100' : 'bg-gray-100';
                      textColor = roleFilter === role ? 'text-green-700' : 'text-gray-700';
                    } else {
                      icon = <UserRound size={14} />;
                      bgColor = roleFilter === role ? 'bg-blue-100' : 'bg-gray-100';
                      textColor = roleFilter === role ? 'text-blue-700' : 'text-gray-700';
                    }
                    
                    return (
                      <button
                        key={index}
                        className={`px-3 py-1.5 text-sm rounded-full transition-colors flex items-center gap-1 ${bgColor} ${textColor} hover:opacity-90`}
                        onClick={() => setRoleFilter(role)}
                      >
                        {icon}
                        {role === 'MANAGER' ? '主管' : role === 'LEADER' ? '组长' : role === 'ADMIN' ? '管理员' : '员工'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-2 text-gray-700 font-medium">加载员工数据中...</span>
          </div>
        ) : (
          <>
            {filteredUsers.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="inline-flex items-center justify-center p-4 bg-gray-100 rounded-full mb-4">
                  <Search className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">未找到匹配的员工</h3>
                <p className="text-gray-600 mb-4">尝试使用不同的搜索词或清除筛选条件</p>
                <div className="flex justify-center gap-3">
                  <button 
                    className="text-blue-600 hover:text-blue-800 font-medium"
                    onClick={() => {
                      setSearchTerm('')
                      setClubFilter('')
                      setRoleFilter('')
                    }}
                  >
                    清除所有筛选
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredUsers.map((user: any, index: number) => (
                  <div key={index} className="h-full">
                    <InfoCard 
                      name={user.name} 
                      type="users"
                      description1={`所属部门: ${user?.club?.name || "无"}`}
                      description0={`用户级别: ${
                        user?.role === 'MANAGER' ? '主管' : 
                        user?.role === 'LEADER' ? '组长' : '员工'
                      }`} 
                      content={[{
                        value: [
                          `用户性别: ${user.gender}`,
                          `所属小组: ${user.miniClub?.name || "无"}`,
                          `手机号码: ${user.phone}`,
                          `用户岗位: ${user?.position?.name || "无"}`
                        ]
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

export default UserUpdateChoose;
