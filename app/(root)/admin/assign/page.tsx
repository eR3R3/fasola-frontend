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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const AssignTest = () => {
  const router = useRouter();
  const [allTests, setAllTests] = useState([]);
  const [allPersons, setAllPersons] = useState([]);
  const [allMiniClubs, setAllMiniClubs] = useState([]);
  const [allPositions, setAllPositions] = useState([]);
  const [assignmentType, setAssignmentType] = useState("person");
  const [selectedTest, setSelectedTest] = useState(null);
  const [testQuestions, setTestQuestions] = useState([]);
  const [questionAssignments, setQuestionAssignments] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [enableQuestionAssignment, setEnableQuestionAssignment] = useState(true);
  const [selectedQuestions, setSelectedQuestions] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [maxSteps] = useState(4);

  const zodSchema = z.object({
    test: z.string().min(1, "请选择一个测试"),
    assignmentType: z.enum(["person", "miniclub", "position"]),
    reviewer: z.array(z.object({ name: z.string() })),
    reviewee: z.array(z.object({ name: z.string() })),
    miniclub: z.string().optional(),
    position: z.string().optional(),
  });

  type formDataType = z.infer<typeof zodSchema>;

  const methods = useForm<formDataType>({
    resolver: zodResolver(zodSchema),
    defaultValues: {
      test: "",
      assignmentType: "person",
      reviewer: [{ name: "" }],
      reviewee: [{ name: "" }],
      miniclub: "",
      position: ""
    }
  });

  const { watch, setValue } = methods;
  const watchTest = watch("test");
  const watchReviewers = watch("reviewer");

  useEffect(() => {
    async function fetchTests() {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tests/findAll`);
      const data = await response.json();
      setAllTests(data.map((test: any) => ({ id: test.id, name: test.name })));
    }

    async function fetchPersons() {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/findAll`);
      const data = await response.json();
      setAllPersons(data.map((person: any) => ({ id: person.id, name: person.name })));
    }

    async function fetchMiniClubs() {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/miniClubs/findAll`);
      const data = await response.json();
      setAllMiniClubs(data.map((club: any) => ({ id: club.id, name: club.name })));
    }

    async function fetchPositions() {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/positions/findAll`);
      const data = await response.json();
      setAllPositions(data.map((position: any) => ({ id: position.id, name: position.name })));
    }

    fetchTests();
    fetchPersons();
    fetchMiniClubs();
    fetchPositions();
  }, []);

  useEffect(() => {
    if (watchTest && currentStep === 3 && testQuestions.length === 0) {
      console.log('Fetching questions for test:', watchTest);
      fetchTestQuestions(watchTest);
    }
  }, [watchTest, currentStep]);

  useEffect(() => {
    setValue("assignmentType", assignmentType as "person" | "miniclub" | "position");
  }, [assignmentType, setValue]);

  // Reset question assignments when reviewers change
  useEffect(() => {
    if (enableQuestionAssignment && testQuestions.length > 0) {
      // Initialize empty assignments for each question
      const initialAssignments = {};
      const initialSelectedQuestions = {};
      
      testQuestions.forEach((q: any) => {
        initialAssignments[q.id] = {};
        initialSelectedQuestions[q.id] = false;
        
        // Initialize empty reviewer assignments for each question
        watchReviewers.forEach((reviewer) => {
          if (reviewer.name) {
            const reviewerId = allPersons.find((p: any) => p.name === reviewer.name)?.id;
            if (reviewerId) {
              initialAssignments[q.id][reviewerId] = false;
            }
          }
        });
      });
      
      setQuestionAssignments(initialAssignments);
      setSelectedQuestions(initialSelectedQuestions);
    }
  }, [watchReviewers, enableQuestionAssignment, testQuestions, allPersons]);

  // Add a useEffect to automatically select all questions when test is loaded
  useEffect(() => {
    if (testQuestions.length > 0) {
      const initialSelections = {};
      testQuestions.forEach(q => {
        initialSelections[q.id] = true;
      });
      setSelectedQuestions(initialSelections);
    }
  }, [testQuestions]);

  const fetchTestQuestions = async (testName: string) => {
    setIsLoading(true);
    try {
      const test = allTests.find((t: any) => t.name === testName);
      if (!test) {
        console.error('Test not found:', testName);
        toast({
          variant: "destructive",
          title: "错误",
          description: "未找到测试",
        });
        return;
      }

      console.log('Found test:', test);
      const encodedTestName = encodeURIComponent(testName);
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/tests/findOne/${encodedTestName}`;
      console.log('Fetching from URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url: url
        });
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
        const data = await response.json();
      console.log('Raw API response:', data);

      if (!data) {
        throw new Error('No data received from API');
      }

      if (data && data.miniTest && Array.isArray(data.miniTest)) {
          // Flatten all questions from all mini tests
        const questions = data.miniTest.flatMap((miniTest: any) => 
          miniTest.question && Array.isArray(miniTest.question) 
            ? miniTest.question.map((q: any) => ({
                  id: q.id,
                  content: q.content,
                  miniTestId: miniTest.id,
                  miniTestName: miniTest.name
                }))
              : []
          );
        
        console.log('Processed questions:', questions);
        if (questions.length === 0) {
          console.warn('No questions found in test data');
        }

          setTestQuestions(questions);
          setSelectedTest(data);
          
          // Initialize question assignments
          const initialAssignments = {};
          questions.forEach((q: any) => {
            initialAssignments[q.id] = {};
            watchReviewers.forEach(reviewer => {
              if (reviewer.name) {
                const reviewerId = allPersons.find((p: any) => p.name === reviewer.name)?.id;
                if (reviewerId) {
                  initialAssignments[q.id][reviewerId] = false;
                }
              }
            });
          });
          setQuestionAssignments(initialAssignments);
      } else {
        console.error('Invalid data structure:', data);
        toast({
          variant: "destructive",
          title: "错误",
          description: "测试数据格式不正确",
        });
      }
    } catch (error) {
      console.error('Error fetching test questions:', error);
      toast({
        variant: "destructive",
        title: "错误",
        description: `获取测试问题失败: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionAssignment = (questionId: string, reviewerId: string, checked: boolean) => {
    setQuestionAssignments(prev => {
      const updatedAssignments = { ...prev };
      if (!updatedAssignments[questionId]) {
        updatedAssignments[questionId] = {};
      }
      updatedAssignments[questionId][reviewerId] = checked;
      return updatedAssignments;
    });
  };

  const handleQuestionSelection = (questionId: string, checked: boolean) => {
    setSelectedQuestions(prev => ({
      ...prev,
      [questionId]: checked
    }));
  };

  const handleSelectAllQuestions = (checked: boolean) => {
    const updatedSelections = {};
    testQuestions.forEach(q => {
      updatedSelections[q.id] = checked;
    });
    setSelectedQuestions(updatedSelections);
  };

  const handleSelectAllReviewersForQuestion = (questionId: string, checked: boolean) => {
    setQuestionAssignments(prev => {
      const updatedAssignments = { ...prev };
      if (!updatedAssignments[questionId]) {
        updatedAssignments[questionId] = {};
      }
      
      watchReviewers.forEach(reviewer => {
        if (reviewer.name) {
          const reviewerId = allPersons.find((p: any) => p.name === reviewer.name)?.id;
          if (reviewerId) {
            updatedAssignments[questionId][reviewerId] = checked;
          }
        }
      });
      
      return updatedAssignments;
    });
  };

  async function onSubmit(data: formDataType) {
    console.log('Form submitted with data:', data);
    
    try {
      let payload;
      
      if (data.assignmentType === "person") {
        const reviewerNames = data.reviewer.map((each) => each.name).filter(Boolean);
        const revieweeNames = data.reviewee.map((each) => each.name).filter(Boolean);
        
        if (reviewerNames.length === 0 || revieweeNames.length === 0) {
          toast({
            variant: "destructive",
            title: "错误",
            description: "请至少选择一个评价者和被评价者",
          });
          return;
        }
        
        // Get selected questions and their assignments
        const assignments = [];
        
        testQuestions.forEach(question => {
          if (!selectedQuestions[question.id]) return;
          
          const questionReviewers = [];
          data.reviewer.forEach(reviewer => {
            if (!reviewer.name) return;
            const person = allPersons.find(p => p.name === reviewer.name);
            if (!person) return;
            
            if (questionAssignments[question.id]?.[person.id]) {
              questionReviewers.push(reviewer.name);
            }
          });

          // If no specific reviewers assigned, use all reviewers
          if (questionReviewers.length === 0) {
            questionReviewers.push(...reviewerNames);
          }

          assignments.push({
            questionId: question.id,
            questionName: question.name,
            content: question.content,
            reviewers: questionReviewers
          });
        });

        console.log('Assignments:', assignments);
          
          payload = {
          assignmentType: "person",
            test: data.test,
          reviewers: reviewerNames,
          reviewees: revieweeNames,
          assignments: assignments
        };
      } else if (data.assignmentType === "miniclub") {
        if (!data.miniclub) {
          toast({
            variant: "destructive",
            title: "错误",
            description: "请选择一个小组",
          });
          return;
        }
        
        payload = {
          test: data.test,
          miniClubId: allMiniClubs.find((club: any) => club.name === data.miniclub)?.id,
          assignmentType: "miniclub"
        };
      } else if (data.assignmentType === "position") {
        if (!data.position) {
          toast({
            variant: "destructive",
            title: "错误",
            description: "请选择一个岗位",
          });
          return;
        }
        
        payload = {
          test: data.test,
          positionId: allPositions.find((position: any) => position.name === data.position)?.id,
          assignmentType: "position"
        };
      }

      console.log('Submitting payload:', payload);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/assignments/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      console.log('Response from server:', result);

      if (response.ok === false) {
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
        // router.push('/admin');
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

  // Count selected questions
  const selectedQuestionCount = Object.values(selectedQuestions).filter(Boolean).length;

  const handleNextStep = React.useCallback(() => {
    setCurrentStep((prevStep) => Math.min(prevStep + 1, 4));
  }, []);

  const handlePreviousStep = React.useCallback(() => {
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 1));
  }, []);

  // Memoize the step components to prevent unnecessary re-renders
  const renderStep1 = React.useMemo(() => (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">选择测试</h3>
            <AutoCompleteField
              name="test"
              label="测试名称"
              items={allTests.map(test => test.name)}
              description="选择要分配的测试"
            />
            <h3 className="text-lg font-medium text-gray-900 mb-6">分配方式</h3>
            <RadioGroup 
              defaultValue="person" 
              className="grid grid-cols-3 gap-4"
              onValueChange={(value) => setAssignmentType(value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="person" id="person" />
                <Label htmlFor="person">按人员分配</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="miniclub" id="miniclub" />
                <Label htmlFor="miniclub">按小组分配</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="position" id="position" />
                <Label htmlFor="position">按岗位分配</Label>
              </div>
            </RadioGroup>
          </div>
  ), [allTests]);

  const renderStep2 = React.useMemo(() => (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">选择人员</h3>
      {assignmentType === "person" && (
        <div className='flex gap-6 mb-6'>
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
      )}
      {assignmentType === "miniclub" && (
        <AutoCompleteField
          name="miniclub"
          label="小组名称"
          items={allMiniClubs.map((club: any) => club.name)}
          description="选择要分配测试的小组"
        />
      )}
      {assignmentType === "position" && (
        <AutoCompleteField
          name="position"
          label="岗位名称"
          items={allPositions.map((position: any) => position.name)}
          description="选择要分配测试的岗位"
        />
      )}
                  </div>
  ), [assignmentType, allPersons, allMiniClubs, allPositions]);

  const renderStep3 = React.useMemo(() => (
    assignmentType === "person" && (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">分配问题</h3>
        {testQuestions.length > 0 ? (
          <div className="space-y-6">
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-gray-500">
                为每个问题选择评价者
              </p>
                      </div>
                      
                      <Card className="p-4 max-h-[500px] overflow-y-auto border-2 border-blue-200">
                        {isLoading ? (
                          <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {testQuestions.map((question: any) => (
                    <div key={question.id} className="border-b pb-4 last:border-b-0">
                      <div className="mb-4">
                        <h4 className="font-medium text-base mb-1">{question.content}</h4>
                        <p className="text-xs text-gray-500">来自: {question.miniTestName}</p>
                                </div>
                      
                      <div className="ml-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">选择评价者：</h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {watchReviewers.map((reviewer, reviewerIndex) => {
                            const reviewerId = reviewer.name ? allPersons.find((p: any) => p.name === reviewer.name)?.id : null;
                            return reviewer.name && reviewerId ? (
                              <div 
                                key={`${question.id}-${reviewerId}-${reviewerIndex}`} 
                                className="flex items-center space-x-2"
                              >
                                            <Checkbox 
                                  id={`${question.id}-${reviewerId}-${reviewerIndex}`}
                                  checked={questionAssignments[question.id]?.[reviewerId] || false}
                                              onCheckedChange={(checked) => {
                                                  handleQuestionAssignment(question.id, reviewerId, checked === true);
                                              }}
                                            />
                                            <label 
                                  htmlFor={`${question.id}-${reviewerId}-${reviewerIndex}`}
                                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                              {reviewer.name}
                                            </label>
                                          </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>
                                      ))}
                                    </div>
              )}
            </Card>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            没有可分配的问题
                                  </div>
                                )}
                              </div>
    )
  ), [assignmentType, testQuestions, isLoading, watchReviewers, allPersons, questionAssignments]);

  const renderStep4 = React.useMemo(() => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">确认分配信息</h3>
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-medium mb-2">基本信息</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600">测试名称：</span>
              <span className="font-medium">{watchTest}</span>
            </div>
            <div>
              <span className="text-gray-600">分配方式：</span>
              <span className="font-medium">
                {assignmentType === "person" ? "按人员分配" : 
                 assignmentType === "miniclub" ? "按小组分配" : "按岗位分配"}
              </span>
            </div>
          </div>
        </div>

        {assignmentType === "person" && (
          <>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-md font-medium mb-2">人员信息</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-600 mb-2">评价者：</h5>
                  <ul className="list-disc list-inside">
                    {watchReviewers.map((reviewer, index) => (
                      reviewer.name && (
                        <li key={index} className="text-sm">{reviewer.name}</li>
                      )
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-600 mb-2">被评价者：</h5>
                  <ul className="list-disc list-inside">
                    {methods.watch("reviewee").map((reviewee, index) => (
                      reviewee.name && (
                        <li key={index} className="text-sm">{reviewee.name}</li>
                      )
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {selectedTest && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium mb-2">测试结构</h4>
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-600 mb-2">测试权重比例：</h5>
                  <div className="flex items-center gap-2 ml-4 mb-2">
                    {selectedTest.proportion && selectedTest.proportion.map((prop, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
                        部分{index + 1}: {(prop * 100).toFixed(0)}%
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-600 mb-2">小测试组成：</h5>
                  <div className="space-y-3 ml-4">
                    {selectedTest.miniTest && selectedTest.miniTest.map((miniTest, miniTestIndex) => (
                      <div key={miniTest.id} className="border-l-2 border-gray-300 pl-4 py-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{miniTest.name}</span>
                          <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                            部分{miniTestIndex + 1}
                          </span>
                        </div>
                        {miniTest.proportion && (
                          <div className="text-xs text-gray-500 mb-2 mt-1">
                            权重比例: {miniTest.proportion.map(p => `${(p * 100).toFixed(0)}%`).join(" : ")}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mb-1">
                          包含 {miniTest.question ? miniTest.question.length : 0} 个问题
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-md font-medium mb-4">问题分配详情</h4>
              
              {/* Group questions by mini-test */}
              {selectedTest && selectedTest.miniTest && selectedTest.miniTest.map((miniTest, miniTestIndex) => {
                const miniTestQuestions = testQuestions.filter(q => q.miniTestId === miniTest.id && selectedQuestions[q.id]);
                
                if (miniTestQuestions.length === 0) return null;
                
                return (
                  <div key={miniTest.id} className="mb-6 last:mb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="text-sm font-semibold">{miniTest.name}</h5>
                      <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                        部分{miniTestIndex + 1}
                      </span>
                      {miniTest.proportion && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          权重: {miniTest.proportion.map(p => `${(p * 100).toFixed(0)}%`).join(" : ")}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-4 ml-4">
                      {miniTestQuestions.map((question) => (
                        <div key={question.id} className="border-b pb-4 last:border-b-0">
                          <p className="font-medium mb-2">{question.content}</p>
                          
                          <div className="ml-4">
                            <h6 className="text-sm font-medium text-gray-600 mb-1">指定评价者：</h6>
                            <div className="flex flex-wrap gap-2">
                              {watchReviewers.map((reviewer, reviewerIndex) => {
                                const reviewerId = reviewer.name ? allPersons.find((p: any) => p.name === reviewer.name)?.id : null;
                                return reviewer.name && reviewerId && questionAssignments[question.id]?.[reviewerId] ? (
                                  <span 
                                    key={`${question.id}-${reviewerId}-${reviewerIndex}`} 
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {reviewer.name}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
          )}

          {assignmentType === "miniclub" && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-medium mb-2">小组信息</h4>
            <div>
              <span className="text-gray-600">选择的小组：</span>
              <span className="font-medium">{methods.watch("miniclub")}</span>
            </div>
            </div>
          )}

          {assignmentType === "position" && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-medium mb-2">岗位信息</h4>
            <div>
              <span className="text-gray-600">选择的岗位：</span>
              <span className="font-medium">{methods.watch("position")}</span>
            </div>
            </div>
          )}
      </div>
    </div>
  ), [assignmentType, watchTest, watchReviewers, methods, testQuestions, selectedQuestions, questionAssignments, selectedTest, allPersons]);

  return (
    <FormProvider {...methods}>
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">分配测试</h2>

        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
          {currentStep === 1 && renderStep1}
          {currentStep === 2 && renderStep2}
          {currentStep === 3 && renderStep3}
          {currentStep === 4 && renderStep4}

          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <Button type="button" variant="shadow" onClick={handlePreviousStep}>
                上一步
              </Button>
            )}
            {currentStep < 4 && (
              <Button type="button" variant="shadow" onClick={handleNextStep}>
                下一步
              </Button>
            )}
            {currentStep === 4 && (
            <Button type="submit" variant="shadow"> 
              分配
            </Button>
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
};

export default AssignTest;
