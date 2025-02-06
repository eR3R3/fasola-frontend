'use client'

import React, {useEffect, useState} from 'react';
import {FieldPath, FieldValues, useFieldArray, useFormContext} from "react-hook-form";
import {FormField, FormLabel, FormMessage} from "@/components/ui/form";
import { Input } from '@heroui/input';
import { Button } from "@heroui/button";
import { Plus, CircleMinus } from "lucide-react";
import AutoCompleteField from "@/components/shared/AutoCompleteField";
import InputField from "@/components/shared/InputField";

interface InputGroupProp<T extends FieldValues> {
  name: FieldPath<T>;
  label?: string;
}

const DoubleInputGroup = <T extends FieldValues>({name, label}: InputGroupProp<T>) => {
  const methods = useFormContext<FormData>();

  const {fields, append, remove} = useFieldArray({
    control: methods.control,
    // @ts-ignore
    name: name
  });
  const [allUserNames, setAllUserNames] = useState([])

  const handleAllUser = async () => {
    const allUsers = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/findAll`, {
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    }).then(async res => await res.json())
    const allUserNames = allUsers.map((user:any)=>user.name)
    console.log(allUserNames)
    setAllUserNames(allUserNames)
  }

  useEffect(() => {
    handleAllUser()
  },[])

  return (
    <div className="w-full space-y-4 pt-8">
      <div className="">
        <FormLabel className="text-lg font-bold ">{label}</FormLabel>
        {fields.map((field, index) => (
          <div key={field.id} className="group flex w-full items-center gap-2 relative rounded-lg transition-colors">
            <div className="flex-1 flex gap-4">
              <AutoCompleteField name={`${name}.${index}.name` as const} label="用户姓名" description="用户姓名" items={allUserNames}/>
              <AutoCompleteField name={`${name}.${index}.role` as const} label="用户级别" description="用户级别" items={["LEADER", "WORKER"]}/>
            </div>

            <CircleMinus className="h-6 w-6" onClick={() => remove(index)}/>
          </div>
        ))}
        <FormMessage className="text-sm text-red-500 font-medium" />
      </div>

      <Button
        type="button"
        variant="ghost"
        className="flex items-center gap-2 text-sm
                 text-gray-600
                 hover:bg-gray-100
                 rounded-lg py-2 px-4 transition-all duration-200
                 border border-gray-200 hover:border-gray-300"
        onPress={() => append({name: "", role: "WORKER"})}
      >
        <Plus className="h-4 w-4" />
        <span>添加{label}</span>
      </Button>
    </div>
  );
};

export default DoubleInputGroup;