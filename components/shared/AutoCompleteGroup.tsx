'use client'

import React from 'react';
import {FieldPath, FieldValues, useFieldArray, useFormContext} from "react-hook-form";
import {FormField, FormLabel, FormMessage} from "@/components/ui/form";
import { Input } from '@heroui/input';
import { Button } from "@heroui/button";
import { Plus, CircleMinus } from "lucide-react";
import AutoCompleteField from "@/components/shared/AutoCompleteField";

interface InputGroupProp<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
  items: string[]
}

const AutoCompleteGroup = <T extends FieldValues>({name, label, items}: InputGroupProp<T>) => {
  const methods = useFormContext<FormData>();


  const {fields, append, remove} = useFieldArray({
    control: methods.control,
    // @ts-ignore
    name: name
  });

  return (
    <div className="w-full space-y-4">
      <div className="">
        <FormLabel className="text-lg font-bold ">{label}</FormLabel>
        {fields.map((field, index) => (
          <div key={field.id} className="group flex w-full items-center gap-2 relative  rounded-lg  transition-colors">
            <AutoCompleteField name={`${name}.${index}.name` as const} items={items} label={label} haveTitle={false}/>
            <CircleMinus className="h-6 w-6 " onClick={() => remove(index)}/>
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
        onPress={() => append({name: ""})}
      >
        <Plus className="h-4 w-4"/>
        <span>添加{label}</span>
      </Button>
    </div>
  );
};

export default AutoCompleteGroup;