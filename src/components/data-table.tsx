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
import { Checkbox } from "@/components/ui/checkbox";

import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export const schema = z.object({
	id: z.union([z.number(), z.string(), z.custom<Id<"assignments">>()]),
	assignment: z.string(),
	type: z.string(),
	status: z.string(),
	target: z.number(),
	received: z.number(),
	class: z.string(),
	dueDate: z.string(),
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
				const dueDate = new Date(row.original.dueDate);
				const isOverdue =
					dueDate < new Date() &&
					row.original.status !== "Done" &&
					row.original.received === -1;

				return (
					<div
						className={`text-sm ${isOverdue ? "text-red-600 font-medium" : ""}`}
					>
						<div>{dueDate.toLocaleDateString()}</div>
						<div className="text-xs text-muted-foreground">
							{dueDate.toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit",
							})}
						</div>
					</div>
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
				const [selectedClass, setSelectedClass] = React.useState(
					row.original.class,
				);

				const handleClassChange = async (value: string) => {
					setSelectedClass(value);
					try {
						await updateAssignment({
							id: row.original.id as Id<"assignments">,
							class: value,
						});
					} catch (error) {
						console.error("Failed to update class:", error);
						setSelectedClass(row.original.class);
					}
				};

				const isAssigned = row.original.class !== "Assign class";

				if (isAssigned) {
					return row.original.class;
				}

				return (
					<>
						<Label htmlFor={`${row.original.id}-class`} className="sr-only">
							Class
						</Label>
						<Select value={selectedClass} onValueChange={handleClassChange}>
							<SelectTrigger
								className="w-38 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
								size="sm"
								id={`${row.original.id}-class`}
							>
								<SelectValue placeholder="Assign class" />
							</SelectTrigger>
							<SelectContent align="end">
								<SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
								<SelectItem value="Jamik Tashpulatov">
									Jamik Tashpulatov
								</SelectItem>
								<SelectItem value="Emily Whalen">Emily Whalen</SelectItem>
							</SelectContent>
						</Select>
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

	const dataIds = React.useMemo<UniqueIdentifier[]>(
		() => data?.map(({ id }) => String(id)) || [],
		[data],
	);

	const updateAssignment = useMutation(api.assignments.update);

	const columns = React.useMemo(
		() => getColumns(updateAssignment),
		[updateAssignment],
	);

	const table = useReactTable({
		data,
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
			defaultValue="outline"
			className="w-full flex-col justify-start gap-6"
		>
			<div className="flex items-center justify-between px-4 lg:px-6">
				<Label htmlFor="view-selector" className="sr-only">
					View
				</Label>
				<Select defaultValue="outline">
					<SelectTrigger
						className="flex w-fit @4xl/main:hidden"
						size="sm"
						id="view-selector"
					>
						<SelectValue placeholder="Select a view" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="outline">Outline</SelectItem>
						<SelectItem value="past-performance">Past Performance</SelectItem>
						<SelectItem value="key-personnel">Key Personnel</SelectItem>
						<SelectItem value="focus-documents">Focus Documents</SelectItem>
					</SelectContent>
				</Select>
				<TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
					<TabsTrigger value="outline">Outline</TabsTrigger>
					<TabsTrigger value="past-performance">
						Past Performance <Badge variant="secondary">1</Badge>
					</TabsTrigger>
					<TabsTrigger value="key-personnel">
						Key Personnel <Badge variant="secondary">2</Badge>
					</TabsTrigger>
					<TabsTrigger value="focus-documents">Focus Documents</TabsTrigger>
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
				value="outline"
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
			<TabsContent
				value="past-performance"
				className="flex flex-col px-4 lg:px-6"
			>
				<div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
			</TabsContent>
			<TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
				<div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
			</TabsContent>
			<TabsContent
				value="focus-documents"
				className="flex flex-col px-4 lg:px-6"
			>
				<div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
			</TabsContent>
		</Tabs>
	);
}
