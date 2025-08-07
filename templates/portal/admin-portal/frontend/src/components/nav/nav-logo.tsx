import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import Logo from '../../assets/logo.png'

export default function NavLogo() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    className="data-[slot=sidebar-menu-button]:!p-1.5"
                >
                    <a href="#">
                        <img
                            src={Logo}
                            alt="Organization Logo"
                            className="h-8 w-auto"
                        />
                        <span className="text-base font-semibold">Octopus 8</span>
                    </a>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}