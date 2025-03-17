import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {Button} from "@heroui/button";
import {UserIcon} from "@/lib/icon";
import {useRouter} from "next/navigation";
import {
  Briefcase, 
  CircleUserRound, 
  House, 
  UsersRound, 
  FileText, 
  ClipboardList, 
  HelpCircle, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Building2,
  Calendar,
  Clock,
  Tag,
  Trash2,
  Edit
} from "lucide-react"
import Link from "next/link";

interface InfoCardProp{
  type: "users"|"positions"|"clubs"|"miniClubs"|"miniTests"|"tests"|"questions",
  name: string,
  description0: string,
  description1?: string,
  content?:{key?: string, value: string[]}[],
}

const iconMap = {
  clubs: <House className="text-emerald-600" />,
  users: <CircleUserRound className="text-blue-600" />,
  positions: <Briefcase className="text-purple-600" />,
  miniClubs: <UsersRound className="text-indigo-600" />,
  miniTests: <ClipboardList className="text-amber-600" />,
  tests: <FileText className="text-rose-600" />,
  questions: <HelpCircle className="text-cyan-600" />
};

const colorMap = {
  clubs: "border-emerald-500 bg-emerald-50",
  users: "border-blue-500 bg-blue-50",
  positions: "border-purple-500 bg-purple-50",
  miniClubs: "border-indigo-500 bg-indigo-50",
  miniTests: "border-amber-500 bg-amber-50",
  tests: "border-rose-500 bg-rose-50",
  questions: "border-cyan-500 bg-cyan-50"
};

const bgColorMap = {
  clubs: "bg-emerald-50",
  users: "bg-blue-50",
  positions: "bg-purple-50",
  miniClubs: "bg-indigo-50",
  miniTests: "bg-amber-50",
  tests: "bg-rose-50",
  questions: "bg-cyan-50"
};

const textColorMap = {
  clubs: "text-emerald-600",
  users: "text-blue-600",
  positions: "text-purple-600",
  miniClubs: "text-indigo-600",
  miniTests: "text-amber-600",
  tests: "text-rose-600",
  questions: "text-cyan-600"
};

const languageMap={
  "clubs": "部门",
  "positions":"岗位",
  "users":"员工",
  "miniClubs":"小组",
  "miniTests":"小测试",
  "tests": "测试",
  "questions":"问题"
}

