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
import InfoCard from "@/components/shared/InfoCard";

const UpdateTests = () => {
  const [tests, setTests] = useState([]);

  useEffect(() => {
    async function fetchTests() {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tests/findAll`);
      const data = await response.json();
      setTests(data.map((test: any) => ({
        type: "tests",
        name: test.name,
        description0: `包含 ${test.miniTest.length} 个小测试`,
        content: test.miniTest.map((miniTest: any, index: number) => ({
          key: miniTest.name,
          value: [`比重: ${test.proportion[index]}`]
        }))
      })));
    }
    fetchTests();
  }, []);

  return (
    <div className="flex flex-wrap gap-4">
      {tests.map((test, index) => (
        <InfoCard key={index} {...test} />
      ))}
    </div>
  );
};

export default UpdateTests; 