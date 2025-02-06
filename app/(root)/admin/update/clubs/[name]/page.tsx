'use client'

import React, {useEffect, useState} from 'react';
import {z} from "zod";
import { FormProvider, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import {Input} from "@heroui/input";
import InputGroup from "@/components/shared/InputGroup";
import {Button} from "@heroui/button";
import {toast, useToast} from "@/hooks/use-toast";
import {useParams, useRouter} from "next/navigation";
import AutoCompleteGroup from "@/components/shared/AutoCompleteGroup";

const UpdateClub = () => {

  const [allPositions, setAllPositions] = useState([])
  const [allMiniClubs, setAllMiniClubs] = useState([])
  const [currentClub, setCurrentClub] = useState({
    id:0,
    name: "",
    position: [{name:""}],
    miniClub: [{name:""}]
  })

  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()


  const zodSchema = z.object({
    name: z.string().min(1, "部门名字不能为空").default(""),
    positions: z.object({name: z.string()}).array().min(1, "部门岗位不能为空").optional(),
    miniClubs: z.object({name: z.string()}).array().optional()
  })

  type formDataType = z.infer<typeof zodSchema>

  const methods = useForm<formDataType>({
    resolver: zodResolver(zodSchema),
    defaultValues: {
      name: "",
      positions: [{name: ""}],
      miniClubs: [{name: ""}]
    }
  })

  async function onSubmit(data: formDataType) {
    console.log(data)
    Object.assign(data, {id: currentClub.id})
    const updatedClub = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/clubs/update`,{
      method: "Post",
      headers:{"Content-Type": "application/json"},
      body: JSON.stringify(data)
    }).then(async res => await res.json())
    if(updatedClub.message){
      toast({
        variant: "default",
        title: "问题",
        description: updatedClub.message,
      })}
    else{
      toast({
        variant: "default",
        title: "成功",
        description: "成功更新部门",
      })
      router.back()
    }
    console.log(updatedClub)
  }

  async function findClubByClubName(clubName: string) {
    const club = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/clubs/findOne`, {
      method: 'POST',
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({name: clubName}),
    }).then(async res => await res.json())
    console.log(club)
    setCurrentClub(club)
  }

  useEffect(() => {
    async function findAllPositions() {
      const allPositions = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/positions/findAll`).then(async res => await res.json())
      let positionNames = allPositions?.map((position: any)=>(position.name))
      positionNames.push("管理员")
      console.log(positionNames)
      setAllPositions(positionNames)
    }
    async function findAllMiniClubs() {
      const allMiniClubs = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/miniClubs/findAll`).then(async res => await res.json())
      let miniClubNames = allMiniClubs?.map((miniClub: any)=>(miniClub.name))
      console.log(miniClubNames)
      setAllMiniClubs(miniClubNames)
    }

    findAllPositions()
    findAllMiniClubs()
  }, []);



  useEffect(() => {
    const clubName = decodeURIComponent(params.name as string)
    findClubByClubName(clubName)
  }, [params]);



  useEffect(() => {
    methods.reset({
      name: currentClub.name,
      positions: currentClub.position.map((position)=>({name: position.name})),
      miniClubs: currentClub.miniClub.map((miniClub)=>({name: miniClub.name}))
    })
  }, [currentClub]);


  return (
    <FormProvider {...methods}>
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">
          更新部门
        </h2>

        <form className="space-y-8" onSubmit={methods.handleSubmit(onSubmit)}>
          {/* Basic Info Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">基本信息</h3>
            <FormField
              control={methods.control}
              name="name"
              render={({field}) => (
                <FormItem className="w-full">
                  <FormLabel className="text-lg font-bold">部门名字</FormLabel>
                  <FormControl>
                    <Input
                      variant="underlined"
                      onChange={field.onChange}
                      value={field.value}
                      label="部门名称"
                      onClear={() => field.onChange("")}
                      className="bg-transparent border-b border-gray-200
                               focus:border-gray-500 transition-colors"
                    />
                  </FormControl>
                  <FormDescription className="text-sm text-gray-600">
                    请输入部门名称
                  </FormDescription>
                  <FormMessage className="text-sm text-red-500 font-medium" />
                </FormItem>
              )}
            />
          </div>

          {/* Department Details Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 ">部门详情</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <AutoCompleteGroup
                  name="positions"
                  label="部门岗位"
                  items={allPositions}
                />
              </div>
              <div>
                <AutoCompleteGroup
                  name="miniClubs"
                  label="部门小组"
                  items={allMiniClubs}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-8">
            <Button
              type="submit"
              variant="solid"
              className="bg-gray-400 hover:bg-gray-700 text-gray-100 px-8 py-3 rounded-lg
                        transition-colors duration-200 ease-in-out
                        shadow-sm hover:shadow-md
                        text-sm font-medium"
            >
              更新
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
};

export default UpdateClub;