'use client'

import React, { useEffect, useState } from 'react';
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "@/components/shared/InputField";
import { Button } from "@heroui/button";
import { toast, useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import InfoCard from "@/components/shared/InfoCard";

const UpdateQuestions = () => {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    async function fetchQuestions() {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/questions/findAll`);
      const data = await response.json();
      setQuestions(data);
    }
    fetchQuestions();
  }, []);

  return (
    <div className="flex flex-wrap gap-6">
      {questions.map((question, index) => (
        <InfoCard key={index} name={question.name} type="questions" description0={`此问题属于 ${question?.miniTest?.map((m)=>(m.name))}`} 
        content={[{value: [question.content]}]}/>
      ))}
    </div>
  );
};

export default UpdateQuestions; 