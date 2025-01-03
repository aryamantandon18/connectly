"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import qs from "query-string";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import axios from "axios";
import { useAppSelector } from "@/store/store";
import { useDispatch } from "react-redux";
import { closeModal } from "@/store/slices/modalSlice";

const DeleteMessageModal = () => {
  const { isOpen, type, data } = useAppSelector(state => state.modal);
  const dispatch = useDispatch();

  const isModalOpen = isOpen && type === "deleteMessage";
  const { apiUrl, query } = data;
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);

      const url = qs.stringifyUrl({
        url: apiUrl || "",
        query,
      });

      await axios.delete(url);
      dispatch(closeModal());
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
      dispatch(closeModal());
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={() => dispatch(closeModal())}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Delete Message
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Are you sure you want to do this? <br />
            This message will be deleted permanently.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-gray-100 px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <Button disabled={isLoading} onClick={() => dispatch(closeModal())} variant="ghost">
              Cancle
            </Button>
            <Button variant="primary" onClick={onClick} disabled={isLoading}>
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteMessageModal;
