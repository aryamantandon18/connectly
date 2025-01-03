import { Channel, ChannelType, Server } from "@prisma/client";
import {createSlice,PayloadAction} from "@reduxjs/toolkit";

export type ModalType =
 | "createServer"
 | "invite"
 | "editServer"
 | "members"
 | "createChannel"
 | "leaveServer"
 | "deleteServer"
 | "deleteChannel"
 | "editChannel"
 | "messageFile"
 | "deleteMessage";

 interface ModalData {
    server?: Server;
    channel?: Channel;
    channelType?: ChannelType;
    apiUrl?: string;
    query?: Record<string, any>;
  }

interface ModalState {
    type: ModalType | null;
    data: ModalData ;
    isOpen: boolean;
  }
  
const initialState: ModalState = {
    type: null,
    data:{},
    isOpen: false,
  };

const modalSlice = createSlice({
    name:"modal",
    initialState,   
    reducers: {
        openModal: (state:ModalState,action:PayloadAction<{ type: ModalType;data?:ModalData }>)=>{
          const { type, data = {} } = action.payload;   // Default `data` to {}
            state.type = type;
            state.isOpen = true;
            state.data = data;
        },
        closeModal: (state:ModalState) => {
            state.type = null;
            state.isOpen = false;
            state.data={};
        }
    }
})

export const {openModal,closeModal} = modalSlice.actions;
export default modalSlice.reducer;