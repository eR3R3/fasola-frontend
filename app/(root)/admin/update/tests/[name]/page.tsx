'use client'

import React, { useEffect } from 'react';
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "@/components/shared/InputField";
import { Button } from "@heroui/button";
import { toast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";
import AutoCompleteField from "@/components/shared/AutoCompleteField";
import { CircleMinus } from "lucide-react";

const UpdateTest = () => {
  const router = useRouter();
  const params = useParams();
  const [allMiniTests, setAllMiniTests] = React.useState([]);

  const zodSchema = z.object({
    name: z.string().min(1, "测试名称不能为空"),
    miniTest: z.array(z.object({
      name: z.string().min(1, "小测试名称不能为空"),
      proportion: z.string().refine(
        (val) => {
          const num = parseFloat(val);
          return !isNaN(num) && num >= 0 && num <= 1;
        },
        "占比必须在0到1之间"
      )
    })).min(1, "至少需要一个小测试")
  });

  type formDataType = z.infer<typeof zodSchema>;

  const methods = useForm<formDataType>({
    resolver: zodResolver(zodSchema),
    defaultValues: {
      name: "",
      miniTest: [{name: "", proportion: "0"}]
    }
  });

  useEffect(() => {
    // Fetch mini tests for autocomplete
    async function fetchMiniTests() {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/miniTests/findAll`);
      const data = await response.json();
      setAllMiniTests(data.map((t: any) => t.name));
    }
    fetchMiniTests();

    // Fetch current test data
    async function fetchTest() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tests/findOne/${params.name}`);
        if (!response.ok) throw new Error('Failed to fetch test');
        const data = await response.json();
        
        methods.reset({
          name: data.name,
          miniTest: data.miniTest.map((t: any, index: number) => ({
            name: t.name,
            proportion: data.proportion[index].toString()
          }))
        });
      } catch (error) {
        console.error('Error fetching test:', error);
        toast({
          variant: "default",
          title: "错误",
          description: "获取测试信息失败",
        });
      }
    }
    fetchTest();
  }, [params.name, methods]);

  const removeMiniTest = (index: number) => {
    const currentMiniTests = methods.getValues('miniTest');
    if (currentMiniTests.length > 1) {
      methods.setValue('miniTest', 
        currentMiniTests.filter((_, i) => i !== index)
      );
    } else {
      toast({
        variant: "default",
        title: "提示",
        description: "至少需要保留一个小测试",
      });
    }
  };

  async function onSubmit(data: formDataType) {
    try {
      // Validate that proportions sum to 1
      const totalProportion = data.miniTest.reduce(
        (sum, t) => sum + parseFloat(t.proportion), 
        0
      );
      
      if (Math.abs(totalProportion - 1) > 0.01) {
        toast({
          variant: "default",
          title: "错误",
          description: "所有小测试的占比之和必须等于1",
        });
        return;
      }

      const updatedData = {
        name: data.name,
        miniTest: data.miniTest.map(t => ({
          name: t.name,
        })),
        proportion: data.miniTest.map(t => parseFloat(t.proportion))
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tests/update/${params.name}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
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
          description: "成功更新测试",
        });
        router.push('/admin/update/tests');
      }
    } catch (error) {
      console.error('Error updating test:', error);
      toast({
        variant: "default",
        title: "错误",
        description: "更新测试失败",
      });
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">
          更新测试
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
            <div className="flex items-center">
              <div className="text-lg font-medium text-gray-700 w-[45%]">小测试名称</div>
              <div className="text-lg font-medium text-gray-700 w-[45%]">占比</div>
              <div className="w-[10%]"></div>
            </div>
            <div className="space-y-4">
              {methods.watch('miniTest')?.map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-[45%]">
                    <AutoCompleteField
                      name={`miniTest.${index}.name`}
                      label="小测试名称"
                      haveTitle={false}
                      items={allMiniTests}
                      description="选择小测试"
                    />
                  </div>
                  <div className="w-[45%]">
                    <InputField
                      name={`miniTest.${index}.proportion`}
                      haveTitle={false}
                      label="占比"
                      description="输入0-1之间的数字"
                    />
                  </div>
                  <div className="w-[10%] flex justify-center">
                    <CircleMinus 
                      className="h-6 w-6 text-red-500 cursor-pointer" 
                      onClick={() => removeMiniTest(index)}
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                onPress={() => methods.setValue('miniTest', [
                  ...methods.getValues('miniTest'),
                  { name: "", proportion: "0" }
                ])}
              >
                添加小测试
              </Button>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <Button type="submit" variant="shadow">
              更新
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
};

export default UpdateTest;
