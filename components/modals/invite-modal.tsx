"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Check, Copy, RefreshCw } from "lucide-react";
import { useOrigin } from "@/components/use-origin";
import { useState } from "react";
import axios from "axios";
import { useAppSelector } from "@/store/store";
import { useDispatch } from "react-redux";
import { closeModal, openModal } from "@/store/slices/modalSlice";

const InviteModal = () => {
  const {isOpen, type, data } = useAppSelector(state => state.modal);
  const dispatch = useDispatch();
  const origin = useOrigin();

  const isModalOpen = isOpen && type === "invite";
  console.log("Line 28 ",isModalOpen);

  const { server } = data;

  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const inviteUrl = `${origin}/invite/${server?.inviteCode}`;

  const onCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onNew = async () => {
    try {
      setIsLoading(true);
      const response = await axios.patch(             // to refresh the invite code 
        `/api/servers/${server?.id}/invite-code`        
      );

      dispatch(openModal({type:"invite",data:{server:response.data}}))
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={()=>dispatch(closeModal())}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Invite Friends
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <Label className="uppercase text-sm font-bold text-zinc-500 dark:text-secondary/70">
            Server invite link
          </Label>
          <div className="flex items-center mt-2 gap-x-2">
            <Input
              disabled={isLoading}
              className="bg-zinc-300/50 bottom-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
              value={inviteUrl}
              readOnly
            />
            <Button size="icon" onClick={onCopy} disabled={isLoading}>
              {copied ? (<Check className="w-4 h-4" />) : (<Copy className="w-4 h-4" />) }
            </Button>
          </div>
          <Button
            variant="link"
            size="sm"
            className="text-xs text-zinc-500 mt-4"
            disabled={isLoading}
            onClick={onNew}
          >
            Generate a new link
            <RefreshCw className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteModal;
