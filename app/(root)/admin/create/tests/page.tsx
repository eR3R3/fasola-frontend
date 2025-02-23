'use client'

import React, { useEffect, useState } from 'react';
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "@/components/shared/InputField";
import { Button } from "@heroui/button";
import { toast, useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import AutoCompleteField from "@/components/shared/AutoCompleteField";
import InputGroup from "@/components/shared/InputGroup";

const CreateTest = () => {
  const { toast } = useToast()
  const router = useRouter()
  const [allMiniTests, setAllMiniTests] = useState([])

  const zodSchema = z.object({
    name: z.string().min(1, "测试名称不能为空"),
    miniTests: z.array(z.object({
      name: z.string(),
      proportion: z.number().min(0).max(1)
    })).min(1, "至少需要一个小测试")
  });

  type formDataType = z.infer<typeof zodSchema>;

  const methods = useForm<formDataType>({
    resolver: zodResolver(zodSchema),
    defaultValues: {
      name: "",
      miniTests: [{name: "", proportion: 0}]
    }
  });

  useEffect(() => {
    async function fetchMiniTests() {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/miniTests/findAll`);
      const data = await response.json();
      setAllMiniTests(data.map((test: any) => test.name));
    }
    fetchMiniTests();
  }, []);

  async function onSubmit(data: formDataType) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tests/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      
      if (result.message) {
        toast({
          variant: "default",
          title: "错误",
          description: result.message,
        });
      } else {
        toast({
          variant: "default",
          title: "成功",
          description: "成功创建测试",
        });
        router.push('/');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: "创建测试失败",
      });
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">
          创建测试
        </h2>

        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">基本信息</h3>
            <InputField
              name="name"
              label="测试名称"
              description="输入测试名称"
            />
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">小测试信息</h3>
            <div className="space-y-4">
              {methods.watch('miniTests')?.map((_, index) => (
                <div key={index} className="grid grid-cols-2 gap-4">
                  <AutoCompleteField
                    name={`miniTests.${index}.name`}
                    label="小测试名称"
                    items={allMiniTests}
                    description="选择小测试"
                  />
                  <InputField
                    name={`miniTests.${index}.proportion`}
                    label="占比"
                    description="输入0-1之间的数字"
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                onClick={() => methods.setValue('miniTests', [
                  ...methods.getValues('miniTests'),
                  { name: "", proportion: 0 }
                ])}
              >
                添加小测试
              </Button>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <Button type="submit" variant="shadow">
              提交
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
};

export default CreateTest; 