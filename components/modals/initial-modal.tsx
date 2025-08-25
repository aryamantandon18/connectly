"use client";

import { DialogFooter, DialogHeader } from "@/components/ui/dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@radix-ui/react-dialog";
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
import { toast } from "react-hot-toast";
import { IoCloseCircle } from "react-icons/io5";

const formSchema = z.object({
  name: z.string().min(1, { message: "Server name is required" }),
  imageUrl: z
    .instanceof(File)
    .refine((file) => file.size > 0, { message: "Server image is required" }),
});

export const InitialModal = () => {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: new File([], ""),
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("imageUrl", values.imageUrl);

      const res = await axios.post("/api/servers", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Server created successfully!");
      router.push("/"); // Redirect to home page
    } catch (error) {
      console.error("Line 52 ", error);
      toast.error("Failed to create server. Try again.");
    }
  };

  if (!isMounted) return null;

  return (
<Dialog open>
  <DialogContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-0 overflow-hidden rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 max-w-md w-full">
    <DialogHeader className="pt-8 px-6">
      <DialogTitle className="text-2xl text-center font-bold">
        Create a Server
      </DialogTitle>
      <DialogDescription className="text-center text-gray-500 dark:text-gray-400 mb-5">
        Give your new server a personality with a name and an icon. You can
        always change it later.
      </DialogDescription>
    </DialogHeader>

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6 px-6">
          <div className="flex items-center justify-center text-center">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <div className="flex flex-col items-center justify-center w-full h-48 bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg relative hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                  {preview ? (
                    <>
                      <img
                        src={preview}
                        alt="Selected preview"
                        className="object-cover rounded-lg w-full h-full"
                      />
                      <button
                        className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition p-1"
                        onClick={(e) => {
                          e.preventDefault();
                          field.onChange(null);
                          setPreview(null);
                        }}
                      >
                        <IoCloseCircle className="w-5 h-5 text-red-500"/>
                      </button>
                    </>
                  ) : (
                    <label className="flex flex-col items-center justify-center cursor-pointer text-gray-600 dark:text-gray-400">
                      <FaCloudUploadAlt className="h-10 w-10 mb-3" />
                      <span className="text-sm font-medium">Upload Image</span>
                      <p className="text-xs mt-1">PNG, JPG up to 5MB</p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            field.onChange(file);
                            setPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              )}
            />
          </div>

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
                    className="bg-white dark:bg-gray-800 
                    text-gray-900 dark:text-gray-100 
                    border border-gray-300 dark:border-gray-600 
                    placeholder-gray-500 dark:placeholder-gray-400 
                    focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                    focus:border-transparent transition-colors"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-500 dark:text-red-400 text-xs" />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 px-6 py-4">
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
