"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import qs from "query-string";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/store";
import { useDispatch } from "react-redux";
import { closeModal } from "@/store/slices/modalSlice";
import { useEffect, useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { FaCloudUploadAlt, FaFilePdf, FaFileImage, FaFileVideo, FaFileAlt } from "react-icons/fa";
import Image from "next/image";

// ✅ schema: fileUrl will be a File instead of string
const formSchema = z.object({
  fileUrl: z.custom<File>((val) => val instanceof File, {
    message: "Attachment is required",
  }),
  caption: z.string().optional(),
});

type FileType = "image" | "pdf" | "video" | "other";

const MessageFileModal = () => {
  const { isOpen, type, data } = useAppSelector(state => state.modal);
  const dispatch = useDispatch();
  const routes = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<FileType | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isModalOpen = isOpen && type === "messageFile";
  const { apiUrl, query } = data;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileUrl: undefined as unknown as File, 
      caption: "",
    },
  });

  const handleClose = () => {
    form.reset();
    setPreview(null);
    setFileType(null);
    setFileName("");
    dispatch(closeModal());
  };

  const isLoading = form.formState.isSubmitting;

  // ✅ now send FormData instead of JSON
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = qs.stringifyUrl({
        url: apiUrl || "",
        query,
      });

      const formData = new FormData();
      formData.append("file", values.fileUrl); // real File object
      if (values.caption) formData.append("caption", values.caption);

      await axios.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      form.reset();
      routes.refresh();
      handleClose();
    } catch (error) {
      console.log(error);
    }
  };

  const handleFileChange = (file: File, field: any) => {
    field.onChange(file); // store the File object
    setFileName(file.name);

    if (file.type.startsWith("image/")) {
      setFileType("image");
      setPreview(URL.createObjectURL(file));
    } else if (file.type === "application/pdf") {
      setFileType("pdf");
      setPreview(null);
    } else if (file.type.startsWith("video/")) {
      setFileType("video");
      setPreview(URL.createObjectURL(file));
    } else {
      setFileType("other");
      setPreview(null);
    }
  };

  const getFileIcon = () => {
    switch (fileType) {
      case "image":
        return <FaFileImage className="h-10 w-10 text-blue-500" />;
      case "pdf":
        return <FaFilePdf className="h-10 w-10 text-red-500" />;
      case "video":
        return <FaFileVideo className="h-10 w-10 text-purple-500" />;
      default:
        return <FaFileAlt className="h-10 w-10 text-gray-500" />;
    }
  };

  if (!isMounted) return null;

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-0 overflow-hidden rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 max-w-md w-full">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Send a File
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500 dark:text-gray-400">
            Share files with your conversation
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="px-6">
              {/* File Upload Section */}
              <FormField
                control={form.control}
                name="fileUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Select File
                    </FormLabel>
                    {preview || fileType ? (
                      <div className="relative w-full flex justify-center mt-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <div className="flex flex-col items-center">
                          {preview && fileType === "image" ? (
                            <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                              <Image
                                src={preview}
                                alt="Selected preview"
                                className="object-cover w-full h-full"
                                width={400}
                                height={400}
                              />
                            </div>
                          ) : preview && fileType === "video" ? (
                            <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                              <video 
                                src={preview} 
                                className="w-full h-full object-contain"
                                controls
                              />
                            </div>
                          ) : (
                            <div className="flex flex-col items-center p-4">
                              {getFileIcon()}
                              <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-xs">
                                {fileName}
                              </p>
                            </div>
                          )}
                          
                          <button
                            className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition p-1"
                            onClick={() => {
                              field.onChange(undefined);
                              setPreview(null);
                              setFileType(null);
                              setFileName("");
                            }}
                            type="button"
                          >
                            <IoCloseCircle className="w-5 h-5 text-red-500"/>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-48 bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg m-auto mt-3 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                        <FaCloudUploadAlt className="h-10 w-10 text-gray-500 dark:text-gray-400 mb-3" />
                        <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">Upload File</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, GIF, MP4, PDF, DOC up to 10MB</p>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.txt"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              handleFileChange(file, field);
                            }
                          }}
                        />
                      </label>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Caption Input */}
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Caption (optional)
                </label>
                <FormField
                  control={form.control}
                  name="caption"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <textarea
                          placeholder="Add a message to accompany your file..."
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isLoading}
                          rows={3}
                          className="mt-1 flex w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <DialogFooter className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 px-6 py-4">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={handleClose}
                disabled={isLoading}
                className="text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                disabled={isLoading || !form.getValues("fileUrl")}
                className="min-w-24"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </div>
                ) : "Send"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MessageFileModal;