const InfoCard = ({type, name, description0, description1, content}: InfoCardProp) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Extract creation date (mock data for demonstration)
  const creationDate = new Date().toLocaleDateString('zh-CN');
  const lastUpdated = new Date().toLocaleDateString('zh-CN');
  
  // Count items in content
  const itemCount = content?.reduce((acc, item) => acc + (item.value?.length || 0), 0) || 0;
  
  // Measure content height when content changes or on mount
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [content, expanded]);
  
  const handleDelete = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${type}/delete/name/${name}`, {
        method: "Delete"
      });
      window.location.reload();
    } catch (error) {
      console.error(`Error deleting ${languageMap[type]}:`, error);
      alert(`删除${languageMap[type]}失败，请重试`);
    }
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <Card className="w-full h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 shadow-sm bg-white z-10 relative isolate">
      <div className={`absolute inset-0 pointer-events-none z-0 ${colorMap[type]} opacity-10`}></div>
      <CardHeader className={`pb-3 relative z-10 ${expanded ? 'border-b border-gray-100' : ''}`}>
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-2 rounded-full bg-opacity-20 ${colorMap[type]}`}>
            {iconMap[type]}
          </div>
          <CardTitle className="text-xl">{name}</CardTitle>
        </div>
        
        {description1 && (
          <CardDescription className="text-sm font-medium text-gray-700 flex items-center gap-1">
            {type === 'clubs' && <Building2 size={14} className="text-gray-500" />}
            {type === 'miniClubs' && <UsersRound size={14} className="text-gray-500" />}
            {type === 'positions' && <Briefcase size={14} className="text-gray-500" />}
            {description1}
          </CardDescription>
        )}
        
        <CardDescription className="text-sm text-gray-600 flex items-center gap-1">
          {type === 'clubs' && <UsersRound size={14} className="text-gray-500" />}
          {type === 'miniClubs' && <Building2 size={14} className="text-gray-500" />}
          {type === 'positions' && <CircleUserRound size={14} className="text-gray-500" />}
          {description0}
        </CardDescription>
        
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>创建: {creationDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>更新: {lastUpdated}</span>
          </div>
        </div>
      </CardHeader>

      <div className="relative flex-grow overflow-hidden z-10">
        <div 
          ref={contentRef}
          className="px-6 pb-3 w-full transition-all duration-300 ease-in-out"
          style={{ 
            maxHeight: expanded ? `${contentHeight}px` : '150px',
            overflow: 'hidden'
          }}
        >
          {type === "miniClubs" && (
            <div className="pb-2">
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                <UsersRound size={14} />
                <span>小组员工 ({itemCount}):</span>
              </p>
            </div>
          )}
          
          {type === "positions" && (
            <div className="pb-2">
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                <Briefcase size={14} />
                <span>于此岗位的员工 ({itemCount}):</span>
              </p>
            </div>
          )}
          
          <div className="divide-y divide-gray-100 w-full">
            {content?.map((item, index) => (
              <div
                key={index}
                className="flex items-start py-3 first:pt-0 last:pb-0"
              >
                {(type === "miniClubs" || type === "positions" || type === "users" || type === "questions") && (
                  <div className="w-full">
                    <div className="flex flex-wrap gap-2">
                      {item?.value?.length > 0 ? (
                        item?.value?.map((val, valIndex) => (
                          <div
                            key={valIndex}
                            className="text-sm text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full
                              hover:bg-gray-200 transition-colors duration-200 flex items-center gap-1"
                          >
                            <CircleUserRound size={14} className="text-gray-500" />
                            {val}
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 italic flex items-center gap-1">
                          <AlertCircle size={14} />
                          <span>暂无数据</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {type === "clubs" && (
                  <div className="flex flex-col space-y-3 w-full">
                    <Link 
                      className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"  
                      href={`/admin/update/miniClubs/${item?.key}`}
                    >
                      <UsersRound size={16} />
                      <span className="underline underline-offset-2">{item?.key}</span>
                    </Link>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {item?.value?.length > 0 ? (
                        item?.value.map((val, valIndex) => (
                          <div
                            key={valIndex}
                            className="inline-flex items-center text-sm text-gray-700
                              bg-gray-100 px-3 py-1.5 rounded-full
                              hover:bg-gray-200 transition-colors duration-200"
                          >
                            {val}
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 italic flex items-center gap-1">
                          <AlertCircle size={14} />
                          <span>暂无数据</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(type === "miniTests" || type === "tests") && (
                  <div className="flex flex-col space-y-2 w-full">
                    <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      <FileText size={14} className="text-gray-500" />
                      <span>{item?.key}</span>
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {item?.value?.length > 0 ? (
                        item?.value.map((val, valIndex) => (
                          <div
                            key={valIndex}
                            className="inline-flex items-center text-sm text-gray-700
                              bg-gray-100 px-3 py-1.5 rounded-full
                              hover:bg-gray-200 transition-colors duration-200"
                          >
                            {val}
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 italic flex items-center gap-1">
                          <AlertCircle size={14} />
                          <span>暂无数据</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Add extra padding at the bottom when expanded to avoid content being cut off */}
          <div className="h-4"></div>
        </div>
        
        {/* Gradient overlay when collapsed */}
        {!expanded && itemCount > 3 && (
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none z-20"></div>
        )}
      </div>
      
      {/* Expand/collapse button */}
      {itemCount > 3 && (
        <div className="px-6 py-2 text-center z-20 relative">
          <button 
            onClick={toggleExpand}
            className={`text-sm font-medium flex items-center gap-1 mx-auto ${bgColorMap[type]} ${textColorMap[type]} px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity`}
          >
            {expanded ? (
              <>
                <ChevronUp size={14} />
                <span>收起</span>
              </>
            ) : (
              <>
                <ChevronDown size={14} />
                <span>查看全部 ({itemCount})</span>
              </>
            )}
          </button>
        </div>
      )}
      
      <CardFooter className="border-t border-gray-100 pt-4 pb-4 mt-auto z-10 relative">
        {showDeleteConfirm ? (
          <div className="w-full">
            <p className="text-sm text-gray-700 mb-3 font-medium">确定要删除 "{name}" 吗？此操作不可撤销。</p>
            <div className="flex justify-between gap-2">
              <Button 
                color="default" 
                variant="flat" 
                className="flex-1"
                onPressEnd={() => setShowDeleteConfirm(false)}
              >
                取消
              </Button>
              <Button 
                color="danger" 
                variant="shadow" 
                className="flex-1 bg-red-600 text-white"
                startContent={<Trash2 size={16} />}
                onPressEnd={handleDelete}
              >
                确认删除
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between w-full">
            <Button 
              color="danger" 
              startContent={<Trash2 size={16} />} 
              variant="flat" 
              className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
              onPressEnd={() => setShowDeleteConfirm(true)}
            >
              删除{languageMap[type]}
            </Button>
            
            <Button 
              type="button" 
              variant="shadow" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              startContent={<Edit size={16} />}
              onPressEnd={() => {router.push(`/admin/update/${type}/${name}`)}}
            >
              更新{languageMap[type]}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
};

export default InfoCard;
