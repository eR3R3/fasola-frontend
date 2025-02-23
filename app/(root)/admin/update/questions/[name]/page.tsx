'use client'

import React, { useEffect } from 'react';
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "@/components/shared/InputField";
import { Button } from "@heroui/button";
import { toast, useToast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";

const UpdateQuestion = () => {
  const { toast } = useToast()
  const params = useParams()
  const router = useRouter()

  const zodSchema = z.object({
    name: z.string().min(1, "问题名称不能为空"),
    content: z.string().min(1, "问题内容不能为空"),
  });

  type formDataType = z.infer<typeof zodSchema>;

  const methods = useForm<formDataType>({
    resolver: zodResolver(zodSchema),
    defaultValues: {
      name: "",
      content: "",
    }
  });

  useEffect(() => {
    async function fetchQuestion() {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/questions/findOne/${params.name}`);
      const data = await response.json();
      methods.reset({
        name: data.name,
        content: data.content,
      });
    }
    fetchQuestion();
  }, [params.name, methods]);

  async function onSubmit(data: formDataType) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/questions/update/${params.name}`, {
        method: "PUT",
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
          description: "成功更新问题",
        });
        router.push('/admin/update/questions');
      }
    } catch (error) {
      toast({
        variant: "default",
        title: "错误",
        description: "更新问题失败",
      });
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">
          更新问题
        </h2>

        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">问题信息</h3>
            <div className="space-y-6">
              <InputField
                name="name"
                label="问题名称"
                description="输入问题名称（用于识别问题）"
              />
              
              <InputField
                name="content"
                label="问题内容"
                description="输入具体问题内容"
              />
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

export default UpdateQuestion; 