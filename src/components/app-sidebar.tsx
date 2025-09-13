"use client";

import {
	IconDashboard,
	IconInnerShadowTop,
	IconSettings,
} from "@tabler/icons-react";
import Link from "next/link";
import type * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
	navMain: [
		{
			title: "Dashboard",
			url: "/",
			icon: IconDashboard,
		},
		{
			title: "Settings",
			url: "/settings",
			icon: IconSettings,
		},
	],
	navClouds: [],
	navSecondary: [],
	documents: [],
};

export function AppSidebar({
	user,
	setShowAuthModal,
	...props
}: React.ComponentProps<typeof Sidebar> & {
	user: { name: string; email: string };
	setShowAuthModal?: (show: boolean) => void;
}) {
	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:!p-1.5"
						>
							<Link href="/">
								<IconInnerShadowTop className="!size-5" />
								<span className="text-base font-semibold">Planner</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} setShowAuthModal={setShowAuthModal} />
				{/* <NavDocuments items={data.documents} /> */}
				{/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>
		</Sidebar>
	);
}
