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
import { useParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Progress } from "@/components/ui/progress"
import { useUser } from "@clerk/nextjs"

const formSchema = z.object({
  answers: z.record(z.string())
})

// Define types
interface Question {
  id: number
  name: string
  content: string
  miniTestId: number
  miniTestName: string
  miniTestProportion: number[]
  partNumber: number
}

interface MiniTestSummary {
  id: number
  name: string
  proportion: number[]
  questionCount: number
  assignedQuestionCount: number
}

interface AssessmentData {
  id: number
  questionRecord: string[]
  revieweeId: number
  testId: number
  status: string
  test: {
    id: number
    name: string
    proportion: number[]
    miniTest: {
      id: number
      name: string
      proportion: number[]
      question: {
        id: number
        name: string
        content: string
      }[]
    }[]
  }
  reviewer: {
    id: number
    name: string
  }[]
  reviewee: {
    id: number
    name: string
  }
}

export default function AssessmentForm() {
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const { user } = useUser()
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [assignedQuestions, setAssignedQuestions] = useState<Question[]>([])
  const [miniTestSummaries, setMiniTestSummaries] = useState<MiniTestSummary[]>([])

  useEffect(() => {
    if (params.id) {
      console.log('Updating assessment state to IN_PROGRESS')
      const updateState = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/assignments/update/state`, {
          headers: { 'Content-Type': 'application/json'},
          method: 'POST',
          body: JSON.stringify({
            id: params.id,
            state: 'IN_PROGRESS'
          })
        })
        const data = await response.json()
        console.log('Fetched assessment data:', data)
      }  
      updateState()
      console.log('Assessment state updated to IN_PROGRESS')
    }    
  }, [])

  useEffect(() => {
    if (params.id) {
      const fetchQuestions = async () => {
        try {
          setLoading(true)
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/assignments/findOne/${params.id}`)
          const data = await response.json()
          console.log('Fetched assessment data:', data)
          
          setAssessmentData(data)
          
          // Wait for user to be loaded before processing questions
          if (user) {
            const fullName = user.firstName && user.lastName 
              ? `${user.firstName}${user.lastName}`
              : user.firstName || user.username || '';
            processAssignedQuestions(data, fullName);
            console.log('Current user name:', fullName);
          }
        } catch (error) {
          console.error('Error fetching assessment data:', error)
          toast({
            variant: "destructive",
            title: "加载失败",
            description: "无法加载问题，请刷新页面重试",
          })
        } finally {
          setLoading(false)
        }
      }
      fetchQuestions()
    }
  }, [params.id, user])

  const processAssignedQuestions = (data: AssessmentData, currentUserName: string) => {
    if (!data) return
    
    console.log('Processing questions for user:', currentUserName)
    
    const questions: Question[] = []
    const miniTests: Record<number, MiniTestSummary> = {}
    let questionIndex = 0
    
    // Initialize mini-test summaries
    data.test.miniTest.forEach(miniTest => {
      miniTests[miniTest.id] = {
        id: miniTest.id,
        name: miniTest.name,
        proportion: miniTest.proportion,
        questionCount: miniTest.question.length,
        assignedQuestionCount: 0
      }
    })
    
    // Map questions to their assigned reviewers based on questionRecord
    data.test.miniTest.forEach((miniTest, miniTestIndex) => {
      miniTest.question.forEach(question => {
        // Check if this question is assigned to the current user
        if (questionIndex < data.questionRecord.length && 
            data.questionRecord[questionIndex] === currentUserName) {
          
          questions.push({
            id: question.id,
            name: question.name,
            content: question.content,
            miniTestId: miniTest.id,
            miniTestName: miniTest.name,
            miniTestProportion: miniTest.proportion,
            partNumber: miniTestIndex + 1 // Add part number based on the order in the test
          })
          
          // Update mini-test summary
          miniTests[miniTest.id].assignedQuestionCount++;
        }
        questionIndex++
      })
    })
    
    setAssignedQuestions(questions)
    setMiniTestSummaries(Object.values(miniTests))
    console.log('Assigned questions for current user:', questions)
    console.log('Mini-test summaries:', Object.values(miniTests))
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answers: {}
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log('Submitting answers:', values)
      
      if (!user) {
        throw new Error("用户未登录")
      }
      
      const fullName = user.firstName && user.lastName 
        ? user.firstName+user.lastName
        : user.firstName || user.username || '';

      const scoreSet = []
      let counter = 0
      console.log('Assessment data:', values)
      for (const [index, each] of assessmentData.questionRecord.entries()) {
        if (each === fullName) {
          console.log(index)
          console.log(Object.values(values.answers)[counter])
          scoreSet[index] = Object.values(values.answers)[counter]
          counter += 1
        }
      }
      console.log('Score set:', scoreSet)
      
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/assignments/update/score`, {
        headers: { 'Content-Type': 'application/json'},
        method: 'POST',
        body: JSON.stringify({id: parseInt(params.id as string), scoreSet})
      })
      const result = await response.json()
      console.log('Submission result:', result)

      if (response.ok) {
        toast({
          title: "提交成功",
          description: "您的测评已经成功提交",
        })
      } else {
        toast({
          variant: "destructive",
          title: "提交失败",
          description: "请稍后重试",
        })
      }
      router.push('/user/assessment')
      
    } catch (error) {
      console.error('Error submitting assessment:', error)
      toast({
        variant: "destructive",
        title: "提交失败",
        description: error instanceof Error ? error.message : "请稍后重试",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-semibold text-red-600">请先登录</h2>
        <p className="mt-2">您需要登录后才能访问此页面</p>
        <Button onClick={() => router.push('/')} className="mt-4">
          返回主页
        </Button>
      </div>
    )
  }

  if (!assessmentData) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-semibold text-red-600">无法加载测评</h2>
        <p className="mt-2">请检查链接是否正确或联系管理员</p>
        <Button onClick={() => router.push('/user/assessment')} className="mt-4">
          返回测评列表
        </Button>
      </div>
    )
  }

  if (assignedQuestions.length === 0) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-semibold">没有分配给您的问题</h2>
        <p className="mt-2">当前测评中没有需要您评价的问题</p>
        <Button onClick={() => router.push('/user/assessment')} className="mt-4">
          返回测评列表
        </Button>
      </div>
    )
  }

  // Group questions by mini-test
  const questionsByMiniTest: Record<number, Question[]> = {}
  assignedQuestions.forEach(question => {
    if (!questionsByMiniTest[question.miniTestId]) {
      questionsByMiniTest[question.miniTestId] = []
    }
    questionsByMiniTest[question.miniTestId].push(question)
  })

  const scoreOptions = [
    { value: "5", label: "5分 (优秀)" },
    { value: "4", label: "4分 (良好)" },
    { value: "3", label: "3分 (一般)" },
    { value: "2", label: "2分 (较差)" },
    { value: "1", label: "1分 (差)" }
  ]

  // Format proportion for display
  const formatProportion = (proportions: number[], miniTestNames?: string[]) => {
    if (!proportions || proportions.length === 0) return "未设置";
    
    if (proportions.length === 2 && miniTestNames && miniTestNames.length === 2) {
      // When we have both proportions and names
      return `${miniTestNames[0]}: ${(proportions[0] * 100).toFixed(0)}%, ${miniTestNames[1]}: ${(proportions[1] * 100).toFixed(0)}%`;
    } else if (proportions.length === 2) {
      // Two proportions without names
      return `部分一: ${(proportions[0] * 100).toFixed(0)}%, 部分二: ${(proportions[1] * 100).toFixed(0)}%`;
    } else {
      // Generic case for any number of proportions
      return proportions.map((p, index) => 
        `部分${index + 1}: ${(p * 100).toFixed(0)}%`
      ).join(", ");
    }
  }

  return (
    <Form {...form}>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">测评表单</h2>
          <div className="mt-2 space-y-2">
            <p className="text-muted-foreground">您正在评价: <span className="font-semibold">{assessmentData.reviewee.name}</span></p>
            <p className="text-muted-foreground">测评名称: <span className="font-semibold">{assessmentData.test.name}</span></p>
          </div>
        </div>

        {/* Test Structure Summary */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">测评结构</h3>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">测评权重比例:</span>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                  {formatProportion(
                    assessmentData.test.proportion, 
                    assessmentData.test.miniTest.map(m => m.name)
                  )}
                </span>
              </div>
              <span className="text-sm text-gray-500">您需要评价 {assignedQuestions.length} 个问题</span>
            </div>
          </div>
          
          {/* Removed Accordion component and replaced with static display */}
          <div className="space-y-4">
            {miniTestSummaries.map((miniTest) => (
              <div key={miniTest.id} className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="mr-2">部分{miniTestSummaries.findIndex(m => m.id === miniTest.id) + 1}</Badge>
                    <span className="font-medium">{miniTest.name}</span>
                    {miniTest.assignedQuestionCount > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {miniTest.assignedQuestionCount} 个问题
                      </Badge>
                    )}
                  </div>
                  
                  <span className="text-sm bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                    权重: {formatProportion(miniTest.proportion)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    {miniTest.assignedQuestionCount} / {miniTest.questionCount} 个问题需要您评价
                  </p>
                  
                  <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${(miniTest.assignedQuestionCount / miniTest.questionCount) * 100}%` }}
                    ></div>
                  </div>
                  
                  {miniTest.assignedQuestionCount > 0 && questionsByMiniTest[miniTest.id]?.map((question, index) => (
                    <div key={question.id} className="ml-2 pl-2 border-l-2 border-gray-200 py-2">
                      <div className="mb-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <Badge variant="outline" className="mb-1">部分{question.partNumber}</Badge>
                            <h3 className="text-lg font-semibold">{question.name}</h3>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-2">{question.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {Object.entries(questionsByMiniTest).map(([miniTestId, questions]) => (
            <div key={miniTestId} className="space-y-4">
              <h3 className="text-xl font-semibold border-b pb-2">
                {questions[0].miniTestName}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  权重: {formatProportion(questions[0].miniTestProportion)}
                </span>
              </h3>
              
              {questions.map((question, index) => (
                <Card key={`question-${question.id}-${index}`} className="p-6">
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Badge variant="outline" className="mb-1">部分{question.partNumber}</Badge>
                        <h3 className="text-lg font-semibold">{question.name}</h3>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">{question.content}</p>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name={`answers.${question.id}`}
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base">评分:</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            {scoreOptions.map((option) => (
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
            </div>
          ))}

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push('/user/assessment')}>
              取消
            </Button>
            <Button type="submit">
              提交测评
            </Button>
          </div>
        </form>
      </div>
    </Form>
  )
} 


