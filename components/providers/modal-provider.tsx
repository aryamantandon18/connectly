"use client"

import { useEffect, useState } from "react";
import { CreateServerModal } from "../modals/create-server-modal";
import CreateChannelModal from "../modals/create-channel-modal";

export const ModalProvider = () =>{
    const [isMounted,setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
      }, []);
    
      if (!isMounted) return null;

      return(
        <div className="">
            <CreateServerModal/>
            <CreateChannelModal/>
        </div>
      )

}