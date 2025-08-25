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

  const handleModalClose = () => {
    dispatch(closeModal());
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
      <DialogContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-0 overflow-hidden rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 max-w-md w-full">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Delete Message
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500 dark:text-gray-400">
            Are you sure you want to do this? <br />
            This message will be deleted permanently.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 px-6 py-4">
          <Button 
            disabled={isLoading} 
            onClick={handleModalClose} 
            variant="ghost"
            className="text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={onClick} 
            disabled={isLoading}
            className="min-w-24"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </div>
            ) : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteMessageModal;