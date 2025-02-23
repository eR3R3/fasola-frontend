'use client'

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Question {
  id: string
  content: string
  options: { value: string; label: string }[]
}

const formSchema = z.object({
  answers: z.record(z.string())
})

export default function AssessmentForm({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answers: {}
    }
  })

  useEffect(() => {
    // Fetch assessment questions
    // This is a placeholder, replace with actual API call
    setQuestions([
      {
        id: "1",
        content: "这是一个示例问题？",
        options: [
          { value: "1", label: "选项 1" },
          { value: "2", label: "选项 2" },
          { value: "3", label: "选项 3" },
          { value: "4", label: "选项 4" },
          { value: "5", label: "选项 5" },
        ]
      }
      // Add more questions as needed
    ])
  }, [params.id])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Submit assessment answers
      // This is a placeholder, replace with actual API call
      console.log(values)
      
      toast({
        title: "提交成功",
        description: "您的测评已经成功提交",
      })
      
      router.push('/user/assessment')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "提交失败",
        description: "请稍后重试",
      })
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">测评表单</h2>
        <p className="text-muted-foreground">
          请认真阅读每个问题并选择最适合的答案
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {questions.map((question) => (
            <Card key={question.id} className="p-6">
              <FormField
                control={form.control}
                name={`answers.${question.id}`}
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base">
                      {question.content}
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        {question.options.map((option) => (
                          <FormItem
                            key={option.value}
                            className="flex items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <RadioGroupItem value={option.value} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {option.label}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
            </Card>
          ))}

          <div className="flex justify-end">
            <Button type="submit">
              提交测评
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 