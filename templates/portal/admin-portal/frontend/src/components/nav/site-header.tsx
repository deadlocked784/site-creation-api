import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
export function SiteHeader() {
    const location = useLocation();
    const [title, setTitle] = useState("");

    useEffect(() => {
        // Map routes to titles
        const routeTitles: Record<string, string> = {
            "/": "Dashboard",
            "/contacts": "Contacts",
        };

        let newTitle = routeTitles[location.pathname];

        if (!newTitle) {
            // Extract title from path
            const pathSegments = location.pathname.split("/").filter(Boolean);
            if (pathSegments.length > 0) {
                const basePath = pathSegments[0];
                newTitle = basePath.charAt(0).toUpperCase() + basePath.slice(1).replace(/-/g, " ");
                if (pathSegments.length > 1) {
                    newTitle += " Detail";
                }
            } else {
                newTitle = "Dashboard";
            }
        }

        document.title = `Admin Portal - ${newTitle}`;
        setTitle(newTitle);
    }, [location.pathname]);

    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />
                <h1 className="text-base font-medium">{title}</h1>
            </div>
        </header>
    )
}