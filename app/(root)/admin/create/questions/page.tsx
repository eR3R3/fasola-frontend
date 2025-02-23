'use client'

import React from 'react';
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "@/components/shared/InputField";
import { Button } from "@heroui/button";
import { toast, useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import InputGroup from "@/components/shared/InputGroup";

const CreateQuestion = () => {
  const { toast } = useToast()
  const router = useRouter()

  const zodSchema = z.object({
    content: z.string().min(1, "问题内容不能为空"),
    options: z.array(z.object({
      name: z.string()
    })).min(2, "至少需要两个选项"),
    answer: z.string().min(1, "答案不能为空")
  });

  type formDataType = z.infer<typeof zodSchema>;

  const methods = useForm<formDataType>({
    resolver: zodResolver(zodSchema),
    defaultValues: {
      content: "",
      options: [{name: ""}, {name: ""}],
      answer: ""
    }
  });

  async function onSubmit(data: formDataType) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/questions/create`, {
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
          description: "成功创建问题",
        });
        router.push('/');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: "创建问题失败",
      });
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">
          创建问题
        </h2>

        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">问题信息</h3>
            <div className="space-y-6">
              <InputField
                name="content"
                label="问题内容"
                description="输入问题内容"
              />
              
              <InputGroup
                name="options"
                label="选项"
              />
              
              <InputField
                name="answer"
                label="正确答案"
                description="输入正确答案"
              />
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

export default CreateQuestion; 