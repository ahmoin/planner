"use client";

import { type Icon, IconCirclePlusFilled } from "@tabler/icons-react";
import { useConvexAuth, useMutation } from "convex/react";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/../convex/_generated/api";

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
	items,
	setShowAuthModal,
}: {
	items: {
		title: string;
		url: string;
		icon?: Icon;
	}[];
	setShowAuthModal?: (show: boolean) => void;
}) {
	const { isAuthenticated } = useConvexAuth();
	const addAssignment = useMutation(api.assignments.add);

	const handleQuickCreate = async () => {
		if (!isAuthenticated) {
			if (setShowAuthModal) {
				setShowAuthModal(true);
			}
			return;
		}

		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		tomorrow.setHours(23, 59, 0, 0);

		const defaultAssignment = {
			assignment: "Unnamed",
			type: "Undefined",
			status: "In Progress",
			target: 85,
			class: "Undefined",
			dueDate: tomorrow.getTime(),
		};

		try {
			await addAssignment(defaultAssignment);
			toast.success("Quick assignment created!");
		} catch (error) {
			toast.error("Failed to create assignment");
			console.error("Quick create error:", error);
		}
	};

	return (
		<SidebarGroup>
			<SidebarGroupContent className="flex flex-col gap-2">
				<SidebarMenu>
					<SidebarMenuItem className="flex items-center gap-2">
						<SidebarMenuButton
							tooltip="Quick Create"
							className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
							onClick={handleQuickCreate}
						>
							<IconCirclePlusFilled />
							<span>Quick Create</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton tooltip={item.title} asChild>
								<Link href={item.url}>
									{item.icon && <item.icon />}
									<span>{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
