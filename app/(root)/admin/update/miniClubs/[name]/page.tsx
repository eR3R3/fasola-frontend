
'use client'

import React, {useEffect, useState} from 'react';
import {useToast} from "@/hooks/use-toast";
import {useParams, useRouter} from "next/navigation";
import {z} from "zod";
import {FormProvider, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import InputField from "@/components/shared/InputField";
import DoubleInputGroup from "@/components/shared/DoubleInputGroup";
import {Button} from "@heroui/button";



const MiniClubUpdate = () => {

  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const [miniClub, setMiniClub] = useState({
    name: "",
    club: "",
    user: [{name: "", role: "WORKER"}]
  })

  async function findMiniClubByName(name: string) {
    const miniClub = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/miniClubs/findOne`, {
      method: 'POST',
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({name}),
    }).then(async res => await res.json())
    console.log(miniClub)
    setMiniClub(miniClub)
  }

  useEffect(() => {
    const miniClubName = decodeURIComponent(params.name as string)
    findMiniClubByName(miniClubName)
  }, [params])

  useEffect(() => {
    methods.reset({
      name: miniClub?.name,
      // @ts-ignore
      club: miniClub?.club?.name,
      user: miniClub?.user?.map((user: any)=>({name: user.name, role: user.role}))
    })
  }, [miniClub]);

  const userSchema = z.object({
    name: z.string().min(1, "用户不能为空"),
    role: z.enum(["LEADER", "WORKER"])
  })

  const zodSchema = z.object({
    name: z.string().min(1, "部门名字不能为空").default(""),
    club: z.string().min(1, "一个小组必须有一个属于的部门"),
    user: z.array(userSchema)
  })

  const onSubmit = async (data: formDataType) => {
    console.log(data)
    //@ts-ignore
    Object.assign(data, {id: miniClub.id})
    console.log('Stringified data:', JSON.stringify(data));
    const updatedMiniClub = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/miniClubs/update`,{
      method: "Post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(async res => res.json())
    if(updatedMiniClub.message){
      toast({
        variant: "default",
        title: "问题",
        description: updatedMiniClub.message,
      })}
    else{
      toast({
        variant: "default",
        title: "成功",
        description: "成功更新小组",
      })
      router.back()
    }
  }

  type formDataType = z.infer<typeof zodSchema>

  const methods = useForm<formDataType>({resolver: zodResolver(zodSchema), defaultValues:{
      name: "",
      club: "",
      user: [{name: "", role: "WORKER"}]
    }})

  return (
    <FormProvider {...methods}>
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">
          创建小组
        </h2>

        <form className="space-y-8" onSubmit={methods.handleSubmit(onSubmit)}>
          {/* Basic Info Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">基本信息</h3>
            <div className="flex gap-6">
              <InputField
              name="name"
              label="小组名字"
              description="小组名字"
            />
              <InputField
                name="club"
                label="所属部门"
                description="所属部门"
              />
            </div>
          </div>

          {/* Group Members Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 ">成员信息</h3>
            <DoubleInputGroup<formDataType> name="user" />
          </div>

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

export default MiniClubUpdate;
