'use client'

import React, { useState, useEffect } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel, 
  SidebarHeader,
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarMenuSub, 
  SidebarMenuSubButton, 
  SidebarMenuSubItem,
  SidebarFooter
} from "@/components/ui/sidebar"
import {
  Briefcase, 
  ChevronDown, 
  CircleUserRound, 
  House, 
  UsersRound, 
  ClipboardCheck, 
  ListChecks, 
  HelpCircle,
  CirclePlus, 
  FolderKanban, 
  ScanSearch,
  LayoutDashboard,
  Settings,
  LogOut,
  PanelLeft,
  Search,
  Bell,
  X,
  LucideIcon,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { useClerk, useUser } from "@clerk/nextjs";
import { toast, Toaster } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// Define types for sidebar content
type SubSubContent = {
  content: string;
  url: string;
  icon: LucideIcon;
};

type SubContent = {
  content: string;
  icon: LucideIcon;
  url?: string;
  subsubContent?: SubSubContent[];
};

type SidebarContentItem = {
  title: string;
  icon: LucideIcon;
  subContent?: SubContent[];
};

const sideBarContent: SidebarContentItem[] = [
  {
    title: "创建",
    icon: CirclePlus,
    subContent: [
      {
        content: "人员创建",
        icon: CircleUserRound,
        subsubContent: [
          {
            content: "部门创建",
            url: "/admin/create/clubs",
            icon: House
          },
          {
            content: "人员创建",
            url: "/admin/create/users",
            icon: CircleUserRound,
          },
        ]
      },
      {
        content: "问卷创建",
        icon: ClipboardCheck,
        subsubContent: [
          {
            content: "测试创建",
            url: "/admin/create/tests",
            icon: ClipboardCheck,
          },
          {
            content: "小测试创建",
            url: "/admin/create/miniTests",
            icon: ListChecks,
          },
          {
            content: "问题创建",
            url: "/admin/create/questions",
            icon: HelpCircle,
          },
        ]
      }
    ]
  },
  {
    title: "更新/查看",
    icon: FolderKanban,
    subContent: [
      {
        content: "人员更新/查看",
        icon: CircleUserRound,
        subsubContent: [
          {
            content: "部门更新",
            url: "/admin/update/clubs",
            icon: House,
          },
          {
            content: "人员更新",
            url: "/admin/update/users",
            icon: CircleUserRound,
          },
          {
            content: "小组更新",
            url: "/admin/update/miniClubs",
            icon: UsersRound,
          },
          {
            content: "岗位更新",
            url: "/admin/update/positions",
            icon: Briefcase,
          },
        ]
      },
      {
        content: "问卷更新/查看",
        icon: ClipboardCheck,
        subsubContent: [
          {
            content: "测试更新",
            url: "/admin/update/tests",
            icon: ClipboardCheck,
          },
          {
            content: "小测试更新",
            url: "/admin/update/miniTests",
            icon: ListChecks,
          },
          {
            content: "问题更新",
            url: "/admin/update/questions",
            icon: HelpCircle,
          },
        ]
      }
    ]
  },
  {
    title: "查看",
    icon: ScanSearch,
    subContent: [
      {
        content: "查看",
        url: "/admin/view",
        icon: ScanSearch,
      },
      {
        content: "查看评分记录",
        url: "/admin/dashboard",
        icon: ScanSearch,
      },
    ]
  },
  {
    title: "分配",
    icon: FolderKanban,
    subContent: [
      {
        content: "分配",
        url: "/admin/assign",
        icon: ScanSearch,
      },
    ]
  },
  {
    title: "系统",
    icon: Settings,
    subContent: [
      {
        content: "通知中心",
        url: "/admin/notifications",
        icon: Bell,
      },
    ]
  }
]

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

const SideBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredContent, setFilteredContent] = useState(sideBarContent);
  const { signOut, openUserProfile } = useClerk();
  const { user, isLoaded } = useUser();
  const [isSyncing, setIsSyncing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Initialize with all groups open
  useEffect(() => {
    const initialOpenState: Record<string, boolean> = {};
    sideBarContent.forEach((group, index) => {
      initialOpenState[`group-${index}`] = true;
      group.subContent?.forEach((subContent, subIndex) => {
        initialOpenState[`subContent-${index}-${subIndex}`] = false;
      });
    });
    setOpenGroups(initialOpenState);
  }, []);

  
  // Filter sidebar content based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredContent(sideBarContent);
      return;
    }
    
    const searchLower = searchTerm.toLowerCase();
    
    const filtered = sideBarContent.map(group => {
      const filteredSubContent = group.subContent?.filter(subContent => {
        // Check if subContent matches
        if (subContent.content.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        // Check if any subsubContent matches
        const hasMatchingSubsub = subContent.subsubContent?.some(
          subsubContent => subsubContent.content.toLowerCase().includes(searchLower)
        );
        
        return hasMatchingSubsub;
      });
      
      return filteredSubContent?.length ? { ...group, subContent: filteredSubContent } : null;
    }).filter(Boolean) as typeof sideBarContent;
    
    setFilteredContent(filtered);
    
    // Open all groups and subgroups that contain matches
    if (filtered.length > 0) {
      const newOpenState = { ...openGroups };
      filtered.forEach((group, index) => {
        newOpenState[`group-${index}`] = true;
        group.subContent?.forEach((subContent, subIndex) => {
          newOpenState[`subContent-${index}-${subIndex}`] = true;
        });
      });
      setOpenGroups(newOpenState);
    }
  }, [searchTerm]);
  
  const toggleGroup = (groupKey: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };
  
  const isLinkActive = (url: string) => {
    return pathname === url;
  };
  
  const handleSignOut = () => {
    signOut();
  };

  const handleOpenSettings = () => {
    openUserProfile();
  };

  const syncUserDataWithDatabase = async () => {
    if (!isLoaded || !user) return;

    try {
      setIsSyncing(true);
      
      // Get user data from Clerk
      const userData = {
        name: user.firstName + user.lastName,
        email: user.primaryEmailAddress?.emailAddress,
        imageUrl: user.imageUrl,
        // Add any other fields you want to sync
      };
      console.log(userData)
      
      // Send to your API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/syncClerkData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync user data');
      }
      
      toast.success('用户信息已同步');
    } catch (error) {
      console.error('Error syncing user data:', error);
      toast.error('同步失败，请重试');
    } finally {
      setIsSyncing(false);
    }
  };

  // Fetch notifications
  useEffect(() => {
    // This would normally be an API call to fetch notifications
    // For demo purposes, we'll create some sample notifications
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
      }
    ];
    
    setNotifications(sampleNotifications);
    setUnreadCount(sampleNotifications.filter(n => !n.read).length);
    
    // Simulate a new notification every 30 seconds (for demo purposes)
    const intervalId = setInterval(() => {
      // Only add new notifications if the user is likely still using the app
      if (document.visibilityState === 'visible') {
        generateRandomNotification();
      }
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Generate a random notification
  const generateRandomNotification = () => {
    const notificationTypes: NotificationType[] = ['info', 'success', 'warning', 'error'];
    const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    
    const newNotifications = [
      {
        id: `new-${Date.now()}`,
        title: '新测评分配',
        message: '您有一个新的测评任务已分配',
        timestamp: new Date(),
        read: false,
        type: 'info' as NotificationType
      },
      {
        id: `new-${Date.now() + 1}`,
        title: '系统更新',
        message: '系统已更新到最新版本',
        timestamp: new Date(),
        read: false,
        type: 'success' as NotificationType
      },
      {
        id: `new-${Date.now() + 2}`,
        title: '权限变更',
        message: '赵六的权限已从"普通用户"变更为"管理员"',
        timestamp: new Date(),
        read: false,
        type: 'warning' as NotificationType
      }
    ];
    
    const randomNotification = newNotifications[Math.floor(Math.random() * newNotifications.length)];
    
    setNotifications(prev => [randomNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show toast notification
    toast.info(
      <div className="flex items-center gap-2">
        <div className="font-medium">{randomNotification.title}</div>
        <div className="text-sm text-gray-500">{randomNotification.message}</div>
      </div>,
      {
        duration: 4000,
        position: 'top-right'
      }
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({
      ...notification,
      read: true
    })));
    setUnreadCount(0);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };
  
  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="border-b border-gray-100 p-4">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 text-white p-1.5 rounded-md">
            <LayoutDashboard size={20} />
          </div>
          <div className="font-bold text-lg">管理系统</div>
        </div>
        <div className="mt-4 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索菜单..."
            className="pl-9 bg-gray-50 border-gray-200 focus-visible:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-7 w-7"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        </SidebarHeader>
      
      <SidebarContent className="px-2 py-4">
        {filteredContent.map((group, groupIndex) => (
          <SidebarGroup key={`group-${groupIndex}`} className="mb-3">
            <SidebarGroupLabel 
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
                openGroups[`group-${groupIndex}`] ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700'
              }`}
              onClick={() => toggleGroup(`group-${groupIndex}`)}
            >
              {group.icon && <group.icon className="h-5 w-5" />}
              <span>{group.title}</span>
              <ChevronDown 
                className={`ml-auto h-4 w-4 transition-transform ${
                  openGroups[`group-${groupIndex}`] ? 'rotate-180' : ''
                }`} 
              />
            </SidebarGroupLabel>
            
            {openGroups[`group-${groupIndex}`] && (
              <SidebarGroupContent className="mt-1 space-y-1">
                <SidebarMenu>
                  {group.subContent?.map((subContent, subIndex) => (
                    subContent.url ? (
                      <SidebarMenuItem key={`item-${groupIndex}-${subIndex}`}>
                        <Link 
                          href={subContent.url}
                          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md w-full ${
                            isLinkActive(subContent.url) 
                              ? 'bg-indigo-100 text-indigo-700 font-medium' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {subContent.icon && <subContent.icon className="h-4 w-4" />}
                            <span>{subContent.content}</span>
                          {subContent.content === "通知中心" && unreadCount > 0 && (
                            <Badge className="ml-auto h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white">
                              {unreadCount}
                            </Badge>
                          )}
                                    </Link>
                      </SidebarMenuItem>
                    ) : (
                      <Collapsible 
                        key={`subcontent-${groupIndex}-${subIndex}`}
                        open={openGroups[`subContent-${groupIndex}-${subIndex}`]}
                        onOpenChange={() => toggleGroup(`subContent-${groupIndex}-${subIndex}`)}
                      >
                        <CollapsibleTrigger asChild>
                      <SidebarMenuItem>
                            <SidebarMenuButton 
                              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md w-full ${
                                openGroups[`subContent-${groupIndex}-${subIndex}`] 
                                  ? 'bg-gray-100 text-gray-900 font-medium' 
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {subContent.icon && <subContent.icon className="h-4 w-4" />}
                            <span>{subContent.content}</span>
                              <ChevronDown 
                                className={`ml-auto h-4 w-4 transition-transform ${
                                  openGroups[`subContent-${groupIndex}-${subIndex}`] ? 'rotate-180' : ''
                                }`} 
                              />
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          </CollapsibleTrigger>
                        
                          <CollapsibleContent>
                          <SidebarMenuSub className="mt-1 ml-6 space-y-1">
                            {subContent.subsubContent && subContent.subsubContent.map((subSubContent, subSubIndex) => (
                              <SidebarMenuSubItem key={`subsubitem-${groupIndex}-${subIndex}-${subSubIndex}`}>
                                <Link 
                                  href={subSubContent.url}
                                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md w-full ${
                                    isLinkActive(subSubContent.url) 
                                      ? 'bg-indigo-100 text-indigo-700 font-medium' 
                                      : 'text-gray-600 hover:bg-gray-100'
                                  }`}
                                >
                                  {subSubContent.icon && <subSubContent.icon className="h-4 w-4" />}
                                      <span>{subSubContent.content}</span>
                                  {isLinkActive(subSubContent.url) && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                                  )}
                                    </Link>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                    </Collapsible>
                    )
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarFooter className="border-t border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.imageUrl || "/avatar.png"} alt={user?.fullName || "Admin"} />
              <AvatarFallback className="bg-indigo-100 text-indigo-700">
                {user?.firstName?.[0] || "A"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{user?.fullName || "管理员"}</p>
              <p className="text-xs text-gray-500">{user?.primaryEmailAddress?.emailAddress || "admin@example.com"}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-500 hover:text-gray-700"
            onClick={handleSignOut}
          >
            <LogOut size={18} />
          </Button>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-2"
              onClick={handleOpenSettings}
            >
              <Settings size={14} />
              <span>设置</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-none gap-1"
              onClick={syncUserDataWithDatabase}
              disabled={isSyncing}
            >
              <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
              <span className="sr-only">同步</span>
            </Button>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-2 relative hover:bg-gray-100 transition-colors"
              >
                <Bell size={18} className="text-gray-600" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-red-500 text-[10px]">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 shadow-lg border-gray-200" align="end">
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-medium text-sm text-gray-800">通知中心</h3>
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                    onClick={markAllAsRead}
                  >
                    全部标为已读
                  </Button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    <div className="flex justify-center mb-3">
                      <Bell size={24} className="text-gray-300" />
                    </div>
                    暂无通知
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                          notification.read ? 'bg-gray-50' : 'bg-white'
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex gap-3">
                          <div className={`p-2 rounded-full ${
                            notification.type === 'info' 
                              ? 'bg-blue-50' 
                              : notification.type === 'success' 
                                ? 'bg-green-50' 
                                : notification.type === 'warning' 
                                  ? 'bg-amber-50' 
                                  : 'bg-red-50'
                          } flex-shrink-0`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={`font-medium text-sm ${notification.read ? 'text-gray-700' : 'text-gray-900'} truncate`}>
                                {notification.title}
                              </p>
                              <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: zhCN })}
                              </span>
                            </div>
                            <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-600'} mt-1`}>
                              {notification.message}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-2 border-t border-gray-100 bg-gray-50">
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 flex-1"
                    onClick={() => router.push('/admin/notifications')}
                  >
                    查看全部通知
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={generateRandomNotification}
                  >
                    测试通知
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </SidebarFooter>
      </Sidebar>
  );
};

export default SideBar;