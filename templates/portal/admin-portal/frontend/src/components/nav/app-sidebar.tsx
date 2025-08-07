import { Home, Contact, HandCoins, FileText, BadgeDollarSign, ChevronDown, ChevronRight, Settings } from "lucide-react"
import React, { useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import NavLogo from "./nav-logo"
import { Link } from "react-router-dom"

// Menu items.
const data = {
  user: {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://via.placeholder.com/150"
  },
  navItems: [{
    title: "Dashboard",
    url: "/",
    icon: Home,
  }, {
    title: "Contacts",
    url: "/contacts",
    icon: Contact,
  },
  {
    title: "Contributions",
    url: "/contributions",
    icon: HandCoins,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: FileText,
  },
  {
    title: "IRAS",
    icon: BadgeDollarSign,
    children: [
      {
        title: "Configuration",
        url: "/iras/configuration",
        icon: Settings,
      },
      {
        title: "Online Report",
        url: "/iras/online-reports",
        icon: FileText,
      },
    ]
  }]
}

export function AppSidebar() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const toggleExpand = (title: string) => {
    setExpanded(prev => ({ ...prev, [title]: !prev[title] }))
  }
  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <NavLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {data.navItems.map((item) => (
                <React.Fragment key={item.title}>
                  <SidebarMenuItem className="flex items-center gap-2">
                    <SidebarMenuButton asChild>
                      {item.children ? (
                        <button
                          onClick={() => toggleExpand(item.title)}
                          className="flex items-center gap-2 w-full text-left"
                        >
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                          <span className="ml-auto">
                            {expanded[item.title] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </span>
                        </button>
                      ) : (
                        <Link to={item.url}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Render children if expanded */}
                  {item.children && expanded[item.title] && item.children.map((child) => (
                    <SidebarMenuItem key={child.title} className="pl-8 text-sm flex items-center gap-2">
                      <SidebarMenuButton asChild>
                        <Link to={child.url}>
                          {child.icon && <child.icon size={16} />}
                          <span>{child.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </React.Fragment>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}