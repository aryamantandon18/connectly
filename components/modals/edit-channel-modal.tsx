"use client";

import qs from "query-string";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
import { ChannelType } from "@prisma/client";
import { useEffect } from "react";
import { useAppSelector } from "@/store/store";
import { useDispatch } from "react-redux";
import { closeModal } from "@/store/slices/modalSlice";
import { DialogDescription } from "@radix-ui/react-dialog";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Channel Name is required")
    .max(32, "Channel Name is too long")
    .refine((name) => name !== "general", {
      message: "Channel Name cannot be 'general'",
    }),
  type: z.nativeEnum(ChannelType),
});

const EditChannelModal = () => {
  const { isOpen, type, data } = useAppSelector(state => state.modal);
  const dispatch = useDispatch();
  const { channel, server } = data;

  const routes = useRouter();

  const isModalOpen = isOpen && type === "editChannel";

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: channel?.type || ChannelType.TEXT,
    },
  });

  useEffect(() => {
    if (channel) {
      form.setValue("name", channel.name);
      form.setValue("type", channel.type);
    }
  }, [channel, form]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = qs.stringifyUrl({
        url: `/api/channels/${channel?.id}`,
        query: {
          serverId: server?.id,
        },
      });

      await axios.patch(url, values);
      routes.refresh();
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
        Edit Channel
      </DialogTitle>
      <DialogDescription className="text-center text-gray-500 dark:text-gray-400">
        Customize your channel name and type.
      </DialogDescription>
    </DialogHeader>

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6 px-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">
                  Channel Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter a channel name"
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

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">
                  Channel Type
                </FormLabel>
                <Select
                  disabled={isLoading}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-white dark:bg-gray-800 
                      text-gray-900 dark:text-gray-100 
                      border border-gray-300 dark:border-gray-600 
                      focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                      focus:ring-offset-0 focus:border-transparent transition-colors">
                      <SelectValue placeholder="Select a channel type" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                    {Object.values(ChannelType).map((type) => (
                      <SelectItem
                        key={type}
                        value={type}
                        className="capitalize text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
                      >
                        {type.toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

export default EditChannelModal;
