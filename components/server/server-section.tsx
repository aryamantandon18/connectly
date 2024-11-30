"use client";

import { ServerWithMembersWithProfile } from "@/types";
import { ChannelType, MemberRole } from "@prisma/client";
import { ActionToolTip } from "../action-tooltip";
import { Plus, Settings } from "lucide-react";
import { openModal } from "@/store/slices/modalSlice";
import { useDispatch } from "react-redux";

interface ServerSectionProps {
  label: string;
  role?: MemberRole;
  sectionType: "channels" | "members";
  channelType?: ChannelType;
  server?: ServerWithMembersWithProfile;
}

export const ServerSection: React.FC<ServerSectionProps> = ({
  label,
  role,
  sectionType,
  channelType,
  server,
}) => {

    const dispatch = useDispatch();
  return (
    <div className="flex items-center justify-between py-2">
      <p className="text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      {role !== MemberRole.GUEST && sectionType === "channels" && (
        <ActionToolTip label="Create Channel" side="top">
          <button
            className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
            onClick={() => dispatch(openModal({type:"createChannel",data:{channelType}}))}
          >
            <Plus className="h-4 w-4" />
          </button>
        </ActionToolTip>
      )}

      {role === MemberRole.ADMIN && sectionType === "members" && (
        <ActionToolTip label="Manage Members" side="top">
          <button
            className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
            onClick={() => dispatch(openModal({type:"members",data:{server}}))}
          >
            <Settings className="h-4 w-4" />
          </button>
        </ActionToolTip>
      )}
    </div>
  );
};
