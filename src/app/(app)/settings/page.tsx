"use client";

import { useMutation, useQuery } from "convex/react";
import * as React from "react";
import { toast } from "sonner";
import { z } from "zod";
import { IconPlus, IconTrash, IconEdit } from "@tabler/icons-react";
import { api } from "@/../convex/_generated/api";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const userSchema = z.object({
	name: z.string().min(1, "Name is required"),
});

const itemSchema = z.object({
	name: z.string().min(1, "Name is required"),
});

export default function SettingsPage() {
	const user = useQuery(api.users.viewer);
	const userClasses = useQuery(api.userPreferences.getClasses);
	const userTypes = useQuery(api.userPreferences.getTypes);

	const updateUser = useMutation(api.users.update);
	const addClass = useMutation(api.userPreferences.addClass);
	const updateClass = useMutation(api.userPreferences.updateClass);
	const removeClass = useMutation(api.userPreferences.removeClass);
	const addType = useMutation(api.userPreferences.addType);
	const updateType = useMutation(api.userPreferences.updateType);
	const removeType = useMutation(api.userPreferences.removeType);

	const [userName, setUserName] = React.useState("");
	const [isUpdatingUser, setIsUpdatingUser] = React.useState(false);

	const [classDialogOpen, setClassDialogOpen] = React.useState(false);
	const [typeDialogOpen, setTypeDialogOpen] = React.useState(false);
	const [editingClass, setEditingClass] = React.useState<{
		id: string;
		name: string;
	} | null>(null);
	const [editingType, setEditingType] = React.useState<{
		id: string;
		name: string;
	} | null>(null);
	const [newClassName, setNewClassName] = React.useState("");
	const [newTypeName, setNewTypeName] = React.useState("");

	React.useEffect(() => {
		if (user?.name) {
			setUserName(user.name);
		}
	}, [user]);

	const handleUpdateUser = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!userName.trim()) return;

		setIsUpdatingUser(true);
		try {
			const validatedData = userSchema.parse({ name: userName });
			await updateUser(validatedData);
			toast.success("Profile updated successfully!");
		} catch (error) {
			if (error instanceof z.ZodError) {
				toast.error(error.issues[0]?.message || "Please check your input");
			} else {
				toast.error("Failed to update profile");
			}
		} finally {
			setIsUpdatingUser(false);
		}
	};

	const handleAddClass = async () => {
		if (!newClassName.trim()) return;

		try {
			const validatedData = itemSchema.parse({ name: newClassName });
			await addClass(validatedData);
			toast.success("Class added successfully!");
			setNewClassName("");
			setClassDialogOpen(false);
		} catch (error) {
			if (error instanceof z.ZodError) {
				toast.error(error.issues[0]?.message || "Please check your input");
			} else {
				toast.error("Failed to add class");
			}
		}
	};

	const handleUpdateClass = async () => {
		if (!editingClass || !newClassName.trim()) return;

		try {
			const validatedData = itemSchema.parse({ name: newClassName });
			await updateClass({ id: editingClass.id, ...validatedData });
			toast.success("Class updated successfully!");
			setNewClassName("");
			setEditingClass(null);
			setClassDialogOpen(false);
		} catch (error) {
			if (error instanceof z.ZodError) {
				toast.error(error.issues[0]?.message || "Please check your input");
			} else {
				toast.error("Failed to update class");
			}
		}
	};

	const handleDeleteClass = async (id: string) => {
		if (!confirm("Are you sure you want to delete this class?")) return;

		try {
			await removeClass({ id });
			toast.success("Class deleted successfully!");
		} catch (error) {
			toast.error("Failed to delete class");
			console.warn(error);
		}
	};

	const handleAddType = async () => {
		if (!newTypeName.trim()) return;

		try {
			const validatedData = itemSchema.parse({ name: newTypeName });
			await addType(validatedData);
			toast.success("Type added successfully!");
			setNewTypeName("");
			setTypeDialogOpen(false);
		} catch (error) {
			if (error instanceof z.ZodError) {
				toast.error(error.issues[0]?.message || "Please check your input");
			} else {
				toast.error("Failed to add type");
			}
		}
	};

	const handleUpdateType = async () => {
		if (!editingType || !newTypeName.trim()) return;

		try {
			const validatedData = itemSchema.parse({ name: newTypeName });
			await updateType({ id: editingType.id, ...validatedData });
			toast.success("Type updated successfully!");
			setNewTypeName("");
			setEditingType(null);
			setTypeDialogOpen(false);
		} catch (error) {
			if (error instanceof z.ZodError) {
				toast.error(error.issues[0]?.message || "Please check your input");
			} else {
				toast.error("Failed to update type");
			}
		}
	};

	const handleDeleteType = async (id: string) => {
		if (!confirm("Are you sure you want to delete this type?")) return;

		try {
			await removeType({ id });
			toast.success("Type deleted successfully!");
		} catch (error) {
			toast.error("Failed to delete type");
			console.warn(error);
		}
	};

	const openClassDialog = (classItem?: { id: string; name: string }) => {
		if (classItem) {
			setEditingClass(classItem);
			setNewClassName(classItem.name);
		} else {
			setEditingClass(null);
			setNewClassName("");
		}
		setClassDialogOpen(true);
	};

	const openTypeDialog = (typeItem?: { id: string; name: string }) => {
		if (typeItem) {
			setEditingType(typeItem);
			setNewTypeName(typeItem.name);
		} else {
			setEditingType(null);
			setNewTypeName("");
		}
		setTypeDialogOpen(true);
	};

	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "calc(var(--spacing) * 72)",
					"--header-height": "calc(var(--spacing) * 12)",
				} as React.CSSProperties
			}
		>
			<AppSidebar
				user={{
					name: user?.name ?? "",
					email: user?.email ?? "",
				}}
				variant="inset"
			/>
			<SidebarInset>
				<div className="flex flex-1 flex-col">
					<div className="container mx-auto py-6 space-y-6">
						<div>
							<h1 className="text-3xl font-bold">Settings</h1>
							<p className="text-muted-foreground">
								Manage your profile and customize your assignment preferences.
							</p>
						</div>

						<Separator />

						{/* User Profile Section */}
						<Card>
							<CardHeader>
								<CardTitle>Profile</CardTitle>
								<CardDescription>
									Update your personal information.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleUpdateUser} className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="name">Name</Label>
										<Input
											id="name"
											value={userName}
											onChange={(e) => setUserName(e.target.value)}
											placeholder="Enter your name"
											required
										/>
									</div>
									<Button type="submit" disabled={isUpdatingUser}>
										{isUpdatingUser ? "Updating..." : "Update Profile"}
									</Button>
								</form>
							</CardContent>
						</Card>

						{/* Classes Section */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									Classes
									<Button onClick={() => openClassDialog()} size="sm">
										<IconPlus className="h-4 w-4 mr-2" />
										Add Class
									</Button>
								</CardTitle>
								<CardDescription>
									Manage your class list for quick assignment creation.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex flex-wrap gap-2">
									{userClasses?.map((classItem) => (
										<Badge
											key={classItem._id}
											variant="secondary"
											className="flex items-center gap-2 px-3 py-1"
										>
											{classItem.name}
											<div className="flex gap-1">
												<Button
													size="sm"
													variant="ghost"
													className="h-4 w-4 p-0 hover:bg-transparent"
													onClick={() =>
														openClassDialog({
															id: classItem._id,
															name: classItem.name,
														})
													}
												>
													<IconEdit className="h-3 w-3" />
												</Button>
												<Button
													size="sm"
													variant="ghost"
													className="h-4 w-4 p-0 hover:bg-transparent text-destructive"
													onClick={() => handleDeleteClass(classItem._id)}
												>
													<IconTrash className="h-3 w-3" />
												</Button>
											</div>
										</Badge>
									))}
									{(!userClasses || userClasses.length === 0) && (
										<p className="text-muted-foreground text-sm">
											No classes added yet. Click "Add Class" to get started.
										</p>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Types Section */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									Assignment Types
									<Button onClick={() => openTypeDialog()} size="sm">
										<IconPlus className="h-4 w-4 mr-2" />
										Add Type
									</Button>
								</CardTitle>
								<CardDescription>
									Manage your assignment types for quick assignment creation.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex flex-wrap gap-2">
									{userTypes?.map((typeItem) => (
										<Badge
											key={typeItem._id}
											variant="secondary"
											className="flex items-center gap-2 px-3 py-1"
										>
											{typeItem.name}
											<div className="flex gap-1">
												<Button
													size="sm"
													variant="ghost"
													className="h-4 w-4 p-0 hover:bg-transparent"
													onClick={() =>
														openTypeDialog({
															id: typeItem._id,
															name: typeItem.name,
														})
													}
												>
													<IconEdit className="h-3 w-3" />
												</Button>
												<Button
													size="sm"
													variant="ghost"
													className="h-4 w-4 p-0 hover:bg-transparent text-destructive"
													onClick={() => handleDeleteType(typeItem._id)}
												>
													<IconTrash className="h-3 w-3" />
												</Button>
											</div>
										</Badge>
									))}
									{(!userTypes || userTypes.length === 0) && (
										<p className="text-muted-foreground text-sm">
											No types added yet. Click "Add Type" to get started.
										</p>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Class Dialog */}
						<Dialog open={classDialogOpen} onOpenChange={setClassDialogOpen}>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>
										{editingClass ? "Edit Class" : "Add New Class"}
									</DialogTitle>
									<DialogDescription>
										{editingClass
											? "Update the class name below."
											: "Enter a name for the new class."}
									</DialogDescription>
								</DialogHeader>
								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="className">Class Name</Label>
										<Input
											id="className"
											value={newClassName}
											onChange={(e) => setNewClassName(e.target.value)}
											placeholder="e.g. Calculus, English, AP Physics C: Mechanics"
											required
										/>
									</div>
								</div>
								<DialogFooter>
									<Button
										variant="outline"
										onClick={() => {
											setClassDialogOpen(false);
											setEditingClass(null);
											setNewClassName("");
										}}
									>
										Cancel
									</Button>
									<Button
										onClick={editingClass ? handleUpdateClass : handleAddClass}
									>
										{editingClass ? "Update" : "Add"} Class
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>

						{/* Type Dialog */}
						<Dialog open={typeDialogOpen} onOpenChange={setTypeDialogOpen}>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>
										{editingType ? "Edit Type" : "Add New Type"}
									</DialogTitle>
									<DialogDescription>
										{editingType
											? "Update the type name below."
											: "Enter a name for the new assignment type."}
									</DialogDescription>
								</DialogHeader>
								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="typeName">Type Name</Label>
										<Input
											id="typeName"
											value={newTypeName}
											onChange={(e) => setNewTypeName(e.target.value)}
											placeholder="e.g. Essay, Project, Quiz"
											required
										/>
									</div>
								</div>
								<DialogFooter>
									<Button
										variant="outline"
										onClick={() => {
											setTypeDialogOpen(false);
											setEditingType(null);
											setNewTypeName("");
										}}
									>
										Cancel
									</Button>
									<Button
										onClick={editingType ? handleUpdateType : handleAddType}
									>
										{editingType ? "Update" : "Add"} Type
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
