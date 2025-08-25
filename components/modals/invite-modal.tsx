"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  // console.log("Line 28 ",isModalOpen);

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
<Dialog open={isModalOpen} onOpenChange={() => dispatch(closeModal())}>
  <DialogContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-0 overflow-hidden rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 max-w-md w-full">
    <DialogHeader className="pt-8 px-6">
      <DialogTitle className="text-2xl text-center font-bold">
        Invite Friends
      </DialogTitle>
      <DialogDescription className="text-center text-gray-500 dark:text-gray-400">
        Invite friends to your server with a unique link
      </DialogDescription>
    </DialogHeader>
    <div className="p-6">
      <Label className="text-gray-700 dark:text-gray-300 font-medium">
        Server invite link
      </Label>
      <div className="flex items-center mt-2 gap-x-2">
        <Input
          disabled={isLoading}
          className="bg-white dark:bg-gray-800 
          text-gray-900 dark:text-gray-100 
          border border-gray-300 dark:border-gray-600 
          focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
          focus:border-transparent transition-colors"
          value={inviteUrl}
          readOnly
        />
        <Button 
          size="icon" 
          onClick={onCopy} 
          disabled={isLoading}
          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          )}
        </Button>
      </div>
      <Button
        variant="link"
        size="sm"
        className="text-xs text-gray-500 dark:text-gray-400 mt-4 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        disabled={isLoading}
        onClick={onNew}
      >
        Generate a new link
        <RefreshCw className="w-4 h-4 ml-1" />
      </Button>
    </div>
    <DialogFooter className="flex justify-end items-center bg-gray-100 dark:bg-gray-800 px-6 py-4">
      <Button 
        type="button" 
        variant="ghost" 
        onClick={() => dispatch(closeModal())}
        disabled={isLoading}
        className="text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        Close
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
  );
};

export default InviteModal;
