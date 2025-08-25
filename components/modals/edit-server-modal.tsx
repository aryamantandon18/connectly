"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { IoCloseCircle } from 'react-icons/io5';
import { useAppSelector } from "@/store/store";
import { useDispatch } from "react-redux";
import { closeModal } from "@/store/slices/modalSlice";
import Image from "next/image";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Server Name is required")
    .max(32, "Server Name is too long"),
  imageUrl: z.string().min(1, "Server Image is required"),
});

const EditServerModal = () => {
  const { isOpen, type, data } = useAppSelector(state => state.modal);
  const router = useRouter();
  const dispatch = useDispatch();
  const [preview,setPreview] = useState<string | null>(null);

  const isModalOpen = isOpen && type === "editServer";
  const { server } = data;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
    },
  });

  useEffect(() => {
    if (server) {
      form.setValue("name", server.name);
      form.setValue("imageUrl", server.imageUrl);
    }
    // console.log("Line 66 ",server);
  }, [server, form]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/servers/${server?.id}`, values);
      router.refresh();
      dispatch(closeModal());
    } catch (error) {
      console.log(error);
    }
  };

  const handleModalClose = () => {
    dispatch(closeModal());
    form.reset();
  };

  return (
<Dialog open={isModalOpen} onOpenChange={handleModalClose}>
  <DialogContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-0 overflow-hidden rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 max-w-md w-full">
    <DialogHeader className="pt-8 px-6">
      <DialogTitle className="text-2xl text-center font-bold">
        Customize Your Server
      </DialogTitle>
      <DialogDescription className="text-center text-gray-500 dark:text-gray-400">
        Give your new server a personality with a name and an icon. You can
        always change it later.
      </DialogDescription>
    </DialogHeader>

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6 px-6">
          <div>
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <div>
                  {field.value ? (
                    <div className="relative w-full flex justify-center mt-3">
                      <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <Image
                          src={preview? preview : field.value}
                          alt="Selected preview"
                          className="object-cover w-full h-full"
                          width={400}
                          height={400}
                        />
                        <button
                          className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition p-1"
                          onClick={()=>{
                            field.onChange(null);
                            setPreview(null)
                          }}
                        >
                          <IoCloseCircle className="w-5 h-5 text-red-500"/>
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
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            field.onChange(file); // Set file to form
                            setPreview(URL.createObjectURL(file)); // Set preview
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
            type="button" 
            variant="ghost" 
            onClick={handleModalClose}
            disabled={isLoading}
            className="text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={isLoading}
            className="min-w-24"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : "Save"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  </DialogContent>
</Dialog>
  );
};

export default EditServerModal;
