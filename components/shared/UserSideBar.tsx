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
    icon: User,
    subContent: [
      {
        content: "员工信息",
        url: "/user",
        icon: CirclePlus
      },
      {
        content: "问卷评价",
        url: "/user/assessment",
        icon: CirclePlus,
      },
    ]
  },
  {
    icon: FolderKanban,
    subContent: [
      {
        content: "部门更新",
        url: "/user/profile",
        icon: House ,
      },
    ]
  },
]

const UserSideBar = () => {
  const router = useRouter()
  // @ts-ignore
  return (
    <div>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem className='pt-3'>
              <span className='p-1  font-extrabold'>员工主页</span>
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
                  {/*@ts-ignore*/}
                  {sideBarContent[0].subContent.map((subContent) => {
                    return (
                      <SidebarMenuItem key={subContent.content}>
                        <SidebarMenuButton asChild>
                          <a href={subContent.url}>
                            <subContent.icon />
                            <span>{subContent.content}</span>
                          </a>
                        </SidebarMenuButton>
                        {/*{subContent.subSubContent&&(*/}
                        {/*    <SidebarMenuSub>*/}
                        {/*    {subContent.subSubContent.map((subSubContent) => {*/}
                        {/*      return(*/}
                        {/*          <SidebarMenuSubItem key={subSubContent.content}>*/}
                        {/*            <SidebarMenuSubButton asChild>*/}
                        {/*              <Link href={subSubContent.url}>*/}
                        {/*                <span>{subSubContent.content}</span>*/}
                        {/*              </Link>*/}
                        {/*            </SidebarMenuSubButton>*/}
                        {/*          </SidebarMenuSubItem>*/}
                        {/*      )*/}
                        {/*    })}*/}
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
                更新
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {/*@ts-ignore*/}
                  {sideBarContent[1].subContent.map((subContent) => {
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

export default UserSideBar;
