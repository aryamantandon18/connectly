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
    console.log("Line 66 ",server);
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
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Customize Your Server
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Give your new server a personality with a name and an icon. You can
            always change it later.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <div>
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <div>
                      {field.value ? (
                        <div className="relative w-[50%] h-[50%] m-auto mt-3">
                        <Image
                          src={preview? preview : field.value}
                          alt="Selected preview"
                          className="object-cover rounded-lg "
                        />
                        <button
                          className="absolute -top-2 -right-2 bg-white rounded-full shadow-md hover:bg-gray-200 transition"
                          onClick={()=>{
                            field.onChange(null);
                            setPreview(null)
                          }}
                        >
                          <IoCloseCircle className="w-6 h-6 text-red-500"/>
                        </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center w-[60%] h-[120px] md:h-[240px] bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg m-auto mt-2 mx-auto hover:bg-gray-300 cursor-pointer transition duration-100 delay-75">
                        <label className="flex flex-col items-center justify-center cursor-pointer text-gray-600">
                          <FaCloudUploadAlt className="h-8 w-8 md:h-16 md:w-16 text-gray-600 mb-2 animate-float" />
                          <span className="text-sm hover:underline underline-offset-1">Upload Image</span>
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
                        </div>
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
              <Button variant="primary" className="w-full" >Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditServerModal;
