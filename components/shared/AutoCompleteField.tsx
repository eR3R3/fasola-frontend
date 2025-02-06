'use client'

import React from 'react';
import {FieldPath, FieldValues, useFormContext} from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import {Autocomplete, AutocompleteItem} from "@heroui/autocomplete";

interface UserCreateInputFieldProp<T extends FieldValues>{
  name: FieldPath<T>
  label?: string,
  description?: string,
  width?: number,
  haveTitle?: boolean,
  items: string[]
}

const InputField = <T extends FieldValues>({name, label, description, items=[], haveTitle=true, width}:UserCreateInputFieldProp<T>) => {
  const methods = useFormContext();

  return (
    <FormField
      name={name}
      control={methods.control}
      render={({field}) => (
        <div className="w-full">
          {haveTitle&&<FormLabel className="text-lg font-bold">{label}</FormLabel>}
          <FormItem className="w-full">
            <FormControl>
              <Autocomplete
                selectedKey={(field.value!=null)?field.value:""} // Use selectedKey instead of value
                onSelectionChange={(key) => {
                  field.onChange(key); // Update the form value when selection changes
                }}
                variant="underlined"
                label={label}
                className={`bg-transparent border-b border-gray-200
                          focus:border-gray-500 w-full
                          transition-colors min-w-[${width}px]`}
                isClearable={true}
              >
                {items.map((item: string) => (
                  <AutocompleteItem key={item} value={item}>
                    {item}
                  </AutocompleteItem>
                ))}
              </Autocomplete>
            </FormControl>
          </FormItem>
          <FormDescription className="pt-3 text-sm text-gray-600">{description}</FormDescription>
          <FormMessage className="text-sm text-red-500 font-medium" />
        </div>
      )}
    />
  );
};

export default InputField;