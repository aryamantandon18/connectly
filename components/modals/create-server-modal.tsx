"use client";

import { DialogFooter, DialogHeader } from "@/components/ui/dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/store";
import { useDispatch } from "react-redux";
import { closeModal } from "@/store/slices/modalSlice";
import { X } from "lucide-react";
import { IoCloseCircle } from "react-icons/io5";
// import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(1, { message: "Server name is required" }),
  imageUrl: z
    .custom<File>((file) => file instanceof File && file.size > 0, {
      message: "Server image is required",
    }),
});

export const CreateServerModal = () => {
  const { isOpen, type } = useAppSelector((state) => state.modal);
  const dispatch = useDispatch();
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => setIsMounted(true), []);

  const isModalOpen = isOpen && type === "createServer";

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", imageUrl: new File([], "") },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("imageUrl", values.imageUrl);
      await axios.post("/api/servers", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.refresh();
      dispatch(closeModal());
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const handleImageChange = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleModalClose = () => {
    dispatch(closeModal());
    form.reset();
    setPreview(null);
  };

  if (!isMounted) return null;

  return (
    <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
      <DialogContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-0 overflow-hidden rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 max-w-md w-full" 
      >
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Customize Your Server
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500 dark:text-gray-400">
            Give your new server a personality with a name and an icon. You can always change it later.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-6 px-6">
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <div>
                    {preview ? (
                      <div className="relative w-full flex justify-center mt-3">
                        <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
                          <img
                            src={preview || ""}
                            alt="Selected preview"
                            className="object-cover w-full h-full"
                          />            
                          <button
                            className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition p-1"
                            onClick={(e) => {
                              e.preventDefault();
                              field.onChange(new File([], ""));
                              setPreview(null);
                            }}
                          >
                            <IoCloseCircle className="w-5 h-5 text-red-500" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-48 bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg m-auto mt-3 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                        <FaCloudUploadAlt className="h-10 w-10 text-gray-500 dark:text-gray-400 mb-3" />
                        <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">Upload Image</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              field.onChange(file);
                              handleImageChange(file);
                            }
                          }}
                        />
                      </label>
                    )}
                    <FormMessage className="text-red-500 dark:text-red-400 text-xs mt-2 text-center" />
                  </div>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">
                      Server Name
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter a server name" 
                        {...field} 
                        disabled={isLoading}
                        className="bg-white dark:bg-gray-800 
                        text-gray-900 dark:text-gray-100 
                        border border-gray-300 dark:border-gray-600 
                        placeholder-gray-500 dark:placeholder-gray-400 
                        focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                        focus:border-transparent transition-colors"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 dark:text-red-400 text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 px-6 py-4">
              <DialogClose asChild>
                <Button 
                  type="button" 
                  variant="ghost" 
                  disabled={isLoading}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button 
                type="submit" 
                variant="primary" 
                disabled={isLoading}
                className="min-w-24"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
