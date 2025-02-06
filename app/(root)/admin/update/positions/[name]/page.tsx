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
import InputGroup from "@/components/shared/InputGroup";
import AutoCompleteGroup from "@/components/shared/AutoCompleteGroup";



const PositionUpdate = () => {

  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const [position, setPosition] = useState({
    name: "",
    club: [{name: ""}],
    user: [{name: ""}]
  })
  const [allClubs, setAllClubs] = useState([])
  const [allUsers, setAllUsers] = useState([])

  async function findPositionByName(name: string) {
    const position = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/positions/findOne`, {
      method: 'POST',
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({name}),
    }).then(async res => await res.json())
    console.log("feasfeasdfa",position)
    setPosition(position)
  }



  useEffect(() => {
    async function findAllClubs() {
      const allClubs = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/clubs/findAll`).then(async res => await res.json())
      let clubNames = allClubs?.map((club: any)=>(club.name))
      setAllClubs(clubNames)
    }
    async function findAllUsers() {
      const allUsers = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/findAll`).then(async res => await res.json())
      let userNames = allUsers?.map((club: any)=>(club.name))
      setAllUsers(userNames)
    }

    findAllUsers()
    findAllClubs()
  }, []);



  useEffect(() => {
    const positionName = decodeURIComponent(params.name as string)
    findPositionByName(positionName)
  }, [params])



  const userSchema = z.object({
    name: z.string().min(1, "用户不能为空"),
  })

  const clubSchema = z.object({
    name: z.string().min(1, "用户不能为空"),
  })

  const zodSchema = z.object({
    name: z.string().min(1, "部门名字不能为空").default(""),
    club: z.array(clubSchema).optional(),
    user: z.array(userSchema).optional()
  })

  const onSubmit = async (data: formDataType) => {
    console.log(data)
    //@ts-ignore
    Object.assign(data, {id: position.id})
    console.log('Stringified data:', JSON.stringify(data));
    const updatedPosition = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/positions/update`,{
      method: "Post",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(async res => res.json())
    if(updatedPosition.message){
      toast({
        variant: "default",
        title: "问题",
        description: updatedPosition.message,
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
      club: [{name: ""}],
      user: [{name: ""}]
    }})


  useEffect(() => {
    methods.reset({
      name: position?.name,
      // @ts-ignore
      club: position?.club?.map((club: any)=>({name: club.name})),
      user: position?.user?.map((user: any)=>({name: user.name}))
    })
  }, [position, methods]);

  return (
    <FormProvider {...methods}>
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">
          更新岗位
        </h2>

        <form className="space-y-8" onSubmit={methods.handleSubmit(onSubmit)}>
          {/* Basic Info Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">基本信息</h3>
            <div className="flex gap-6">
              <InputField
                name="name"
                label="岗位名字"
                description="岗位名字"
              />
            </div>
          </div>

          {/* Group Members Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 ">拓展信息</h3>
              <div className="flex gap-8">
                <AutoCompleteGroup<formDataType> name="club" label="所属部门" items={allClubs}/>
                <AutoCompleteGroup<formDataType> name="user" label="拥有的员工" items={allUsers}/>
              </div>
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

export default PositionUpdate;
