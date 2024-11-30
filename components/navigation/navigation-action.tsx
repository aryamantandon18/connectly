"use client"

import { Plus } from "lucide-react"
import { ActionToolTip } from "../action-tooltip"
import { useDispatch } from "react-redux"
import { openModal } from "@/store/slices/modalSlice"

export const NavigationAction = () =>{
    const dispatch = useDispatch();
    return(
        <div>
            <ActionToolTip side="right" align="center" label="Add a server">
            <button className="group" onClick={() => dispatch(openModal({type:"createServer"}))}>
                <div className="flex items-center justify-center mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden bg-background dark:bg-neutral-700 group-hover:bg-emerald-500 ">
                <Plus className="group-hover:text-white transition text-emerald-500" size={25} />
                </div>
            </button>
            </ActionToolTip>
        </div>
    )
}