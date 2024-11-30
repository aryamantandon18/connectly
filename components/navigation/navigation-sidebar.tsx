
import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { NavigationAction } from "./navigation-action";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { NavigationItem } from "./navigation-item";
import { ModeToggle } from "../mode-toggle";
import { UserAvatar } from "./UserAvatar";

export const NavigationSidebar = async() =>{
    const profile = currentProfile();
    if(!profile){
        return redirect("/");
    }

    const servers = await db.server.findMany({
        where:{
            members:{some:{profileId: profile.id}} 
        }
    })
     
    return(

        <div className="space-y-4 flex flex-col items-center py-3 h-full text-primary w-full dark:bg-[#1E1F22] bg-[#E3E5E8]">
            <NavigationAction/>
            <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
            <ScrollArea className="flex-1 w-full">
                {
                    servers.map((server)=>(
                        <div key={server.id} className="mb-4">
                            <NavigationItem
                                id={server.id}
                                imageUrl = {server.imageUrl}
                                name = {server.name}
                            />
                        </div>
                    ))
                }
            </ScrollArea>

            <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
                <ModeToggle/>
                <UserAvatar/>
            </div>
        </div>
    )
}