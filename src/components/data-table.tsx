"use client";

import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	MouseSensor,
	TouchSensor,
	type UniqueIdentifier,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
	arrayMove,
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	IconChevronDown,
	IconChevronLeft,
	IconChevronRight,
	IconChevronsLeft,
	IconChevronsRight,
	IconCircleCheckFilled,
	IconDotsVertical,
	IconGripVertical,
	IconLayoutColumns,
	IconLoader,
	IconPlus,
	IconProgress,
	IconTimeDuration0,
} from "@tabler/icons-react";
import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type Row,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { useConvexAuth, useMutation } from "convex/react";
import * as React from "react";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const schema = z.object({
	id: z.union([z.number(), z.string(), z.custom<Id<"assignments">>()]),
	assignment: z.string(),
	type: z.string(),
	status: z.string(),
	target: z.number(),
	received: z.number(),
	class: z.string(),
	dueDate: z.number(),
	submittedDate: z.number(),
});

// Create a separate component for the actions dropdown
function ActionsCell({ row }: { row: Row<z.infer<typeof schema>> }) {
	const deleteAssignment = useMutation(api.assignments.remove);
	const [isDeleting, setIsDeleting] = React.useState(false);

	const handleDelete = async () => {
		if (!confirm("Are you sure you want to delete this assignment?")) {
			return;
		}

		setIsDeleting(true);
		try {
			await deleteAssignment({ id: row.original.id as Id<"assignments"> });
			toast.success("Assignment deleted successfully");
		} catch (error) {
			toast.error("Failed to delete assignment");
			console.warn(error);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
					size="icon"
					disabled={isDeleting}
				>
					<IconDotsVertical />
					<span className="sr-only">Open menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-32">
				<DropdownMenuItem
					variant="destructive"
					onClick={handleDelete}
					disabled={isDeleting}
				>
					{isDeleting ? "Deleting..." : "Delete"}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number | string }) {
	const { attributes, listeners } = useSortable({
		id,
	});

	return (
		<Button
			{...attributes}
			{...listeners}
			variant="ghost"
			size="icon"
			className="text-muted-foreground size-7 hover:bg-transparent"
		>
			<IconGripVertical className="text-muted-foreground size-3" />
			<span className="sr-only">Drag to reorder</span>
		</Button>
	);
}

function getColumns(
	updateAssignment: ReturnType<typeof useMutation>,
): ColumnDef<z.infer<typeof schema>>[] {
	return [
		{
			id: "drag",
			header: () => null,
			cell: ({ row }) => <DragHandle id={String(row.original.id)} />,
		},
		{
			id: "select",
			header: ({ table }) => (
				<div className="flex items-center justify-center">
					<Checkbox
						checked={
							table.getIsAllPageRowsSelected() ||
							(table.getIsSomePageRowsSelected() && "indeterminate")
						}
						onCheckedChange={(value) =>
							table.toggleAllPageRowsSelected(!!value)
						}
						aria-label="Select all"
					/>
				</div>
			),
			cell: ({ row }) => (
				<div className="flex items-center justify-center">
					<Checkbox
						checked={row.getIsSelected()}
						onCheckedChange={(value) => row.toggleSelected(!!value)}
						aria-label="Select row"
					/>
				</div>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "assignment",
			header: "Assignment",
			cell: ({ row }) => {
				const [value, setValue] = React.useState(row.original.assignment);
				const [isUpdating, setIsUpdating] = React.useState(false);

				const handleSave = async () => {
					if (value === "" || value === row.original.assignment) return;

					setIsUpdating(true);
					try {
						await updateAssignment({
							id: row.original.id as Id<"assignments">,
							assignment: value,
						});
					} catch (error) {
						console.error("Failed to update assignment name:", error);
						setValue(row.original.assignment);
					} finally {
						setIsUpdating(false);
					}
				};

				return (
					<div className="relative min-w-[200px]">
						<Label
							htmlFor={`${row.original.id}-assignment`}
							className="sr-only"
						>
							Assignment Name
						</Label>
						<Input
							className="border-transparent bg-transparent shadow-none hover:bg-accent/50 focus-visible:bg-background focus-visible:border-ring font-medium"
							value={value}
							onChange={(e) => setValue(e.target.value)}
							onBlur={handleSave}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.currentTarget.blur();
								}
							}}
							id={`${row.original.id}-assignment`}
							disabled={isUpdating}
							placeholder="Assignment name"
						/>
						{isUpdating && (
							<div className="absolute inset-0 flex items-center justify-center bg-background/50">
								<div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
							</div>
						)}
					</div>
				);
			},
			enableHiding: false,
		},
		{
			accessorKey: "type",
			header: "Type",
			cell: ({ row }) => {
				const [value, setValue] = React.useState(row.original.type);
				const [isUpdating, setIsUpdating] = React.useState(false);

				const handleSave = async () => {
					if (value === "" || value === row.original.type) return;

					setIsUpdating(true);
					try {
						await updateAssignment({
							id: row.original.id as Id<"assignments">,
							type: value,
						});
					} catch (error) {
						console.error("Failed to update type:", error);
						setValue(row.original.type);
					} finally {
						setIsUpdating(false);
					}
				};

				return (
					<div className="w-32 relative">
						<Label htmlFor={`${row.original.id}-type`} className="sr-only">
							Type
						</Label>
						<Input
							className="h-6 px-1.5 text-xs border-muted-foreground/20 bg-transparent text-muted-foreground rounded-md shadow-none hover:bg-accent/50 focus-visible:bg-background focus-visible:border-ring"
							value={value}
							onChange={(e) => setValue(e.target.value)}
							onBlur={handleSave}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.currentTarget.blur();
								}
							}}
							id={`${row.original.id}-type`}
							disabled={isUpdating}
						/>
						{isUpdating && (
							<div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-md">
								<div className="h-2 w-2 animate-spin rounded-full border border-primary border-t-transparent" />
							</div>
						)}
					</div>
				);
			},
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => {
				const [selectedStatus, setSelectedStatus] = React.useState(
					row.original.status,
				);
				const [isOpen, setIsOpen] = React.useState(false);

				const handleStatusChange = async (value: string) => {
					setSelectedStatus(value);
					setIsOpen(false);
					try {
						await updateAssignment({
							id: row.original.id as Id<"assignments">,
							status: value,
						});
					} catch (error) {
						console.error("Failed to update status:", error);
						setSelectedStatus(row.original.status);
					}
				};

				return (
					<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
						<DropdownMenuTrigger asChild>
							<Badge
								variant="outline"
								className="text-muted-foreground px-1.5 cursor-pointer hover:bg-accent transition-colors"
							>
								{selectedStatus === "Done" ? (
									<IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
								) : selectedStatus === "In Progress" ? (
									<IconProgress />
								) : (
									<IconTimeDuration0 />
								)}
								{selectedStatus}
							</Badge>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start">
							<DropdownMenuItem
								onClick={() => handleStatusChange("Not Started")}
							>
								<IconLoader className="mr-2 h-4 w-4" />
								Not Started
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => handleStatusChange("In Progress")}
							>
								<IconLoader className="mr-2 h-4 w-4" />
								In Progress
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => handleStatusChange("Done")}>
								<IconCircleCheckFilled className="mr-2 h-4 w-4 fill-green-500 dark:fill-green-400" />
								Done
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
		{
			accessorKey: "target",
			header: "Target Grade",
			cell: ({ row }) => {
				const [value, setValue] = React.useState<number | "">(
					row.original.target,
				);
				const [isUpdating, setIsUpdating] = React.useState(false);

				const handleSave = async () => {
					if (value === "" || Number(value) === row.original.target) return;

					setIsUpdating(true);
					try {
						await updateAssignment({
							id: row.original.id as Id<"assignments">,
							target: Number(value),
						});
					} catch (error) {
						console.error("Failed to update target grade:", error);
						setValue(row.original.target);
					} finally {
						setIsUpdating(false);
					}
				};

				return (
					<div className="relative">
						<Label htmlFor={`${row.original.id}-target`} className="sr-only">
							Target Grade
						</Label>
						<Input
							className="hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30 h-8 w-16 border-transparent bg-transparent text-right shadow-none focus-visible:border dark:bg-transparent"
							value={value}
							onChange={(e) =>
								setValue(e.target.value === "" ? "" : Number(e.target.value))
							}
							onBlur={handleSave}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.currentTarget.blur();
								}
							}}
							id={`${row.original.id}-target`}
							type="number"
							disabled={isUpdating}
						/>
						{isUpdating && (
							<div className="absolute inset-0 flex items-center justify-center bg-background/50">
								<div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
							</div>
						)}
					</div>
				);
			},
		},
		{
			accessorKey: "dueDate",
			header: "Due Date",
			cell: ({ row }) => {
				const dueDate = new Date(Number(row.original.dueDate));
				const submittedDate =
					row.original.submittedDate !== -1
						? new Date(Number(row.original.submittedDate))
						: null;

				const isOverdue = submittedDate ? submittedDate > dueDate : false;

				const [date, setDate] = React.useState<Date>(
					new Date(Number(row.original.dueDate)),
				);
				const [time, setTime] = React.useState(() => {
					const d = new Date(Number(row.original.dueDate));
					return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
				});
				const [isUpdating, setIsUpdating] = React.useState(false);
				const [dialogOpen, setDialogOpen] = React.useState(false);
				const [datePickerOpen, setDatePickerOpen] = React.useState(false);

				const handleSave = async () => {
					if (!date) {
						setDialogOpen(false);
						return;
					}

					setIsUpdating(true);
					try {
						const [hours, minutes] = time.split(":");
						const combinedDate = new Date(date);
						combinedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

						await updateAssignment({
							id: row.original.id as Id<"assignments">,
							dueDate: combinedDate.getTime(),
						});
						setDialogOpen(false);
					} catch (error) {
						console.error("Failed to update due date:", error);
						setDate(new Date(Number(row.original.dueDate)));
						const originalDate = new Date(Number(row.original.dueDate));
						setTime(
							`${String(originalDate.getHours()).padStart(2, "0")}:${String(originalDate.getMinutes()).padStart(2, "0")}`,
						);
					} finally {
						setIsUpdating(false);
					}
				};

				const handleCancel = () => {
					setDate(new Date(Number(row.original.dueDate)));
					const originalDate = new Date(Number(row.original.dueDate));
					setTime(
						`${String(originalDate.getHours()).padStart(2, "0")}:${String(originalDate.getMinutes()).padStart(2, "0")}`,
					);
					setDialogOpen(false);
					setDatePickerOpen(false);
				};

				return (
					<>
						{/* biome-ignore lint/a11y/noStaticElementInteractions: needed for date picker */}
						{/* biome-ignore lint/a11y/useKeyWithClickEvents: a date picker that will appear more than once */}
						<div
							className={cn(
								"text-sm cursor-pointer hover:bg-accent/50 rounded p-1 transition-colors",
								isOverdue && "text-red-600 font-medium",
							)}
							onClick={() => setDialogOpen(true)}
						>
							<div>{dueDate.toLocaleDateString("en-US")}</div>
							<div className="text-xs text-muted-foreground">
								{dueDate.toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</div>
						</div>

						<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
							<DialogContent className="sm:max-w-[425px]">
								<DialogHeader>
									<DialogTitle>Edit Due Date</DialogTitle>
								</DialogHeader>
								<div className="space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="date-picker">Due Date</Label>
											<Popover
												open={datePickerOpen}
												onOpenChange={setDatePickerOpen}
											>
												<PopoverTrigger asChild>
													<Button
														variant="outline"
														className="w-full justify-between font-normal"
													>
														{date
															? date.toLocaleDateString("en-US")
															: "Select date"}
														<IconChevronDown className="h-4 w-4" />
													</Button>
												</PopoverTrigger>
												<PopoverContent
													className="w-auto overflow-hidden p-0"
													align="start"
												>
													<Calendar
														mode="single"
														selected={date}
														captionLayout="dropdown"
														onSelect={(selectedDate) => {
															if (selectedDate) {
																setDate(selectedDate);
																setDatePickerOpen(false);
															}
														}}
													/>
												</PopoverContent>
											</Popover>
										</div>

										<div className="space-y-2">
											<Label htmlFor="time-picker">Due Time</Label>
											<Input
												type="time"
												id="time-picker"
												value={time}
												onChange={(e) => setTime(e.target.value)}
												className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
											/>
										</div>
									</div>
								</div>
								<DialogFooter>
									<Button
										type="button"
										variant="outline"
										onClick={handleCancel}
										disabled={isUpdating}
									>
										Cancel
									</Button>
									<Button onClick={handleSave} disabled={isUpdating}>
										{isUpdating ? "Saving..." : "Save"}
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</>
				);
			},
		},
		{
			accessorKey: "received",
			header: "Received Grade",
			cell: ({ row }) => {
				const [value, setValue] = React.useState<number | "">(
					row.original.received === -1 ? "" : row.original.received,
				);
				const [isUpdating, setIsUpdating] = React.useState(false);

				const handleSave = async () => {
					const newValue = value === "" ? -1 : Number(value);
					if (newValue === row.original.received) return;

					setIsUpdating(true);
					try {
						await updateAssignment({
							id: row.original.id as Id<"assignments">,
							received: newValue,
						});
					} catch (error) {
						console.error("Failed to update received grade:", error);
						setValue(row.original.received === -1 ? "" : row.original.received);
					} finally {
						setIsUpdating(false);
					}
				};

				return (
					<div className="relative">
						<Label htmlFor={`${row.original.id}-received`} className="sr-only">
							Received Grade
						</Label>
						<Input
							className="hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30 h-8 w-16 border-transparent bg-transparent text-right shadow-none focus-visible:border dark:bg-transparent"
							value={value}
							onChange={(e) =>
								setValue(e.target.value === "" ? "" : Number(e.target.value))
							}
							onBlur={handleSave}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.currentTarget.blur();
								}
							}}
							id={`${row.original.id}-received`}
							type="number"
							placeholder="..."
							disabled={isUpdating}
						/>
						{isUpdating && (
							<div className="absolute inset-0 flex items-center justify-center bg-background/50">
								<div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
							</div>
						)}
					</div>
				);
			},
		},
		{
			accessorKey: "class",
			header: "Class",
			cell: ({ row }) => {
				const [value, setValue] = React.useState(row.original.class);
				const [isUpdating, setIsUpdating] = React.useState(false);

				const handleSave = async () => {
					if (value === "" || value === row.original.class) return;

					setIsUpdating(true);
					try {
						await updateAssignment({
							id: row.original.id as Id<"assignments">,
							class: value,
						});
					} catch (error) {
						console.error("Failed to update class:", error);
						setValue(row.original.class);
					} finally {
						setIsUpdating(false);
					}
				};

				return (
					<div className="relative min-w-[120px]">
						<Label htmlFor={`${row.original.id}-class`} className="sr-only">
							Class
						</Label>
						<Input
							className="border-transparent bg-transparent shadow-none hover:bg-accent/50 focus-visible:bg-background focus-visible:border-ring"
							value={value}
							onChange={(e) => setValue(e.target.value)}
							onBlur={handleSave}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.currentTarget.blur();
								}
							}}
							id={`${row.original.id}-class`}
							disabled={isUpdating}
							placeholder="Enter class"
						/>
						{isUpdating && (
							<div className="absolute inset-0 flex items-center justify-center bg-background/50">
								<div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
							</div>
						)}
					</div>
				);
			},
		},
		{
			accessorKey: "submittedDate",
			header: "Submitted",
			cell: ({ row }) => {
				const [date, setDate] = React.useState<Date | null>(
					row.original.submittedDate === -1
						? null
						: new Date(row.original.submittedDate),
				);
				const [time, setTime] = React.useState(() => {
					if (row.original.submittedDate === -1) return "23:59";
					const d = new Date(row.original.submittedDate);
					return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
				});
				const [isUpdating, setIsUpdating] = React.useState(false);
				const [dialogOpen, setDialogOpen] = React.useState(false);
				const [datePickerOpen, setDatePickerOpen] = React.useState(false);

				const handleSave = async () => {
					setIsUpdating(true);
					try {
						let newDate: Date | null = null;

						if (date) {
							const [hours, minutes] = time.split(":");
							newDate = new Date(date);
							newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
						}

						await updateAssignment({
							id: row.original.id as Id<"assignments">,
							submittedDate: newDate ? newDate.getTime() : -1,
						});
						setDialogOpen(false);
					} catch (error) {
						console.error("Failed to update submitted date:", error);
						setDate(
							row.original.submittedDate === -1
								? null
								: new Date(row.original.submittedDate),
						);
						if (row.original.submittedDate !== -1) {
							const originalDate = new Date(row.original.submittedDate);
							setTime(
								`${String(originalDate.getHours()).padStart(2, "0")}:${String(originalDate.getMinutes()).padStart(2, "0")}`,
							);
						}
					} finally {
						setIsUpdating(false);
					}
				};

				const handleCancel = () => {
					setDate(
						row.original.submittedDate === -1
							? null
							: new Date(row.original.submittedDate),
					);
					if (row.original.submittedDate !== -1) {
						const originalDate = new Date(row.original.submittedDate);
						setTime(
							`${String(originalDate.getHours()).padStart(2, "0")}:${String(originalDate.getMinutes()).padStart(2, "0")}`,
						);
					}
					setDialogOpen(false);
					setDatePickerOpen(false);
				};

				const handleClear = async () => {
					setIsUpdating(true);
					try {
						await updateAssignment({
							id: row.original.id as Id<"assignments">,
							submittedDate: -1,
						});
						setDate(null);
						setDialogOpen(false);
					} catch (error) {
						console.error("Failed to clear submitted date:", error);
					} finally {
						setIsUpdating(false);
					}
				};

				if (row.original.submittedDate === -1) {
					return (
						<>
							<button
								type="button"
								className="w-full text-left text-sm text-muted-foreground cursor-pointer hover:bg-accent/50 rounded p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
								onClick={() => setDialogOpen(true)}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										setDialogOpen(true);
									}
								}}
							>
								Not submitted yet
							</button>

							<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
								<DialogContent className="sm:max-w-[425px]">
									<DialogHeader>
										<DialogTitle>Set Submitted Date</DialogTitle>
									</DialogHeader>
									<div className="space-y-4">
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor="submitted-date-picker">
													Submitted Date
												</Label>
												<Popover
													open={datePickerOpen}
													onOpenChange={setDatePickerOpen}
												>
													<PopoverTrigger asChild>
														<Button
															variant="outline"
															className="w-full justify-between font-normal"
														>
															{date
																? date.toLocaleDateString("en-US")
																: "Select date"}
															<IconChevronDown className="h-4 w-4" />
														</Button>
													</PopoverTrigger>
													<PopoverContent
														className="w-auto overflow-hidden p-0"
														align="start"
													>
														<Calendar
															mode="single"
															selected={date || undefined}
															onSelect={(selectedDate) => {
																if (selectedDate) {
																	setDate(selectedDate);
																	setDatePickerOpen(false);
																}
															}}
															captionLayout="dropdown"
														/>
													</PopoverContent>
												</Popover>
											</div>

											<div className="space-y-2">
												<Label htmlFor="submitted-time-picker">Time</Label>
												<Input
													type="time"
													id="submitted-time-picker"
													value={time}
													onChange={(e) => setTime(e.target.value)}
													className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
												/>
											</div>
										</div>
									</div>
									<DialogFooter className="sm:justify-between">
										<Button
											type="button"
											variant="ghost"
											onClick={() => setDialogOpen(false)}
											disabled={isUpdating}
										>
											Cancel
										</Button>
										<div className="space-x-2">
											<Button
												type="button"
												variant="outline"
												onClick={handleClear}
												disabled={isUpdating}
											>
												Clear
											</Button>
											<Button
												onClick={handleSave}
												disabled={isUpdating || !date}
											>
												{isUpdating ? "Saving..." : "Save"}
											</Button>
										</div>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						</>
					);
				}

				const submittedDate = new Date(row.original.submittedDate);
				return (
					<>
						<Button
							variant="ghost"
							className="w-full h-auto p-1 text-left text-sm justify-start font-normal"
							onClick={() => setDialogOpen(true)}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									setDialogOpen(true);
								}
							}}
						>
							<div>{submittedDate.toLocaleDateString("en-US")}</div>
							<div className="text-xs text-muted-foreground">
								{submittedDate.toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</div>
						</Button>

						<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
							<DialogContent className="sm:max-w-[425px]">
								<DialogHeader>
									<DialogTitle>Edit Submitted Date</DialogTitle>
								</DialogHeader>
								<div className="space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="submitted-date-picker">
												Submitted Date
											</Label>
											<Popover
												open={datePickerOpen}
												onOpenChange={setDatePickerOpen}
											>
												<PopoverTrigger asChild>
													<Button
														variant="outline"
														className="w-full justify-between font-normal"
													>
														{date
															? date.toLocaleDateString("en-US")
															: "Select date"}
														<IconChevronDown className="h-4 w-4" />
													</Button>
												</PopoverTrigger>
												<PopoverContent
													className="w-auto overflow-hidden p-0"
													align="start"
												>
													<Calendar
														mode="single"
														selected={date || undefined}
														onSelect={(selectedDate) => {
															if (selectedDate) {
																setDate(selectedDate);
																setDatePickerOpen(false);
															}
														}}
														captionLayout="dropdown"
													/>
												</PopoverContent>
											</Popover>
										</div>

										<div className="space-y-2">
											<Label htmlFor="submitted-time-picker">Time</Label>
											<Input
												type="time"
												id="submitted-time-picker"
												value={time}
												onChange={(e) => setTime(e.target.value)}
												className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
											/>
										</div>
									</div>
								</div>
								<DialogFooter className="sm:justify-between">
									<Button
										type="button"
										variant="ghost"
										onClick={handleCancel}
										disabled={isUpdating}
									>
										Cancel
									</Button>
									<div className="space-x-2">
										<Button
											type="button"
											variant="outline"
											onClick={handleClear}
											disabled={isUpdating}
										>
											Clear
										</Button>
										<Button onClick={handleSave} disabled={isUpdating}>
											{isUpdating ? "Saving..." : "Save"}
										</Button>
									</div>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</>
				);
			},
		},
		{
			id: "actions",
			cell: ({ row }) => <ActionsCell row={row} />,
		},
	];
}

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
	const { transform, transition, setNodeRef, isDragging } = useSortable({
		id: String(row.original.id),
	});

	return (
		<TableRow
			data-state={row.getIsSelected() && "selected"}
			data-dragging={isDragging}
			ref={setNodeRef}
			className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
			style={{
				transform: CSS.Transform.toString(transform),
				transition: transition,
			}}
		>
			{row.getVisibleCells().map((cell) => (
				<TableCell key={cell.id}>
					{flexRender(cell.column.columnDef.cell, cell.getContext())}
				</TableCell>
			))}
		</TableRow>
	);
}

