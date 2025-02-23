'use client'

import React, { useEffect, useState } from 'react';
import { Button } from "@heroui/button";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import InfoCard from "@/components/shared/InfoCard";
import { CircleMinus, Pencil } from "lucide-react";
import { m } from 'framer-motion';

interface MiniTest {
  id: string;
  name: string;
  question: {
    name: string;
    content: string
  }[];
  proportion: number[];
  test: any[]
}

const UpdateMiniTests = () => {
  const [miniTests, setMiniTests] = useState<MiniTest[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchMiniTests();
  }, []);

  const fetchMiniTests = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/miniTests/findAll`);
      if (!response.ok) {
        throw new Error('Failed to fetch mini tests');
      }
      const data = await response.json();
      console.log(data)
      setMiniTests(data);
    } catch (error) {
      console.error('Error fetching mini tests:', error);
      toast({
        variant: "default",
        title: "错误",
        description: "获取小测试列表失败",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">小测试管理</h2>
      <div className="flex flex-wrap gap-4">
        {miniTests?.map((miniTest) => (
          <InfoCard
            name={miniTest.name}
            key={miniTest.id}
            type="miniTests"
            description0={`此小测试属于:${miniTest?.test?.map((t)=>(t.name))||"无"}`}
            content={
              miniTest.question.map((q, index)=>({key: q.name, value: [q.content, `占比: ${miniTest.proportion[index]}`]}))
            }
          />
        ))}
      </div>
    </div>
  );
};

export default UpdateMiniTests; 