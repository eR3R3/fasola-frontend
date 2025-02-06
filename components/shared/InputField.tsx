'use client'

import React from 'react';
import {FieldPath, FieldValues, useFormContext} from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import {Input} from "@heroui/input";

interface UserCreateInputFieldProp<T extends FieldValues>{
  name: FieldPath<T>
  label: string,
  description?: string,
  width?: number
}

const InputField = <T extends FieldValues>({name, label, description, width}:UserCreateInputFieldProp<T>) => {

  const methods = useFormContext()

  return (
    <FormField
    name={name}
    control={methods.control}
    render={({field})=>(
      <div className="w-full">
        <FormLabel className="text-lg font-bold ">{label}</FormLabel>
        <FormItem className="w-full">
          <FormControl>
            <Input
              isClearable
              {...field}
              variant="underlined"
              label={label}
              className={`bg-transparent border-b border-gray-200
                          focus:border-gray-500 w-full
                          transition-colors min-w-[${width}]`}
              onClear={() => field.onChange("")}
            />
          </FormControl>
        </FormItem>
        <FormDescription className="pt-3 text-sm text-gray-600">{description}</FormDescription>
        <FormMessage className="text-sm text-red-500 font-medium" />
      </div>
    )}/>

  );
};

export default InputField;
