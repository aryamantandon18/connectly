"use client";

import { useEffect, useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FaUserEdit, FaCircle, FaSignOutAlt } from "react-icons/fa";
import { MdOutlineDoNotDisturb, MdOutlineOnlinePrediction } from "react-icons/md";
import { IoMdSunny, IoMdMoon } from "react-icons/io";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";
import { signOut, useSession } from "next-auth/react"; 

export const UserAvatar = () => {
  const [userStatus, setUserStatus] = useState("Online");
  const { data: session } = useSession();

  // if (status === "loading") {
  //   return <div>Loading...</div>;
  // }

  // if (status === "unauthenticated") {
  //   return <div>Please sign in</div>;
  // }

  if(!session?.user){
    return null;
  }
  const statusOptions = [
    { label: "Online", icon: MdOutlineOnlinePrediction, color: "text-green-500" },
    { label: "Idle", icon: IoMdSunny, color: "text-yellow-500" },
    { label: "Do Not Disturb", icon: MdOutlineDoNotDisturb, color: "text-red-500" },
    { label: "Invisible", icon: IoMdMoon, color: "text-gray-500" },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="p-0">
          <Avatar className="w-12 h-12">
            {/* <AvatarImage src={session.user.image} alt={session.user.name} /> */}
            <AvatarFallback className="text-lg uppercase">{session?.user?.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4 space-y-4 bg-white dark:bg-zinc-800 rounded-md shadow-lg">
        {/* session.user Info */}
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16">
            {/* <AvatarImage src={session.user.image} alt={session.user.name} /> */}
            <AvatarFallback className="text-lg uppercase ">{session?.user?.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-primary">{session?.user.name}</p>
          </div>
        </div>
        <div>
        <Button variant="outline" className="text-sm flex items-center gap-2">
              <FaUserEdit className="text-gray-500" /> Edit Profile
            </Button>
        </div>

        <Separator />

        {/* Status Options */}
        <div className="space-y-2">
  <p className="text-sm font-medium text-muted-foreground">Set Status</p>
  <Select onValueChange={(value) => setUserStatus(value)}>
    <SelectTrigger className="w-full">
      <SelectValue placeholder={userStatus} />
    </SelectTrigger>
    <SelectContent>
      {statusOptions.map((option) => (
        <SelectItem key={option.label} value={option.label} className="outline-none">
          <div className="flex items-center gap-2">
            <option.icon className={option.color} /> {option.label}
          </div>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

<Separator />

{/* Logout Button */}
<div>
  <Button
    variant="destructive"
    className="w-full flex items-center gap-2 justify-center"
    onClick={() => signOut()}
  >
    <FaSignOutAlt className="text-white" />
    Logout
  </Button>
</div>
      </PopoverContent>
    </Popover>
  );
};
