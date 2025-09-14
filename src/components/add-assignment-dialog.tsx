"use client";

import { useMutation, useQuery } from "convex/react";
import { Check, ChevronDownIcon, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
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
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const addAssignmentSchema = z.object({
	assignment: z.string().min(1, "Assignment name is required"),
	type: z.string().min(1, "Type is required"),
	status: z.string().min(1, "Status is required"),
	target: z.number().min(0).max(100),
	class: z.string().min(1, "Class is required"),
	dueDate: z.number().min(0, "Due date and time are required"),
});

interface AddAssignmentDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const statusOptions = [
	{ value: "not-started", label: "Not Started" },
	{ value: "in-progress", label: "In Progress" },
	{ value: "done", label: "Done" },
];

export function AddAssignmentDialog({
	open,
	onOpenChange,
}: AddAssignmentDialogProps) {
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [date, setDate] = React.useState<Date>();
	const [time, setTime] = React.useState("23:59");
	const [datePickerOpen, setDatePickerOpen] = React.useState(false);
	const [typeOpen, setTypeOpen] = React.useState(false);
	const [typeValue, setTypeValue] = React.useState("");
	const [statusOpen, setStatusOpen] = React.useState(false);
	const [statusValue, setStatusValue] = React.useState("In Progress");
	const [classOpen, setClassOpen] = React.useState(false);
	const [classValue, setClassValue] = React.useState("");
	const addAssignment = useMutation(api.assignments.add);

	// Fetch user preferences
	const userClasses = useQuery(api.userPreferences.getClasses);
	const userTypes = useQuery(api.userPreferences.getTypes);

	// Use only user preferences (no defaults)
	const assignmentTypes = React.useMemo(() => {
		return (
			userTypes?.map((type) => ({ value: type._id, label: type.name })) || []
		);
	}, [userTypes]);

	const classOptions = React.useMemo(() => {
		return (
			userClasses?.map((cls) => ({ value: cls._id, label: cls.name })) || []
		);
	}, [userClasses]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSubmitting(true);

		const formData = new FormData(e.currentTarget);

		// Combine date and time into timestamp
		let dueDate = 0;
		if (date && time) {
			const [hours, minutes] = time.split(":");
			const combinedDate = new Date(date);
			combinedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
			dueDate = combinedDate.getTime();
		}

		const data = {
			assignment: formData.get("assignment"),
			type: typeValue,
			status: statusValue,
			target: Number(formData.get("target")),
			class: classValue,
			dueDate: dueDate,
		};

		try {
			const validatedData = addAssignmentSchema.parse(data);

			await addAssignment(validatedData);

			toast.success("Assignment added successfully!");
			onOpenChange(false);

			// Reset form and state
			(e.target as HTMLFormElement).reset();
			setDate(undefined);
			setTime("23:59");
			setTypeValue("");
			setStatusValue("In Progress");
			setClassValue("");
		} catch (error) {
			if (error instanceof z.ZodError) {
				toast.error(error.issues[0]?.message || "Please check your input");
			} else {
				toast.error("Failed to add assignment");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add New Assignment</DialogTitle>
					<DialogDescription>
						Create a new assignment to track your progress.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="assignment">Assignment Name</Label>
						<Input
							id="assignment"
							name="assignment"
							placeholder="Enter assignment name"
							required
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="type">Type</Label>
							<Popover open={typeOpen} onOpenChange={setTypeOpen}>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										role="combobox"
										aria-expanded={typeOpen}
										className="w-full justify-between"
									>
										{typeValue
											? assignmentTypes.find((type) => type.value === typeValue)
													?.label || typeValue
											: "Select or enter type..."}
										<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-full p-0">
									<Command>
										<CommandInput
											placeholder="Search or enter custom type..."
											className="h-9"
											value={typeValue}
											onValueChange={setTypeValue}
											onKeyDown={(e) => {
												if (e.key === "Enter" && typeValue.trim()) {
													e.preventDefault();
													setTypeOpen(false);
												}
											}}
										/>
										<CommandList>
											<CommandEmpty>
												<div className="px-2 py-4 text-center text-sm">
													{typeValue.trim() ? (
														<>Press Enter to use "{typeValue}" as custom type</>
													) : (
														<>
															No types found. Add types in Settings to see
															options here.
														</>
													)}
												</div>
											</CommandEmpty>
											<CommandGroup>
												{assignmentTypes.map((type) => (
													<CommandItem
														key={type.value}
														value={type.value}
														onSelect={(currentValue) => {
															setTypeValue(
																currentValue === typeValue ? "" : type.label,
															);
															setTypeOpen(false);
														}}
													>
														{type.label}
														<Check
															className={cn(
																"ml-auto h-4 w-4",
																typeValue === type.label
																	? "opacity-100"
																	: "opacity-0",
															)}
														/>
													</CommandItem>
												))}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
						</div>

						<div className="space-y-2">
							<Label htmlFor="status">Status</Label>
							<Popover open={statusOpen} onOpenChange={setStatusOpen}>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										role="combobox"
										aria-expanded={statusOpen}
										className="w-full justify-between"
									>
										{statusValue
											? statusOptions.find(
													(status) => status.value === statusValue,
												)?.label || statusValue
											: "Select status..."}
										<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-full p-0">
									<Command>
										<CommandInput
											placeholder="Search status..."
											className="h-9"
										/>
										<CommandList>
											<CommandEmpty>No status found.</CommandEmpty>
											<CommandGroup>
												{statusOptions.map((status) => (
													<CommandItem
														key={status.value}
														value={status.value}
														onSelect={(currentValue) => {
															setStatusValue(
																currentValue === statusValue
																	? ""
																	: status.label,
															);
															setStatusOpen(false);
														}}
													>
														{status.label}
														<Check
															className={cn(
																"ml-auto h-4 w-4",
																statusValue === status.label
																	? "opacity-100"
																	: "opacity-0",
															)}
														/>
													</CommandItem>
												))}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="target">Target Grade</Label>
						<Input
							id="target"
							name="target"
							type="number"
							min="0"
							max="100"
							defaultValue="85"
							required
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="date-picker">Due Date</Label>
							<Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										id="date-picker"
										className="w-full justify-between font-normal"
									>
										{date ? date.toLocaleDateString("en-US") : "Select date"}
										<ChevronDownIcon className="h-4 w-4" />
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
											setDate(selectedDate);
											setDatePickerOpen(false);
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

					<div className="space-y-2">
						<Label htmlFor="class">Class</Label>
						<Popover open={classOpen} onOpenChange={setClassOpen}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={classOpen}
									className="w-full justify-between"
								>
									{classValue
										? classOptions.find((cls) => cls.value === classValue)
												?.label || classValue
										: "Select or enter class..."}
									<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-full p-0">
								<Command>
									<CommandInput
										placeholder="Search or enter custom class..."
										className="h-9"
										value={classValue}
										onValueChange={setClassValue}
										onKeyDown={(e) => {
											if (e.key === "Enter" && classValue.trim()) {
												e.preventDefault();
												setClassOpen(false);
											}
										}}
									/>
									<CommandList>
										<CommandEmpty>
											<div className="px-2 py-4 text-center text-sm">
												{classValue.trim() ? (
													<>Press Enter to use "{classValue}" as custom class</>
												) : (
													<>
														No classes found. Add classes in Settings to see
														options here.
													</>
												)}
											</div>
										</CommandEmpty>
										<CommandGroup>
											{classOptions.map((cls) => (
												<CommandItem
													key={cls.value}
													value={cls.value}
													onSelect={(currentValue) => {
														setClassValue(
															currentValue === classValue ? "" : cls.label,
														);
														setClassOpen(false);
													}}
												>
													{cls.label}
													<Check
														className={cn(
															"ml-auto h-4 w-4",
															classValue === cls.label
																? "opacity-100"
																: "opacity-0",
														)}
													/>
												</CommandItem>
											))}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Adding..." : "Add Assignment"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
