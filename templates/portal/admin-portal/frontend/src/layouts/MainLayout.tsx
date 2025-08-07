import { AppSidebar } from "@/components/nav/app-sidebar";
import { SiteHeader } from "@/components/nav/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router";
import { Toaster } from "@/components/ui/sonner"

export default function MainLayout() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <main>
                    <SiteHeader />
                    <Outlet />
                </main>
                <Toaster />
            </SidebarInset>
        </SidebarProvider>
    );
}