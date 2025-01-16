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
import { Form, FormField } from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/store";
import { useDispatch } from "react-redux";
import { closeModal } from "@/store/slices/modalSlice";
import { useEffect, useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { FaCloudUploadAlt } from "react-icons/fa";
import { FileIcon } from "lucide-react";
import Image from "next/image";

const formSchema = z.object({
  fileUrl: z.string().min(1, "Attectment is required"),
});

const MessageFileModal = () => {
  const { isOpen, type, data } = useAppSelector(state => state.modal);
  const dispatch = useDispatch();
  const routes = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
      setIsMounted(true);
  }, []);

  const isModalOpen = isOpen && type === "messageFile";
  const { apiUrl, query } = data;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileUrl: "",
    },
  });

  const handleClose = () => {
    form.reset();
    dispatch(closeModal());
  };

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {

      const url = qs.stringifyUrl({
        url: apiUrl || "",
        query,
      });

      await axios.post(url, {
        ...values,
        content: values.fileUrl,
      });
      form.reset();
      routes.refresh();
      handleClose();
    } catch (error) {
      console.log(error);
    }
  };

  if(!isMounted) return null;

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden rounded-lg shadow-md absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Add an Attechment
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Send a file as a message
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <div>
                <FormField
                  control={form.control}
                  name="fileUrl"
                  render={({ field }) => (
                    <div>
                      {preview ? (
                        <div className="relative w-[50%] h-[50%] m-auto mt-3">
                          {preview.startsWith('blob:')?(
                        <>
                         <Image
                         src={preview}
                         alt="Selected preview"
                         className="object-cover rounded-lg w-[272px] h-[233px] mx-auto"
                        />                           
                        <button
                        className="absolute -top-2 right-4 bg-white rounded-full shadow-md hover:bg-gray-200 transition"
                        onClick={()=>{
                          field.onChange(null);
                          setPreview(null);
                        }}
                      >
                        <IoCloseCircle className="w-6 h-6 text-red-500"/>
                      </button>
                      </>
                          ):(
                            <>
                            <div className="flex items-center p-2 mt-2 rounded-md bg-background/10">
                            <FileIcon className="w-16 h-16 fill-indigo-200 stroke-indigo-400 m-auto"/>
                            <a href="#" target="_blank" className="px-3 hover:underline">{preview}</a>
                            </div>
                            <button
                        className="absolute -top-2 -right-2 bg-white rounded-full shadow-md hover:bg-gray-200 transition"
                        onClick={()=>{
                          field.onChange(null);
                          setPreview(null);
                        }}
                      >
                        <IoCloseCircle className="w-6 h-6 text-red-500"/>
                      </button>
                            </>

                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center w-[60%] h-[120px] md:h-[240px] bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg m-auto mt-5 mx-auto hover:bg-gray-300 cursor-pointer transition duration-100 delay-75">
                        <label className="flex flex-col items-center justify-center cursor-pointer text-gray-600">
                          <FaCloudUploadAlt className="h-8 w-8 md:h-16 md:w-16 text-gray-600 mb-2 animate-float" />
                          <span className="text-sm hover:underline underline-offset-1">Upload Image or File</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.txt"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                field.onChange(file); // Set file to form
                                if (file.type.startsWith("image/")) {
                                  // If the file is an image, generate a preview URL
                                  setPreview(URL.createObjectURL(file));
                                } else {
                                  console.log("Line 158 ",field.value);
                                  console.log("Line 159 ",file.name);
                                  setPreview(file.name);
                                }
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
            </div>
            <DialogFooter className="flex bg-gray-100 px-6 py-4">
              <Button variant="primary" disabled={isLoading}>
                Send
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MessageFileModal;
