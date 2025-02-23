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

const UpdateMiniTest = () => {
  const router = useRouter();
  const params = useParams();
  const [allQuestions, setAllQuestions] = React.useState([]);

  const zodSchema = z.object({
    name: z.string().min(1, "小测试名称不能为空"),
    question: z.array(z.object({
      name: z.string().min(1, "问题名称不能为空"),
      content: z.string().min(1, "问题内容不能为空"),
      proportion: z.string().refine(
        (val) => {
          const num = parseFloat(val);
          return !isNaN(num) && num >= 0 && num <= 1;
        },
        "占比必须在0到1之间"
      )
    })).min(1, "至少需要一个问题")
  });

  type formDataType = z.infer<typeof zodSchema>;

  const methods = useForm<formDataType>({
    resolver: zodResolver(zodSchema),
    defaultValues: {
      name: "",
      question: [{name: "", content: "", proportion: "0"}]
    }
  });

  useEffect(() => {
    // Fetch questions for autocomplete
    async function fetchQuestions() {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/questions/findAll`);
      const data = await response.json();
      setAllQuestions(data.map((q: any) => q.name));
    }
    fetchQuestions();

    // Fetch current mini test data
    async function fetchMiniTest() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/miniTests/findOne/${params.name}`);
        if (!response.ok) throw new Error('Failed to fetch mini test');
        const data = await response.json();
        
        methods.reset({
          name: data.name,
          question: data.question.map((q: any, index: number) => ({
            name: q.name,
            content: q.content,
            proportion: data.proportion[index].toString()
          }))
        });
      } catch (error) {
        console.error('Error fetching mini test:', error);
        toast({
          variant: "default",
          title: "错误",
          description: "获取小测试信息失败",
        });
      }
    }
    fetchMiniTest();
  }, [params.name, methods]);

  const removeQuestion = (index: number) => {
    const currentQuestions = methods.getValues('question');
    if (currentQuestions.length > 1) {
      methods.setValue('question', 
        currentQuestions.filter((_, i) => i !== index)
      );
    } else {
      toast({
        variant: "default",
        title: "提示",
        description: "至少需要保留一个问题",
      });
    }
  };

  async function onSubmit(data: formDataType) {
    try {
      // Validate that proportions sum to 1
      const totalProportion = data.question.reduce(
        (sum, q) => sum + parseFloat(q.proportion), 
        0
      );
      
      if (Math.abs(totalProportion - 1) > 0.01) {
        toast({
          variant: "default",
          title: "错误",
          description: "所有问题的占比之和必须等于1",
        });
        return;
      }

      const updatedData = {
        name: data.name,
        question: data.question.map(q => ({
          name: q.name,
          content: q.content
        })),
        proportion: data.question.map(q => parseFloat(q.proportion))
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/miniTests/update/${params.name}`, {
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
          description: "成功更新小测试",
        });
        router.push('/admin/update/miniTests');
      }
    } catch (error) {
      console.error('Error updating mini test:', error);
      toast({
        variant: "default",
        title: "错误",
        description: "更新小测试失败",
      });
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">
          更新小测试
        </h2>

        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">基本信息</h3>
            <InputField
              name="name"
              label="小测试名称"
              description="输入小测试名称"
            />
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">问题信息</h3>
            <div className="flex items-center">
              <div className="text-lg font-medium text-gray-700 w-[35%]">问题名称</div>
              <div className="text-lg font-medium text-gray-700 w-[35%]">问题内容</div>
              <div className="text-lg font-medium text-gray-700 w-[20%]">占比</div>
              <div className="w-[10%]"></div>
            </div>
            <div className="space-y-4">
              {methods.watch('question')?.map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-[35%]">
                    <AutoCompleteField
                      name={`question.${index}.name`}
                      label="问题名称"
                      haveTitle={false}
                      items={allQuestions}
                      description="选择问题"
                    />
                  </div>
                  <div className="w-[35%]">
                    <InputField
                      name={`question.${index}.content`}
                      haveTitle={false}
                      label="问题内容"
                      description="输入问题内容"
                    />
                  </div>
                  <div className="w-[20%]">
                    <InputField
                      name={`question.${index}.proportion`}
                      haveTitle={false}
                      label="占比"
                      description="输入0-1之间的数字"
                    />
                  </div>
                  <div className="w-[10%] flex justify-center">
                    <CircleMinus 
                      className="h-6 w-6 text-red-500 cursor-pointer" 
                      onClick={() => removeQuestion(index)}
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                onPress={() => methods.setValue('question', [
                  ...methods.getValues('question'),
                  { name: "", content: "", proportion: "0" }
                ])}
              >
                添加问题
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

export default UpdateMiniTest;