export function DataTable({
	data: initialData,
	setShowAuthModal,
	setShowAddAssignmentDialog,
}: {
	data: z.infer<typeof schema>[];
	setShowAuthModal: (showAuthModal: boolean) => void;
	setShowAddAssignmentDialog: (showAddAssignmentDialog: boolean) => void;
}) {
	const [data, setData] = React.useState(() => initialData);
	const [activeTab, setActiveTab] = React.useState("all");

	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [pagination, setPagination] = React.useState({
		pageIndex: 0,
		pageSize: 10,
	});
	const sortableId = React.useId();
	const sensors = useSensors(
		useSensor(MouseSensor, {}),
		useSensor(TouchSensor, {}),
		useSensor(KeyboardSensor, {}),
	);

	// Filter data based on active tab
	const filteredData = React.useMemo(() => {
		const now = new Date();
		const startOfWeek = new Date(now);
		startOfWeek.setDate(now.getDate() - now.getDay());
		startOfWeek.setHours(0, 0, 0, 0);

		const endOfWeek = new Date(startOfWeek);
		endOfWeek.setDate(startOfWeek.getDate() + 6);
		endOfWeek.setHours(23, 59, 59, 999);

		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const endOfMonth = new Date(
			now.getFullYear(),
			now.getMonth() + 1,
			0,
			23,
			59,
			59,
			999,
		);

		switch (activeTab) {
			case "this-week":
				return data.filter((assignment) => {
					const dueDate = new Date(assignment.dueDate);
					return dueDate >= startOfWeek && dueDate <= endOfWeek;
				});
			case "this-month":
				return data.filter((assignment) => {
					const dueDate = new Date(assignment.dueDate);
					return dueDate >= startOfMonth && dueDate <= endOfMonth;
				});
			case "late":
				return data.filter((assignment) => {
					const dueDate = new Date(assignment.dueDate);
					const currentTime = new Date();
					return (
						dueDate.getTime() < currentTime.getTime() &&
						assignment.submittedDate === -1
					);
				});
			default:
				return data;
		}
	}, [data, activeTab]);

	// Count assignments for badges
	const assignmentCounts = React.useMemo(() => {
		const now = new Date();
		const startOfWeek = new Date(now);
		startOfWeek.setDate(now.getDate() - now.getDay());
		startOfWeek.setHours(0, 0, 0, 0);

		const endOfWeek = new Date(startOfWeek);
		endOfWeek.setDate(startOfWeek.getDate() + 6);
		endOfWeek.setHours(23, 59, 59, 999);

		const thisWeekCount = data.filter((assignment) => {
			const dueDate = new Date(assignment.dueDate);
			return (
				dueDate >= startOfWeek &&
				dueDate <= endOfWeek &&
				assignment.status !== "Done"
			);
		}).length;

		const lateCount = data.filter((assignment) => {
			const dueDate = new Date(assignment.dueDate);
			const currentTime = new Date();
			return (
				dueDate.getTime() < currentTime.getTime() &&
				assignment.submittedDate === -1
			);
		}).length;

		return { thisWeekCount, lateCount };
	}, [data]);

	const dataIds = React.useMemo<UniqueIdentifier[]>(
		() => filteredData?.map(({ id }) => String(id)) || [],
		[filteredData],
	);

	const updateAssignment = useMutation(api.assignments.update);

	const columns = React.useMemo(
		() => getColumns(updateAssignment),
		[updateAssignment],
	);

	const table = useReactTable({
		data: filteredData,
		columns,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
			pagination,
		},
		getRowId: (row) => String(row.id),
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	});
	const { isAuthenticated } = useConvexAuth();

	function handleAddAssignmentClick() {
		if (!isAuthenticated) {
			setShowAuthModal(true);
			return;
		}
		setShowAddAssignmentDialog(true);
	}

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (active && over && active.id !== over.id) {
			setData((data) => {
				const oldIndex = dataIds.indexOf(active.id);
				const newIndex = dataIds.indexOf(over.id);
				return arrayMove(data, oldIndex, newIndex);
			});
		}
	}

	React.useEffect(() => {
		setData(initialData);
	}, [initialData]);

	return (
		<Tabs
			value={activeTab}
			onValueChange={setActiveTab}
			className="w-full flex-col justify-start gap-6"
		>
			<div className="flex items-center justify-between px-4 lg:px-6">
				<Label htmlFor="view-selector" className="sr-only">
					View
				</Label>
				<Select value={activeTab} onValueChange={setActiveTab}>
					<SelectTrigger
						className="flex w-fit @4xl/main:hidden"
						size="sm"
						id="view-selector"
					>
						<SelectValue placeholder="Select a view" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All</SelectItem>
						<SelectItem value="this-week">This Week</SelectItem>
						<SelectItem value="this-month">This Month</SelectItem>
						<SelectItem value="late">Late</SelectItem>
					</SelectContent>
				</Select>
				<TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
					<TabsTrigger value="all">All</TabsTrigger>
					<TabsTrigger value="this-week">
						This Week{" "}
						{assignmentCounts.thisWeekCount > 0 && (
							<Badge variant="secondary">
								{assignmentCounts.thisWeekCount}
							</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger value="this-month">This Month</TabsTrigger>
					<TabsTrigger value="late">
						Late{" "}
						{assignmentCounts.lateCount > 0 && (
							<Badge variant="destructive">{assignmentCounts.lateCount}</Badge>
						)}
					</TabsTrigger>
				</TabsList>
				<div className="flex items-center gap-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm">
								<IconLayoutColumns />
								<span className="hidden lg:inline">Customize Columns</span>
								<span className="lg:hidden">Columns</span>
								<IconChevronDown />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							{table
								.getAllColumns()
								.filter(
									(column) =>
										typeof column.accessorFn !== "undefined" &&
										column.getCanHide(),
								)
								.map((column) => {
									return (
										<DropdownMenuCheckboxItem
											key={column.id}
											className="capitalize"
											checked={column.getIsVisible()}
											onCheckedChange={(value) =>
												column.toggleVisibility(!!value)
											}
										>
											{column.id}
										</DropdownMenuCheckboxItem>
									);
								})}
						</DropdownMenuContent>
					</DropdownMenu>
					<Button
						variant="outline"
						size="sm"
						onClick={handleAddAssignmentClick}
					>
						<IconPlus />
						<span className="hidden lg:inline">Add Assignment</span>
					</Button>
				</div>
			</div>
			<TabsContent
				value={activeTab}
				className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
			>
				<div className="overflow-hidden rounded-lg border">
					<DndContext
						collisionDetection={closestCenter}
						modifiers={[restrictToVerticalAxis]}
						onDragEnd={handleDragEnd}
						sensors={sensors}
						id={sortableId}
					>
						<Table>
							<TableHeader className="bg-muted sticky top-0 z-10">
								{table.getHeaderGroups().map((headerGroup) => (
									<TableRow key={headerGroup.id}>
										{headerGroup.headers.map((header) => {
											return (
												<TableHead key={header.id} colSpan={header.colSpan}>
													{header.isPlaceholder
														? null
														: flexRender(
																header.column.columnDef.header,
																header.getContext(),
															)}
												</TableHead>
											);
										})}
									</TableRow>
								))}
							</TableHeader>
							<TableBody className="**:data-[slot=table-cell]:first:w-8">
								{table.getRowModel().rows?.length ? (
									<SortableContext
										items={dataIds}
										strategy={verticalListSortingStrategy}
									>
										{table.getRowModel().rows.map((row) => (
											<DraggableRow key={row.id} row={row} />
										))}
									</SortableContext>
								) : (
									<TableRow>
										<TableCell
											colSpan={columns.length}
											className="h-24 text-center"
										>
											No results.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</DndContext>
				</div>
				<div className="flex items-center justify-between px-4">
					<div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
						{table.getFilteredSelectedRowModel().rows.length} of{" "}
						{table.getFilteredRowModel().rows.length} row(s) selected.
					</div>
					<div className="flex w-full items-center gap-8 lg:w-fit">
						<div className="hidden items-center gap-2 lg:flex">
							<Label htmlFor="rows-per-page" className="text-sm font-medium">
								Rows per page
							</Label>
							<Select
								value={`${table.getState().pagination.pageSize}`}
								onValueChange={(value) => {
									table.setPageSize(Number(value));
								}}
							>
								<SelectTrigger size="sm" className="w-20" id="rows-per-page">
									<SelectValue
										placeholder={table.getState().pagination.pageSize}
									/>
								</SelectTrigger>
								<SelectContent side="top">
									{[10, 20, 30, 40, 50].map((pageSize) => (
										<SelectItem key={pageSize} value={`${pageSize}`}>
											{pageSize}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex w-fit items-center justify-center text-sm font-medium">
							Page {table.getState().pagination.pageIndex + 1} of{" "}
							{table.getPageCount()}
						</div>
						<div className="ml-auto flex items-center gap-2 lg:ml-0">
							<Button
								variant="outline"
								className="hidden h-8 w-8 p-0 lg:flex"
								onClick={() => table.setPageIndex(0)}
								disabled={!table.getCanPreviousPage()}
							>
								<span className="sr-only">Go to first page</span>
								<IconChevronsLeft />
							</Button>
							<Button
								variant="outline"
								className="size-8"
								size="icon"
								onClick={() => table.previousPage()}
								disabled={!table.getCanPreviousPage()}
							>
								<span className="sr-only">Go to previous page</span>
								<IconChevronLeft />
							</Button>
							<Button
								variant="outline"
								className="size-8"
								size="icon"
								onClick={() => table.nextPage()}
								disabled={!table.getCanNextPage()}
							>
								<span className="sr-only">Go to next page</span>
								<IconChevronRight />
							</Button>
							<Button
								variant="outline"
								className="hidden size-8 lg:flex"
								size="icon"
								onClick={() => table.setPageIndex(table.getPageCount() - 1)}
								disabled={!table.getCanNextPage()}
							>
								<span className="sr-only">Go to last page</span>
								<IconChevronsRight />
							</Button>
						</div>
					</div>
				</div>
			</TabsContent>
		</Tabs>
	);
}
