"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ServerWithMembersWithProfile } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvtar } from "@/components/user-avatar";
import {
  Check,
  Gavel,
  Loader2,
  MoreVertical,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-react";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { MemberRole } from "@prisma/client";
import qs from "query-string";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/store";
import { useDispatch } from "react-redux";
import { closeModal, openModal } from "@/store/slices/modalSlice";
import { Button } from "../ui/button";

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="w-4 h-4 ml-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className="w-4 h-4 ml-2 text-rose-500" />,
};
const MembersModal = () => {
  const router = useRouter();
  const {isOpen, type, data } = useAppSelector(state => state.modal);
  const [loadingId, setLoadingId] = useState<string>("");
  const dispatch = useDispatch();
  const isModalOpen = isOpen && type === "members";
  const { server } = data as { server: ServerWithMembersWithProfile };

  const onClick = async (memberId: string) => {
    try {
      setLoadingId(memberId);

      const url = qs.stringifyUrl({
        url: `/api/members/${memberId}`,
        query: { serverId: server?.id },
      });

      const response = await axios.delete(url);

      router.refresh();
      dispatch(openModal({type:"members",data:{server:response.data}}))
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingId("");
    }
  };

  const onRoleChange = async (memberId: string, role: MemberRole) => {
    try {
      setLoadingId(memberId);
      const url = qs.stringifyUrl({
        url: `/api/members/${memberId}`,
        query: { serverId: server?.id },
      });

      const response = await axios.patch(url, { role });

      router.refresh();
      dispatch(openModal({type:"members",data:{server:response.data}}))
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingId("");
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={() => dispatch(closeModal())}>
  <DialogContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-0 overflow-hidden rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 max-w-md w-full max-h-[80vh]">
    <DialogHeader className="pt-8 px-6">
      <DialogTitle className="text-2xl text-center font-bold">
        Manage Members
      </DialogTitle>
      <DialogDescription className="text-center text-gray-500 dark:text-gray-400">
        {server?.members?.length} Members
      </DialogDescription>
    </DialogHeader>
    <ScrollArea className="mt-8 max-h-[420px] pr-6 pl-6">
      {server?.members?.map((member) => (
        <div key={member.id} className="flex items-center gap-x-2 mb-6">
          <UserAvtar src={member.profile.imageUrl || ""} />
          <div className="flex flex-col gap-y-1">
            <div className="text-xs font-semibold flex items-center gap-x-1 text-gray-900 dark:text-gray-100">
              {member.profile.name}
              {roleIconMap[member.role]}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{member.profile.email}</p>
          </div>
          {server?.profileId !== member.profile.id &&
            loadingId !== member.id && (
              <div className="ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    side="left" 
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  >
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="flex items-center text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <ShieldQuestion className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                        <span>Role</span>
                      </DropdownMenuSubTrigger>

                      <DropdownMenuPortal>
                        <DropdownMenuSubContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                          <DropdownMenuItem
                            onClick={() =>
                              onRoleChange(member?.id, "GUEST")
                            }
                            className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
                          >
                            <Shield className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                            Guest
                            {member.role === "GUEST" && (
                              <Check className="w-4 h-4 ml-auto text-green-600 dark:text-green-400" />
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              onRoleChange(member?.id, "MODERATOR")
                            }
                            className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
                          >
                            <ShieldCheck className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                            Moderator
                            {member.role === "MODERATOR" && (
                              <Check className="w-4 h-4 ml-auto text-green-600 dark:text-green-400" />
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

                    <DropdownMenuItem
                      onClick={() => onClick(member?.id)}
                      className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20"
                    >
                      <Gavel className="w-4 h-4 mr-2" />
                      Kick
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          {loadingId === member.id && (
            <Loader2 className="animate-spin text-gray-500 dark:text-gray-400 ml-auto w-4 h-4" />
          )}
        </div>
      ))}
    </ScrollArea>
    <DialogFooter className="flex justify-end items-center bg-gray-100 dark:bg-gray-800 px-6 py-4">
      <Button
        type="button" 
        variant="ghost" 
        onClick={() => dispatch(closeModal())}
        className="text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        Close
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
  );
};

export default MembersModal;
