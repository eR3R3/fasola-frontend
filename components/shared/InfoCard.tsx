import React from 'react';
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
import {Briefcase, CircleUserRound, House, UsersRound} from "lucide-react"
import Link from "next/link";

interface InfoCardProp{
  type: "users"|"positions"|"clubs"|"miniClubs",
  name: string,
  description0: string,
  description1?: string,
  content?:{key?: string, value: string[]}[],
}

const iconMap = {
  clubs: <House />,
  users: <CircleUserRound />,
  positions: <Briefcase />,
  miniClubs: <UsersRound />
};

const languageMap={
  "clubs": "部门",
  "positions":"岗位",
  "users":"员工",
  "miniClubs":"小组"
}

const InfoCard = ({type, name, description0, description1, content}: InfoCardProp) => {

  const router = useRouter()

  return (
    <div>
      <Card className="min-w-[500px] max-w-[500px]">
        <CardHeader>
          <CardTitle>{name}</CardTitle>
          <CardDescription>{description1}</CardDescription>
          <CardDescription>{description0}</CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-3 w-full">
          {type==="miniClubs"&&(<div className="pb-4"><p><strong>小组员工:</strong></p></div>)}
          {type==="positions"&&(<div className="pb-4"><p><strong>于此岗位的员工:</strong></p></div>)}
          <div className="divide-y divide-gray-100 w-full">
            {content?.map((item, index) => (
              <div
                key={index}
                className="flex items-start py-3 first:pt-0 last:pb-0"
              >
                {(type==="miniClubs"||type==="positions"||type==="users")&&(
                  <div>
                  <div className="w-2/3 flex flex-wrap gap-2">
                    {item?.value?.map((val, valIndex) => (
                      <div
                        key={valIndex}
                        className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-md
                           hover:bg-gray-100 transition-colors duration-200"
                      >
                        {val}
                      </div>
                    ))}
                  </div>
                </div>)}



                {type === "clubs" && (
                  <div className="flex flex-row items-center space-x-4 w-full overflow-hidden">
                    <Link className="flex-shrink-0 w-1/3 hover:text-blue-600 text-sm font-bold text-gray-700 whitespace-nowrap truncate"  href={`/admin/update/miniClubs/${item?.key}`}>
                      {item?.key}
                    </Link>
                    <div className="flex-1 flex flex-wrap gap-2 min-w-0">
                      {item?.value.map((val, valIndex) => (
                        <div
                          key={valIndex}
                          className="inline-flex items-center text-sm text-gray-600
                     bg-gray-50 px-3 py-1 rounded-md
                     hover:bg-gray-100 transition-colors duration-200
                     whitespace-nowrap flex-shrink-0"
                        >
                          {val}
                        </div>
                      ))}
                    </div>
                  </div>
                )}



              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex justify-between w-full mt-4">
            {/*@ts-ignore*/}
            <Button color="danger" startContent={iconMap[type]} variant="shadow" onPressEnd={async ()=>{
              await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${type}/delete/name/${name}`,{
                method:"Delete"
              })
              window.location.reload()
            }}>删除{languageMap[type]}</Button>
            <Button type="submit" variant="shadow" onPressEnd={()=>{router.push(`/admin/update/${type}/${name}`)}}>更新</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
};

export default InfoCard;
