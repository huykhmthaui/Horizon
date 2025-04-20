import { Menu } from "lucide-react"

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ServerSidebar } from "@/components/server/server-sidebar";
import NavigationSidebar from "@/components/navigation/navigation-sidebar";

export const MobileToggle = ({
    serverId
}: { serverId: string }) => {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 flex gap-0 flex-row">
                <SheetHeader className="sr-only">
                    <SheetTitle>Sidebar</SheetTitle>
                    <SheetDescription>Sidebar Description</SheetDescription>
                </SheetHeader>
                <div className="w-[72px]">
                    <NavigationSidebar />
                </div>
                <ServerSidebar
                    serverId={serverId}
                    mobileMode={true}
                />
            </SheetContent>
        </Sheet>
    )
}