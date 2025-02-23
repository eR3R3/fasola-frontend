'use client'

import React, {useEffect, useState} from 'react';
import {z} from "zod";
import {FormProvider, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import InputField from "@/components/shared/InputField";
import AutoCompleteField from "@/components/shared/AutoCompleteField";
import {Button} from "@heroui/button";
import {toast, useToast} from "@/hooks/use-toast";
import {useRouter} from "next/navigation";
import {UserIcon} from "@/lib/icon";

const CreateUsers = () => {

  const { toast } = useToast()
  const router = useRouter()

  const [allPositions, setAllPositions] = useState([])
  const [allMiniClubs, setAllMiniClubs] = useState([])
  const [allClubs, setAllClubs] = useState([])

  const zodSchema = z.object({
    name: z.string().min(1, "用户名字不能为空"),
    role: z.enum(["ADMIN", "MANAGER", "LEADER", "WORKER"]),
    gender: z.enum(["MALE", "FEMALE"]),
    phone: z.string().min(10, "手机号码一定要比10位长"),
    miniClubName: z.string().nullable().optional(),
    clubName: z.string().optional(),
    positionName: z.string().optional()
  });

  type formDataType = z.infer<typeof zodSchema>;

  const methods = useForm<formDataType>({
    resolver: zodResolver(zodSchema),
    defaultValues:{
      name: "",
      role: "WORKER",
      gender: "FEMALE",
      phone: "",
      miniClubName: "",
      clubName: "",
      positionName: ""
    }
  });

  const currentRole = methods.watch("role");

  async function onSubmit(data: formDataType) {
    console.log(data)
    const createdUser = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/create`,{
      method: "Post",
      headers:{"Content-Type": "application/json"},
      body: JSON.stringify(data)
    }).then(async res => await res.json())
    if(createdUser.message){
      toast({
        variant: "default",
        title: "问题",
        description: createdUser.message,
      })}
    else{
      toast({
        variant: "default",
        title: "成功",
        description: "成功创建用户",
      })
      router.push('/admin/update/users')
    }
    console.log(createdUser)
  }



  useEffect(() => {
    async function findAllPositions() {
      const allPositions = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/positions/findAll`).then(async res => await res.json())
      let positionNames = allPositions.map((position: any)=>(position.name))
      positionNames.push("管理员")
      console.log(positionNames)
      setAllPositions(positionNames)
    }
    async function findAllMiniClubs() {
      const allMiniClubs = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/miniClubs/findAll`).then(async res => await res.json())
      let miniClubNames = allMiniClubs.map((miniClub: any)=>(miniClub.name))
      console.log(miniClubNames)
      setAllMiniClubs(miniClubNames)
    }
    async function findAllClubs() {
      const allClubs = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/clubs/findAll`).then(async res => await res.json())
      let clubNames = allClubs.map((club: any)=>(club.name))
      console.log(clubNames)
      setAllClubs(clubNames)
    }

    findAllPositions()
    findAllMiniClubs()
    findAllClubs()
  }, []);

  return (
    <FormProvider {...methods}>
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">
              创建用户
            </h2>

            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Info Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">基本信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InputField
                    name="name"
                    label="用户姓名"
                    description="输入用户姓名"
                    width={220}
                  />
                  <AutoCompleteField
                    name="gender"
                    label="用户性别"
                    items={["MALE", "FEMALE"]}

                    description="MALE是男，FEMALE是女"
                  />
                  <InputField
                    name="phone"
                    label="用户手机号码"
                    description="直接输入没空格"
                  />
                </div>
              </div>

              {/* Role Info Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">职位信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(currentRole==="ADMIN")||(<AutoCompleteField
                    name="positionName"
                    label="用户岗位"
                    items={allPositions}
                    description="用户岗位"
                  />)}
                  <AutoCompleteField
                    name="role"
                    label="用户级别"
                    items={["ADMIN", "MANAGER", "LEADER", "WORKER"]}
                    description="ADMIN:管理员 MANAGER:部门部长 LEADER:小组组长 WORKER:员工"
                  />
                </div>
              </div>

              {/* Department Info Card - Conditional */}
              {(currentRole === "LEADER" || currentRole === "WORKER") && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">部门信息</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AutoCompleteField
                      name="clubName"
                      label="所属部门"
                      items={allClubs}
                      description="用户所属部门"
                    />
                    <AutoCompleteField
                      name="miniClubName"
                      label="所属小组"
                      items={allMiniClubs}
                      description="用户所属小组"
                    />
                  </div>
                </div>
              )}

              {currentRole === "MANAGER" && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">管理员信息</h3>
                  <div className="w-full md:w-1/2">
                    <AutoCompleteField
                      name="clubName"
                      label="所属部门"
                      items={allClubs}
                      description="用户所属部门"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end mt-8">
                <Button
                  type="submit"
                  variant="shadow"
                >
                  提交
                </Button>
              </div>
            </form>
          </div>
    </FormProvider>
  );
};

export default CreateUsers;