"use client";

import { DialogFooter, DialogHeader } from "@/components/ui/dialog";
import {
  Dialog,
  DialogClose,
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
import { useAppSelector } from "@/store/store";
import { useDispatch } from "react-redux";
import { closeModal } from "@/store/slices/modalSlice";
import { X } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, { message: "Server name is required" }),
  imageUrl: z
    .instanceof(File)
    .refine((file) => file.size > 0, { message: "Server image is required" }),
});

export const CreateServerModal = () => {
  const { isOpen, type } = useAppSelector((state) => state.modal);
  const dispatch = useDispatch();
  const routes = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isModalOpen = isOpen && type === "createServer";

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

      // console.log("Line 42 ", res);
      routes.refresh();
      dispatch(closeModal());
    } catch (error) {
      console.log("Line 52 ", error);
    }
  };

  const handleModalClose = () => {
    dispatch(closeModal());
    form.reset();
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex items-center justify-center h-[100vh]">
      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="bg-white text-black p-0 overflow-hidden rounded-lg shadow-md relative">
          <DialogHeader className="pt-8 px-6">
            <DialogTitle className="text-2xl text-center font-bold">
              Customize Your Server
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-500">
              Give your new server a personality with a name and an icon. You
              can always change it later.
            </DialogDescription>
            {/* Close Button */}
            <DialogClose asChild>
              <button className="absolute top-4 right-4 text-gray-500 hover:text-black">
                <X className="h-5 w-5 text-black" />
              </button>
            </DialogClose>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-8 px-6">
                <div className="flex items-center justify-center text-center md:mt-5 m-auto">
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <div className="flex flex-col items-center justify-center w-[50%] h-[120px] md:h-[240px] bg-gray-200 border-2 border-dashed border-gray-400 rounded-md">
                        {preview ? (
                          <img
                            src={preview}
                            alt="Selected preview"
                            className="object-cover w-full h-full rounded-md"
                          />
                        ) : (
                          <label className="flex flex-col items-center justify-center cursor-pointer text-gray-600">
                            <FaCloudUploadAlt className="h-8 w-8 md:h-16 md:w-16 text-gray-600 mb-2" />
                            <span className="text-sm">Upload Image</span>
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
                      <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                        Server Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter a server name"
                          className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="flex bg-gray-100 px-6 py-4">
                <Button type="submit" variant="primary">
                  Create
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};