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
import { CircleMinus } from "lucide-react";

const CreateMiniTest = () => {
  const { toast } = useToast()
  const router = useRouter()
  const [allQuestions, setAllQuestions] = useState([])

  const zodSchema = z.object({
    name: z.string().min(1, "小测试名称不能为空"),
    question: z.array(z.object({
      name: z.string().min(1, "问题名称不能为空"),
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
      question: [{name: "", proportion: "0"}]
    }
  });

  useEffect(() => {
    async function fetchQuestions() {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/questions/findAll`);
      const data = await response.json();
      setAllQuestions(data.map((q: any) => q.name));
    }
    fetchQuestions();
  }, []);

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
      const totalProportion = data.question.reduce(
        (sum, q) => sum + parseFloat(q.proportion), 
        0
      );
      
      if (Math.abs(totalProportion - 1) > 0.01) {
        toast({
          variant: "destructive",
          title: "错误",
          description: "所有问题的占比之和必须等于1",
        });
        return;
      }

      const updatedData = {
        name: data.name,
        question: data.question.map(q => ({
          name: q.name,
          proportion: parseFloat(q.proportion)
        }))
      };

      console.log('Submitting data:', updatedData);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/miniTests/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      
      if (result.message) {
        toast({
          variant: "destructive",
          title: "错误",
          description: result.message,
        });
      } else {
        toast({
          variant: "default",
          title: "成功",
          description: "成功创建小测试",
        });
        router.push('/admin/update/miniTests');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        variant: "destructive",
        title: "错误",
        description: "创建小测试失败",
      });
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">
          创建小测试
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
              <div className="text-lg font-medium text-gray-700 w-[45%]">问题内容</div>
              <div className="text-lg font-medium text-gray-700 w-[45%]">占比</div>
              <div className="w-[5%]"></div>
            </div>
            <div className="space-y-4">
              {methods.watch('question')?.map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-[45%]">
                    <AutoCompleteField
                      name={`question.${index}.name`}
                      label="问题内容"
                      haveTitle={false}
                      items={allQuestions}
                      description="选择问题"
                    />
                  </div>
                  <div className="w-[45%]">
                    <InputField
                      name={`question.${index}.proportion`}
                      haveTitle={false}
                      label="占比"
                      description="输入0-1之间的数字"
                    />
                  </div>
                  <div className="w-[10%] flex justify-center">
                    <CircleMinus className="h-6 w-6 text-red-500 cursor-pointer" onClick={() => removeQuestion(index)}/>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                onPress={() => methods.setValue('question', [
                  ...methods.getValues('question'),
                  { name: "", proportion: "0" }
                ])}
              >
                添加问题
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

export default CreateMiniTest; 