"use client";

import { useMutation, useQuery } from "convex/react";
import * as React from "react";
import { toast } from "sonner";
import { z } from "zod";
import { IconPlus, IconTrash, IconEdit } from "@tabler/icons-react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
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

const semesterSchema = z.object({
	name: z.string().min(1, "Semester name is required"),
	startDate: z.string().min(1, "Start date is required"),
	endDate: z.string().min(1, "End date is required"),
});

export default function SettingsPage() {
	const user = useQuery(api.users.viewer);
	const userClasses = useQuery(api.userPreferences.getClasses);
	const userTypes = useQuery(api.userPreferences.getTypes);
	const userSemesters = useQuery(api.userPreferences.getSemesters);

	const updateUser = useMutation(api.users.update);
	const addClass = useMutation(api.userPreferences.addClass);
	const updateClass = useMutation(api.userPreferences.updateClass);
	const removeClass = useMutation(api.userPreferences.removeClass);
	const addType = useMutation(api.userPreferences.addType);
	const updateType = useMutation(api.userPreferences.updateType);
	const removeType = useMutation(api.userPreferences.removeType);
	const addSemester = useMutation(api.userPreferences.addSemester);
	const updateSemester = useMutation(api.userPreferences.updateSemester);
	const removeSemester = useMutation(api.userPreferences.removeSemester);

	const [userName, setUserName] = React.useState("");
	const [isUpdatingUser, setIsUpdatingUser] = React.useState(false);

	const [classDialogOpen, setClassDialogOpen] = React.useState(false);
	const [typeDialogOpen, setTypeDialogOpen] = React.useState(false);
	const [semesterDialogOpen, setSemesterDialogOpen] = React.useState(false);
	const [editingClass, setEditingClass] = React.useState<{
		id: string;
		name: string;
	} | null>(null);
	const [editingType, setEditingType] = React.useState<{
		id: string;
		name: string;
	} | null>(null);
	const [editingSemester, setEditingSemester] = React.useState<{
		id: string;
		name: string;
		startDate: string;
		endDate: string;
	} | null>(null);
	const [newClassName, setNewClassName] = React.useState("");
	const [newTypeName, setNewTypeName] = React.useState("");
	const [newSemesterName, setNewSemesterName] = React.useState("");
	const [newSemesterStartDate, setNewSemesterStartDate] = React.useState("");
	const [newSemesterEndDate, setNewSemesterEndDate] = React.useState("");

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

	const handleAddSemester = async () => {
		if (
			!newSemesterName.trim() ||
			!newSemesterStartDate.trim() ||
			!newSemesterEndDate.trim()
		)
			return;

		const startDate = new Date(newSemesterStartDate);
		const endDate = new Date(newSemesterEndDate);
		if (endDate <= startDate) {
			toast.error("End date must be after start date");
			return;
		}

		try {
			const validatedData = semesterSchema.parse({
				name: newSemesterName,
				startDate: newSemesterStartDate,
				endDate: newSemesterEndDate,
			});
			await addSemester(validatedData);
			toast.success("Semester added successfully!");
			setNewSemesterName("");
			setNewSemesterStartDate("");
			setNewSemesterEndDate("");
			setSemesterDialogOpen(false);
		} catch (error) {
			if (error instanceof z.ZodError) {
				toast.error(error.issues[0]?.message || "Please check your input");
			} else {
				toast.error("Failed to add semester");
			}
		}
	};

	const handleUpdateSemester = async () => {
		if (
			!editingSemester ||
			!newSemesterName.trim() ||
			!newSemesterStartDate.trim() ||
			!newSemesterEndDate.trim()
		)
			return;

		const startDate = new Date(newSemesterStartDate);
		const endDate = new Date(newSemesterEndDate);
		if (endDate <= startDate) {
			toast.error("End date must be after start date");
			return;
		}

		try {
			const validatedData = semesterSchema.parse({
				name: newSemesterName,
				startDate: newSemesterStartDate,
				endDate: newSemesterEndDate,
			});
			await updateSemester({
				id: editingSemester.id,
				...validatedData,
			});
			toast.success("Semester updated successfully!");
			setNewSemesterName("");
			setNewSemesterStartDate("");
			setNewSemesterEndDate("");
			setEditingSemester(null);
			setSemesterDialogOpen(false);
		} catch (error) {
			if (error instanceof z.ZodError) {
				toast.error(error.issues[0]?.message || "Please check your input");
			} else {
				toast.error("Failed to update semester");
			}
		}
	};

	const handleDeleteSemester = async (id: string) => {
		if (!confirm("Are you sure you want to delete this semester?")) return;

		try {
			await removeSemester({ id });
			toast.success("Semester deleted successfully!");
		} catch (error) {
			toast.error("Failed to delete semester");
			console.warn(error);
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
			await updateClass({
				id: editingClass.id as Id<"userClasses">,
				...validatedData,
			});
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
			await removeClass({ id: id as Id<"userClasses"> });
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
			await updateType({
				id: editingType.id as Id<"userTypes">,
				...validatedData,
			});
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
			await removeType({ id: id as Id<"userTypes"> });
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

	const openSemesterDialog = (semesterItem?: {
		id: string;
		name: string;
		startDate: string;
		endDate: string;
	}) => {
		if (semesterItem) {
			setEditingSemester(semesterItem);
			setNewSemesterName(semesterItem.name);
			setNewSemesterStartDate(semesterItem.startDate);
			setNewSemesterEndDate(semesterItem.endDate);
		} else {
			setEditingSemester(null);
			setNewSemesterName("");
			setNewSemesterStartDate("");
			setNewSemesterEndDate("");
		}
		setSemesterDialogOpen(true);
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
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									Semesters
									<Button onClick={() => openSemesterDialog()} size="sm">
										<IconPlus className="h-4 w-4 mr-2" />
										Add Semester
									</Button>
								</CardTitle>
								<CardDescription>
									Manage your semesters for better assignment organization and
									tracking.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{userSemesters?.map((semester) => (
										<div
											key={semester.id}
											className="flex items-center justify-between p-3 border rounded-lg"
										>
											<div>
												<div className="font-medium">{semester.name}</div>
												<div className="text-sm text-muted-foreground">
													{new Date(semester.startDate).toLocaleDateString()} -{" "}
													{new Date(semester.endDate).toLocaleDateString()}
												</div>
											</div>
											<div className="flex gap-2">
												<Button
													size="sm"
													variant="ghost"
													className="h-8 w-8 p-0"
													onClick={() =>
														openSemesterDialog({
															id: semester.id,
															name: semester.name,
															startDate: semester.startDate,
															endDate: semester.endDate,
														})
													}
												>
													<IconEdit className="h-4 w-4" />
												</Button>
												<Button
													size="sm"
													variant="ghost"
													className="h-8 w-8 p-0 text-destructive"
													onClick={() => handleDeleteSemester(semester.id)}
												>
													<IconTrash className="h-4 w-4" />
												</Button>
											</div>
										</div>
									))}
									{(!userSemesters || userSemesters.length === 0) && (
										<p className="text-muted-foreground text-sm">
											No semesters added yet. Click "Add Semester" to get
											started.
										</p>
									)}
								</div>
							</CardContent>
						</Card>

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

						<Dialog
							open={semesterDialogOpen}
							onOpenChange={setSemesterDialogOpen}
						>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>
										{editingSemester ? "Edit Semester" : "Add New Semester"}
									</DialogTitle>
									<DialogDescription>
										{editingSemester
											? "Update the semester details below."
											: "Enter details for the new semester."}
									</DialogDescription>
								</DialogHeader>
								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="semesterName">Semester Name</Label>
										<Input
											id="semesterName"
											value={newSemesterName}
											onChange={(e) => setNewSemesterName(e.target.value)}
											placeholder="e.g. Fall 2024, Spring 2025"
											required
										/>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="semesterStartDate">Start Date</Label>
											<Input
												id="semesterStartDate"
												type="date"
												value={newSemesterStartDate}
												onChange={(e) =>
													setNewSemesterStartDate(e.target.value)
												}
												required
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="semesterEndDate">End Date</Label>
											<Input
												id="semesterEndDate"
												type="date"
												value={newSemesterEndDate}
												onChange={(e) => setNewSemesterEndDate(e.target.value)}
												required
											/>
										</div>
									</div>
								</div>
								<DialogFooter>
									<Button
										variant="outline"
										onClick={() => {
											setSemesterDialogOpen(false);
											setEditingSemester(null);
											setNewSemesterName("");
											setNewSemesterStartDate("");
											setNewSemesterEndDate("");
										}}
									>
										Cancel
									</Button>
									<Button
										onClick={
											editingSemester ? handleUpdateSemester : handleAddSemester
										}
									>
										{editingSemester ? "Update" : "Add"} Semester
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
