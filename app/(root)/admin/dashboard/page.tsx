'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts/core';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bell, 
  Search, 
  Users, 
  CalendarDays, 
  Award, 
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  FileBarChart,
  Download
} from 'lucide-react';

interface User {
  id: string | number;
  name: string;
  club?: string;
  miniClub?: string;
  position?: string;
  role?: string;
}

interface Assessment {
  id: string | number;
  test: { 
    id: string | number; 
    name: string;
  };
  reviewer: User[];
  reviewee: User;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  scoreSet?: number[];
  createdAt?: string;
  averageScore?: number;
}

interface UserScore {
  userId: string | number;
  userName: string;
  totalAssessments: number;
  completedAssessments: number;
  averageScore: number;
  assessments: {
    id: string | number;
    testName: string;
    status: string;
    score: number | null;
  }[];
}

const Dashboard = () => {
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [userScores, setUserScores] = useState<UserScore[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserScore[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalAssessments: 0,
    completedAssessments: 0,
    pendingAssessments: 0,
    inProgressAssessments: 0,
    averageScore: 0,
    completionRate: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all assessments
        const assessmentResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/assignments/findAll`);
        if (!assessmentResponse.ok) {
          throw new Error('Failed to fetch assignments');
        }
        const assessmentData = await assessmentResponse.json();
        console.log('Fetched assessments:', assessmentData);
        setAssessments(assessmentData);
        setFilteredAssessments(assessmentData);
        
        // Process statistics
        processStatistics(assessmentData);
        
        // Process user scores
        const userScoreData = processUserScores(assessmentData);
        setUserScores(userScoreData);
        setFilteredUsers(userScoreData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process statistics from assessment data
  const processStatistics = (assessmentData: Assessment[]) => {
    const totalAssessments = assessmentData.length;
    const completedAssessments = assessmentData.filter(a => a.status === 'COMPLETED').length;
    const pendingAssessments = assessmentData.filter(a => a.status === 'PENDING').length;
    const inProgressAssessments = assessmentData.filter(a => a.status === 'IN_PROGRESS').length;
    
    // Calculate average score for completed assessments with scores
    const completedWithScores = assessmentData.filter(
      a => a.status === 'COMPLETED' && a.scoreSet && a.scoreSet.length > 0
    );
    
    let totalScore = 0;
    let scoreCount = 0;
    
    completedWithScores.forEach(assessment => {
      if (assessment.scoreSet) {
        const validScores = assessment.scoreSet.filter(score => score !== null && score !== undefined);
        totalScore += validScores.reduce((sum, score) => sum + score, 0);
        scoreCount += validScores.length;
      }
    });
    
    const averageScore = scoreCount > 0 ? (totalScore / scoreCount) : 0;
    const completionRate = totalAssessments > 0 ? (completedAssessments / totalAssessments) * 100 : 0;
    
    setStats({
      totalAssessments,
      completedAssessments,
      pendingAssessments,
      inProgressAssessments,
      averageScore,
      completionRate,
    });
  };

  // Process user scores from assessment data
  const processUserScores = (assessmentData: Assessment[]): UserScore[] => {
    const userMap = new Map<string | number, UserScore>();
    
    // Process each assessment
    assessmentData.forEach(assessment => {
      const revieweeId = assessment.reviewee.id;
      const revieweeName = assessment.reviewee.name;
      
      // Initialize user if not exists
      if (!userMap.has(revieweeId)) {
        userMap.set(revieweeId, {
          userId: revieweeId,
          userName: revieweeName,
          totalAssessments: 0,
          completedAssessments: 0,
          averageScore: 0,
          assessments: [],
        });
      }
      
      const userScore = userMap.get(revieweeId)!;
      
      // Update user assessment count
      userScore.totalAssessments += 1;
      if (assessment.status === 'COMPLETED') {
        userScore.completedAssessments += 1;
      }
      
      // Calculate average score for this assessment if completed
      let assessmentScore = null;
      if (assessment.status === 'COMPLETED' && assessment.scoreSet && assessment.scoreSet.length > 0) {
        const validScores = assessment.scoreSet.filter(score => score !== null && score !== undefined);
        assessmentScore = validScores.length > 0 
          ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length 
          : null;
      }
      
      // Add assessment to user's list
      userScore.assessments.push({
        id: assessment.id,
        testName: assessment.test.name,
        status: assessment.status,
        score: assessmentScore,
      });
      
      // Update average score for all completed assessments
      const completedWithScores = userScore.assessments.filter(
        a => a.status === 'COMPLETED' && a.score !== null
      );
      
      if (completedWithScores.length > 0) {
        const totalScore = completedWithScores.reduce(
          (sum, assessment) => sum + (assessment.score || 0), 
          0
        );
        userScore.averageScore = totalScore / completedWithScores.length;
      }
    });
    
    return Array.from(userMap.values());
  };

  // Handle search for assessments
  const handleAssessmentSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (!term) {
      setFilteredAssessments(assessments);
      return;
    }
    
    const filtered = assessments.filter(
      assessment => 
        assessment.test.name.toLowerCase().includes(term) ||
        assessment.reviewee.name.toLowerCase().includes(term) ||
        assessment.status.toLowerCase().includes(term)
    );
    
    setFilteredAssessments(filtered);
  };
  
  // Handle search for users
  const handleUserSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (!term) {
      setFilteredUsers(userScores);
      return;
    }
    
    const filtered = userScores.filter(
      user => user.userName.toLowerCase().includes(term)
    );
    
    setFilteredUsers(filtered);
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    let color = '';
    switch (status) {
      case 'COMPLETED':
        color = 'bg-green-100 text-green-800';
        break;
      case 'IN_PROGRESS':
        color = 'bg-blue-100 text-blue-800';
        break;
      case 'PENDING':
        color = 'bg-yellow-100 text-yellow-800';
        break;
      default:
        color = 'bg-gray-100 text-gray-800';
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {status === 'COMPLETED' ? '已完成' : 
         status === 'IN_PROGRESS' ? '进行中' : '待处理'}
      </span>
    );
  };

  // Chart options
  const getStatusChartOptions = (): any => {
    return {
      title: {
        text: '测评状态分布',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 10,
        data: ['已完成', '进行中', '待处理']
      },
      series: [
        {
          name: '测评状态',
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 18,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: stats.completedAssessments, name: '已完成', itemStyle: { color: '#10B981' } },
            { value: stats.inProgressAssessments, name: '进行中', itemStyle: { color: '#3B82F6' } },
            { value: stats.pendingAssessments, name: '待处理', itemStyle: { color: '#F59E0B' } }
          ]
        }
      ]
    };
  };

  const getScoreDistributionOptions = (): any => {
    // Calculate score distribution (1-5)
    const scoreDistribution = [0, 0, 0, 0, 0]; // For scores 1-5
    
    assessments.forEach(assessment => {
      if (assessment.status === 'COMPLETED' && assessment.scoreSet) {
        assessment.scoreSet.forEach(score => {
          if (score >= 1 && score <= 5) {
            scoreDistribution[score - 1]++;
          }
        });
      }
    });
    
    return {
      title: {
        text: '分数分布',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: ['1分', '2分', '3分', '4分', '5分'],
        axisTick: {
          alignWithLabel: true
        }
      },
      yAxis: {
        type: 'value',
        name: '数量'
      },
      series: [
        {
          name: '分数分布',
          type: 'bar',
          barWidth: '60%',
          data: [
            { value: scoreDistribution[0], itemStyle: { color: '#EF4444' } },
            { value: scoreDistribution[1], itemStyle: { color: '#F59E0B' } },
            { value: scoreDistribution[2], itemStyle: { color: '#3B82F6' } },
            { value: scoreDistribution[3], itemStyle: { color: '#10B981' } },
            { value: scoreDistribution[4], itemStyle: { color: '#6366F1' } }
          ]
        }
      ]
    };
  };

  const getUserPerformanceOptions = (): any => {
    // Get top 10 users by average score (with at least one completed assessment)
    const topUsers = [...userScores]
      .filter(user => user.completedAssessments > 0)
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 10);
    
    return {
      title: {
        text: '用户评分排名 (前10名)',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        name: '平均分',
        max: 5
      },
      yAxis: {
        type: 'category',
        data: topUsers.map(user => user.userName),
        inverse: true
      },
      series: [
        {
          name: '平均分',
          type: 'bar',
          data: topUsers.map(user => ({
            value: user.averageScore,
            itemStyle: {
              color: (() => {
                const score = user.averageScore;
                if (score >= 4.5) return '#10B981';
                if (score >= 4) return '#3B82F6';
                if (score >= 3) return '#F59E0B';
                return '#EF4444';
              })()
            }
          }))
        }
      ]
    };
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载数据中...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-center mb-2">加载失败</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <Button 
            className="w-full"
            onClick={() => window.location.reload()}
          >
            重新加载
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">数据分析</h1>
            <p className="text-gray-500">查看评估数据和用户表现</p>
          </div>
          <Button 
            onClick={() => router.push('/admin')}
            variant="outline"
            className="flex items-center gap-2"
          >
            返回管理页面
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">总测评数</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalAssessments}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FileBarChart className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">完成率</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.completionRate.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${stats.completionRate}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">平均分数</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.averageScore.toFixed(2)}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Award className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-xs font-medium flex items-center ${stats.averageScore >= 3 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.averageScore >= 3 ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {stats.averageScore >= 3 ? '良好' : '需改进'}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">参与用户</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{userScores.length}</p>
                </div>
                <div className="bg-amber-100 p-3 rounded-lg">
                  <Users className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>测评状态</CardTitle>
            </CardHeader>
            <CardContent>
              <ReactECharts 
                option={getStatusChartOptions()} 
                style={{ height: '300px' }} 
              />
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>分数分布</CardTitle>
            </CardHeader>
            <CardContent>
              <ReactECharts 
                option={getScoreDistributionOptions()} 
                style={{ height: '300px' }}
              />
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>用户排名</CardTitle>
            </CardHeader>
            <CardContent>
              <ReactECharts 
                option={getUserPerformanceOptions()} 
                style={{ height: '300px' }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Assessments and Users */}
        <Tabs defaultValue="assessments" className="w-full mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="assessments">测评记录</TabsTrigger>
            <TabsTrigger value="users">用户得分</TabsTrigger>
          </TabsList>
          
          <TabsContent value="assessments">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <CardTitle>测评记录</CardTitle>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="搜索测评..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={handleAssessmentSearch}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>测评名称</TableHead>
                        <TableHead>被评价人</TableHead>
                        <TableHead>评价人数</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead className="text-right">平均分</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssessments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-24 text-gray-500">
                            没有找到匹配的测评记录
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAssessments.map((assessment) => {
                          // Calculate average score
                          let averageScore = null;
                          if (assessment.status === 'COMPLETED' && assessment.scoreSet && assessment.scoreSet.length > 0) {
                            const validScores = assessment.scoreSet.filter(score => score !== null && score !== undefined);
                            if (validScores.length > 0) {
                              averageScore = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
                            }
                          }
                          
                          return (
                            <TableRow key={assessment.id}>
                              <TableCell className="font-medium">{assessment.id}</TableCell>
                              <TableCell>{assessment.test.name}</TableCell>
                              <TableCell>{assessment.reviewee.name}</TableCell>
                              <TableCell>{assessment.reviewer.length}</TableCell>
                              <TableCell>
                                <StatusBadge status={assessment.status} />
                              </TableCell>
                              <TableCell className="text-right">
                                {assessment.status === 'COMPLETED' && averageScore !== null
                                  ? averageScore.toFixed(2)
                                  : '-'}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <CardTitle>用户得分</CardTitle>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="搜索用户..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={handleUserSearch}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>用户</TableHead>
                        <TableHead>总测评</TableHead>
                        <TableHead>已完成</TableHead>
                        <TableHead>完成率</TableHead>
                        <TableHead className="text-right">平均分</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center h-24 text-gray-500">
                            没有找到匹配的用户
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => {
                          const completionRate = user.totalAssessments > 0 
                            ? (user.completedAssessments / user.totalAssessments) * 100 
                            : 0;
                            
                          return (
                            <TableRow key={user.userId}>
                              <TableCell className="font-medium">{user.userName}</TableCell>
                              <TableCell>{user.totalAssessments}</TableCell>
                              <TableCell>{user.completedAssessments}</TableCell>
                              <TableCell>
                                {completionRate.toFixed(0)}%
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                  <div 
                                    className="bg-blue-500 h-1.5 rounded-full" 
                                    style={{ width: `${completionRate}%` }}
                                  ></div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {user.completedAssessments > 0 
                                  ? user.averageScore.toFixed(2)
                                  : '-'}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard; 