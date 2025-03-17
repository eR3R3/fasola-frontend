'use client'

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Filter,
  Clock,
  CheckCheck
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Define notification types
type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: NotificationType;
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<string>('all');
  const [selectedTab, setSelectedTab] = useState('all');

  // Fetch notifications
  useEffect(() => {
    // This would normally be an API call to fetch notifications
    // For demo purposes, we'll create some sample notifications
    setTimeout(() => {
      const sampleNotifications: Notification[] = [
        {
          id: '1',
          title: '岗位变更',
          message: '张三的岗位已从"开发工程师"变更为"高级开发工程师"',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          read: false,
          type: 'info'
        },
        {
          id: '2',
          title: '部门调动',
          message: '李四已从"产品部"调至"研发部"',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          read: false,
          type: 'info'
        },
        {
          id: '3',
          title: '测评完成',
          message: '王五已完成"2024年第一季度"测评',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          read: true,
          type: 'success'
        },
        {
          id: '4',
          title: '系统更新',
          message: '系统已更新到最新版本 v2.3.0',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
          read: true,
          type: 'success'
        },
        {
          id: '5',
          title: '权限变更警告',
          message: '有5个用户的权限被修改，请确认是否为授权操作',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
          read: false,
          type: 'warning'
        },
        {
          id: '6',
          title: '登录异常',
          message: '检测到异地登录行为，请确认是否为本人操作',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96), // 4 days ago
          read: true,
          type: 'error'
        },
        {
          id: '7',
          title: '新员工入职',
          message: '赵六已完成入职流程，请及时分配工作',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120), // 5 days ago
          read: true,
          type: 'info'
        },
        {
          id: '8',
          title: '测评截止提醒',
          message: '本季度测评将于3天后截止，仍有12名员工未完成',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 144), // 6 days ago
          read: false,
          type: 'warning'
        }
      ];
      
      setNotifications(sampleNotifications);
      setFilteredNotifications(sampleNotifications);
      setIsLoading(false);
    }, 100000000000);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...notifications];
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(notification => notification.type === typeFilter);
    }
    
    // Apply read filter
    if (readFilter === 'read') {
      filtered = filtered.filter(notification => notification.read);
    } else if (readFilter === 'unread') {
      filtered = filtered.filter(notification => !notification.read);
    }
    
    // Apply search term
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(notification => 
        notification.title.toLowerCase().includes(searchLower) || 
        notification.message.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply tab filter
    if (selectedTab !== 'all') {
      filtered = filtered.filter(notification => notification.type === selectedTab);
    }
    
    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, typeFilter, readFilter, selectedTab]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({
      ...notification,
      read: true
    })));
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationTypeColor = (type: NotificationType) => {
    switch (type) {
      case 'info':
        return 'bg-blue-50 text-blue-700';
      case 'success':
        return 'bg-green-50 text-green-700';
      case 'warning':
        return 'bg-amber-50 text-amber-700';
      case 'error':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-blue-50 text-blue-700';
    }
  };

  const getNotificationTypeName = (type: NotificationType) => {
    switch (type) {
      case 'info':
        return '信息';
      case 'success':
        return '成功';
      case 'warning':
        return '警告';
      case 'error':
        return '错误';
      default:
        return '信息';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-indigo-100">
                <Bell className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">通知中心</h2>
                <p className="text-gray-500 mt-1">查看和管理所有系统通知</p>
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
                placeholder="搜索通知..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-6">
            <div className="bg-indigo-50 rounded-lg p-3 flex items-center gap-2">
              <div className="p-1.5 bg-indigo-100 rounded-full">
                <Bell className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">总通知数</p>
                <p className="text-2xl font-bold text-indigo-700">{notifications.length}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-full">
                <AlertCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">未读通知</p>
                <p className="text-2xl font-bold text-blue-700">{unreadCount}</p>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-3 flex items-center gap-2">
              <div className="p-1.5 bg-green-100 rounded-full">
                <CheckCheck className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">已读通知</p>
                <p className="text-2xl font-bold text-green-700">{notifications.length - unreadCount}</p>
              </div>
            </div>
            
            <div className="bg-amber-50 rounded-lg p-3 flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 rounded-full">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">最近通知</p>
                <p className="text-sm font-medium text-amber-700">
                  {notifications.length > 0 
                    ? formatDistanceToNow(notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0].timestamp, { addSuffix: true, locale: zhCN })
                    : '无通知'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 border-t border-gray-100 pt-4">
            <div className="flex-1">
              <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedTab}>
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="all">全部</TabsTrigger>
                  <TabsTrigger value="info">信息</TabsTrigger>
                  <TabsTrigger value="success">成功</TabsTrigger>
                  <TabsTrigger value="warning">警告</TabsTrigger>
                  <TabsTrigger value="error">错误</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex gap-2">
              <Select value={readFilter} onValueChange={setReadFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="阅读状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="read">已读</SelectItem>
                  <SelectItem value="unread">未读</SelectItem>
                </SelectContent>
              </Select>
              
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="whitespace-nowrap"
                  onClick={markAllAsRead}
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  全部标为已读
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Notifications List */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-md">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            <span className="ml-2 text-gray-700 font-medium">加载通知中...</span>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center p-4 bg-gray-100 rounded-full mb-4">
                  <Bell className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无通知</h3>
                <p className="text-gray-600 mb-4">没有找到符合条件的通知</p>
                {(searchTerm || typeFilter !== 'all' || readFilter !== 'all' || selectedTab !== 'all') && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setTypeFilter('all');
                      setReadFilter('all');
                      setSelectedTab('all');
                    }}
                  >
                    清除所有筛选
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      notification.read ? 'bg-white' : 'bg-indigo-50/30'
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex gap-4">
                      <div className={`p-2 rounded-full ${
                        notification.type === 'info' 
                          ? 'bg-blue-50' 
                          : notification.type === 'success' 
                            ? 'bg-green-50' 
                            : notification.type === 'warning' 
                              ? 'bg-amber-50' 
                              : 'bg-red-50'
                      } flex-shrink-0 h-10 w-10 flex items-center justify-center`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className={`font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                                {notification.title}
                              </h4>
                              <Badge className={`${getNotificationTypeColor(notification.type)}`}>
                                {getNotificationTypeName(notification.type)}
                              </Badge>
                              {!notification.read && (
                                <Badge className="bg-indigo-100 text-indigo-800">未读</Badge>
                              )}
                            </div>
                            <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-600'} mt-1`}>
                              {notification.message}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {format(notification.timestamp, 'yyyy-MM-dd HH:mm')}
                          </span>
                        </div>
                        <div className="flex justify-end mt-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                          >
                            {notification.read ? '已读' : '标为已读'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage; 