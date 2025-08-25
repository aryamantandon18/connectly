"use client"
import { setUser } from "@/store/slices/authSlice";
import { useAppDispatch } from "@/store/store";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";


export default function AuthLoader({children}:{children:React.ReactNode}){
    const {data: session,status} = useSession();
    const dispatch = useAppDispatch();
    
    useEffect(()=>{
        if(status==="authenticated" && session?.user){
            dispatch(setUser({
                id:session.user.id,
                email:session.user.email,
                profile:{
                    name:session.user.name,
                    image:session.user.image,
                }
            }))
        }
    },[status, session, dispatch]);

    return<>{children}</>
}