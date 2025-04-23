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
import Image from "next/image";

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
      <DialogContent className="bg-white text-black p-0 overflow-hidden rounded-lg shadow-md absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Customize Your Server
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Give your new server a personality with a name and an icon. You can always change it later.
          </DialogDescription>
          <DialogClose asChild>
            <button className="absolute top-4 right-4 text-gray-500 hover:text-black">
              <X className="h-5 w-5 text-black" />
            </button>
          </DialogClose>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <div>
                    {preview ? (
                      <div className="relative w-[50%] h-[50%] m-auto mt-3">
                        <img
                          src={preview || ""}
                          alt="Selected preview"
                          className="object-cover rounded-lg mx-auto"
                          style={{ width: 272, height: 233 }}
                          />            
                        <button
                          className="absolute -top-2 right-4 bg-white rounded-full shadow-md hover:bg-gray-200 transition"
                          onClick={(e) => {
                            e.preventDefault();
                            field.onChange(new File([], ""));
                            setPreview(null);
                          }}
                        >
                          <IoCloseCircle className="w-6 h-6 text-red-500" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-[60%] h-[120px] md:h-[240px] bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg m-auto mt-5 hover:bg-gray-300 cursor-pointer">
                        <FaCloudUploadAlt className="h-8 w-8 md:h-16 md:w-16 text-gray-600 mb-2 animate-float" />
                        <span className="text-sm hover:underline">Upload Image</span>
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
                  </div>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Server Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a server name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="flex bg-gray-100 px-6 py-4">
              <Button type="submit" variant="primary">Create</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
