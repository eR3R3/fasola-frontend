'use client'

import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem
} from "@/components/ui/sidebar"
import {Briefcase, ChevronDown, CircleUserRound, House, UsersRound, ClipboardCheck, ListChecks, HelpCircle} from "lucide-react";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import { User, CirclePlus, FolderKanban, CircleMinus, RotateCw, UserRoundSearch, ScanSearch} from "lucide-react"
import {useRouter} from "next/navigation";
import Link from "next/link";


const sideBarContent = [
  {
    subContent: [
      {
        content:"人员创建",
        subsubContent: [
          {
            content: "部门创建",
            url: "/admin/create/clubs",
            icon: CirclePlus
          },
          {
            content: "人员创建",
            url: "/admin/create/users",
            icon: CirclePlus,
          },
        ]
      },
      {
        content:"问卷创建",
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
    subContent: [
      {
        content: "人员更新/查看",
        subsubContent: [
          {
            content: "部门更新",
            url: "/admin/update/clubs",
            icon: House ,
          },
          {
            content: "人员更新",
            url: "/admin/update/users",
            icon: CircleUserRound,
          },
          {
            content: "小组更新",
            url: "/admin/update/miniClubs",
            icon: UsersRound ,
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
    icon: FolderKanban,
    subContent: [
      {
        content: "查看",
        url: "/admin/view",
        icon: ScanSearch,
      },
    ]
  },
  {
    icon: FolderKanban,
    subContent: [
      {
        content: "分配",
        url: "/admin/assign",
        icon: ScanSearch,
      },
    ]
  },
]

const SideBar = () => {
  const router = useRouter()
  
  return (
    <div>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem className='pt-3'>
              <span className='p-1  font-extrabold'>全局管理</span>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className=''>
                创建
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {/* @ts-ignore */}
                  {sideBarContent[0].subContent.map((subContent) => (
                    <Collapsible key={subContent.content}>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild className='font-extrabold'>
                          <CollapsibleTrigger className="w-full flex items-center">
                            {subContent.icon && <subContent.icon />}
                            <span>{subContent.content}</span>
                            <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                          </CollapsibleTrigger>
                        </SidebarMenuButton>
                        {subContent.subsubContent && (
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {subContent.subsubContent.map((subSubContent) => (
                                <SidebarMenuSubItem key={subSubContent.content}>
                                  <SidebarMenuSubButton asChild>
                                    <Link href={subSubContent.url}>
                                      {subSubContent.icon && <subSubContent.icon className="mr-2 h-4 w-4" />}
                                      <span>{subSubContent.content}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        )}
                      </SidebarMenuItem>
                    </Collapsible>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className='font-extrabold'>
                更新/查看
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {/* @ts-ignore */}
                  {sideBarContent[1].subContent.map((subContent) => (
                    <Collapsible key={subContent.content}>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild className='font-extrabold'>
                          <CollapsibleTrigger className="w-full flex items-center">
                            {subContent.icon && <subContent.icon />}
                            <span>{subContent.content}</span>
                            <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                          </CollapsibleTrigger>
                        </SidebarMenuButton>
                        {subContent.subsubContent && (
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {subContent.subsubContent.map((subSubContent) => (
                                <SidebarMenuSubItem key={subSubContent.content}>
                                  <SidebarMenuSubButton asChild>
                                    <Link href={subSubContent.url}>
                                      {subSubContent.icon && <subSubContent.icon className="mr-2 h-4 w-4" />}
                                      <span>{subSubContent.content}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        )}
                      </SidebarMenuItem>
                    </Collapsible>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className=''>
                查看
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {/*@ts-ignore*/}
                  {sideBarContent[2].subContent.map((subContent) => {
                    return (
                      <SidebarMenuItem key={subContent.content}>
                        <SidebarMenuButton asChild>
                          <Link href={subContent.url}>
                            <subContent.icon />
                            <span>{subContent.content}</span>
                          </Link>
                        </SidebarMenuButton>
                        {/*{subContent.subSubContent&&(*/}
                        {/*    <SidebarMenuSub>*/}
                        {/*      {subContent.subSubContent.map((subSubContent) => {*/}
                        {/*        return(*/}
                        {/*            <SidebarMenuSubItem key={subSubContent.content}>*/}
                        {/*              <SidebarMenuSubButton asChild>*/}
                        {/*                <a href={subSubContent.url}>*/}
                        {/*                  <span>{subSubContent.content}</span>*/}
                        {/*                </a>*/}
                        {/*              </SidebarMenuSubButton>*/}
                        {/*            </SidebarMenuSubItem>*/}
                        {/*        )*/}
                        {/*      })}*/}
                        {/*    </SidebarMenuSub>*/}
                        {/*)}*/}
                      </SidebarMenuItem>)
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className=''>
                分配
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {/*@ts-ignore*/}
                  {sideBarContent[3].subContent.map((subContent) => {
                    return (
                      <SidebarMenuItem key={subContent.content}>
                        <SidebarMenuButton asChild>
                          <Link href={subContent.url}>
                            <subContent.icon />
                            <span>{subContent.content}</span>
                          </Link>
                        </SidebarMenuButton>
                        {/*{subContent.subSubContent&&(*/}
                        {/*    <SidebarMenuSub>*/}
                        {/*      {subContent.subSubContent.map((subSubContent) => {*/}
                        {/*        return(*/}
                        {/*            <SidebarMenuSubItem key={subSubContent.content}>*/}
                        {/*              <SidebarMenuSubButton asChild>*/}
                        {/*                <a href={subSubContent.url}>*/}
                        {/*                  <span>{subSubContent.content}</span>*/}
                        {/*                </a>*/}
                        {/*              </SidebarMenuSubButton>*/}
                        {/*            </SidebarMenuSubItem>*/}
                        {/*        )*/}
                        {/*      })}*/}
                        {/*    </SidebarMenuSub>*/}
                        {/*)}*/}
                      </SidebarMenuItem>)
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

      </Sidebar>
    </div>
  );
};

export default SideBar;
