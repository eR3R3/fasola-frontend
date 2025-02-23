'use client'

import React, { useEffect, useState } from 'react';
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@heroui/button";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import AutoCompleteField from "@/components/shared/AutoCompleteField";
import AutoCompleteGroup from '@/components/shared/AutoCompleteGroup';

const AssignTest = () => {
  const router = useRouter();
  const [allTests, setAllTests] = useState([]);
  const [allPersons, setAllPersons] = useState([]);

  const zodSchema = z.object({
    test: z.string().min(1, "请选择一个测试"),
    reviewer: z.array(z.object({ name: z.string() })),
    reviewee: z.array(z.object({ name: z.string() }))
  });

  type formDataType = z.infer<typeof zodSchema>;

  const methods = useForm<formDataType>({
    resolver: zodResolver(zodSchema),
    defaultValues: {
      test: "",
      reviewer: [{ name: "" }],
      reviewee: [{ name: "" }]
    }
  });

  useEffect(() => {
    async function fetchTests() {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tests/findAll`);
      const data = await response.json();
      setAllTests(data.map((test: any) => ({ id: test.id, name: test.name })));
    }

    async function fetchPersons() {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/findAll`);
      const data = await response.json();
      console.log(data)
      setAllPersons(data.map((person: any) => ({ id: person.id, name: person.name })));
    }

    fetchTests();
    fetchPersons();
  }, []);

  async function onSubmit(data: formDataType) {
    console.log('Form submitted with data:', data);
    const reviewerNames = data.reviewer.map((each) => each.name);
    const revieweeNames = data.reviewee.map((each) => each.name);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/assignments/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          test: data.test,
          reviewer: reviewerNames,
          reviewee: revieweeNames
        })
      });

      const result = await response.json();
      console.log('Response from server:', result);

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
          description: "成功分配测试",
        });
        router.push('/admin/view');
      }
    } catch (error) {
      console.error('Error assigning test:', error);
      toast({
        variant: "destructive",
        title: "错误",
        description: "分配测试失败，请检查网络连接或联系管理员",
      });
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">分配测试</h2>

        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">选择测试</h3>
            <AutoCompleteField
              name="test"
              label="测试名称"
              items={allTests.map(test => test.name)}
              description="选择要分配的测试"
            />
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">选择人员</h3>
              <div className='flex gap-6'>
                <AutoCompleteGroup<formDataType>
                  name="reviewer"
                  label="评价者"
                  items={allPersons.map(person => person.name)}
                />
                <AutoCompleteGroup<formDataType>
                  name="reviewee"
                  label="被评价者"
                  items={allPersons.map(person => person.name)}
                />
              </div>
          </div>

          <div className="flex justify-end mt-8">
            <Button type="submit" variant="shadow"> 
              分配
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
};

export default AssignTest;
