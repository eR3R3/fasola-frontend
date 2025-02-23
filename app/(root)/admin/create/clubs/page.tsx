'use client'

import React from 'react';
import {z} from "zod";
import { FormProvider, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import {Input} from "@heroui/input";
import InputGroup from "@/components/shared/InputGroup";
import {Button} from "@heroui/button";
import {useToast} from "@/hooks/use-toast";
import {useRouter} from "next/navigation";

const CreateClub = () => {

  const { toast } = useToast()
  const router = useRouter()

  const zodSchema = z.object({
    name: z.string().min(1, "部门名字不能为空").default(""),
    positions: z.object({name: z.string()}).array().min(1, "部门岗位不能为空").optional(),
    miniClubs: z.object({name: z.string()}).array().optional()
  })

  type formDataType = z.infer<typeof zodSchema>

  const methods = useForm<formDataType>({
    resolver: zodResolver(zodSchema),
    defaultValues:{
      name: "",
      positions: [{name:""}],
      miniClubs: [{name:""}]
    }
  })

  async function onSubmit(data: formDataType) {
    console.log(data)
    const createdClub = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/clubs/create`,{
      method: "Post",
      headers:{"Content-Type": "application/json"},
      body: JSON.stringify(data)
    }).then(async res => await res.json())
    if(createdClub.message){
      toast({
      variant: "default",
      title: "问题",
      description: createdClub.message,
    })}
    else{
      toast({
        variant: "default",
        title: "成功",
        description: "成功创建部门",
      })
      router.push('/admin/update/clubs')
    }
    console.log(createdClub)
  }



  return (
    <FormProvider {...methods}>
      <div className="bg-white w-full rounded-lg shadow-sm p-8">
        <h2 className="text-2xl w-full font-semibold text-gray-900 mb-8">
          创建部门
        </h2>

        <form className="space-y-8 w-full" onSubmit={methods.handleSubmit(onSubmit)}>
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
          <div className="bg-white w-full rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg w-full font-medium text-gray-900 ">部门详情</h3>
            <div className="flex gap-6">
              <div>
                <InputGroup<formDataType>
                  name="positions"
                  label="部门岗位"
                />
              </div>
              <div>
                <InputGroup<formDataType>
                  name="miniClubs"
                  label="部门小组"
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
              提交
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
};

export default CreateClub;