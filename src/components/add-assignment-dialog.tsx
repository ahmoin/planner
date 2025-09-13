"use client";

import { useMutation } from "convex/react";
import * as React from "react";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const addAssignmentSchema = z.object({
	assignment: z.string().min(1, "Assignment name is required"),
	type: z.string().min(1, "Type is required"),
	status: z.string().min(1, "Status is required"),
	target: z.number().min(0).max(100),
	received: z.number().min(0).max(100),
	class: z.string().min(1, "Class is required"),
});

interface AddAssignmentDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function AddAssignmentDialog({
	open,
	onOpenChange,
}: AddAssignmentDialogProps) {
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const addAssignment = useMutation(api.assignments.add);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSubmitting(true);

		const formData = new FormData(e.currentTarget);
		const data = {
			assignment: formData.get("assignment") as string,
			type: formData.get("type") as string,
			status: formData.get("status") as string,
			target: Number(formData.get("target")),
			received: Number(formData.get("received")),
			class: formData.get("class") as string,
		};

		try {
			const validatedData = addAssignmentSchema.parse(data);

			await addAssignment(validatedData);

			toast.success("Assignment added successfully!");
			onOpenChange(false);

			(e.target as HTMLFormElement).reset();
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
							<Select name="type" required>
								<SelectTrigger>
									<SelectValue placeholder="Select type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Table of Contents">
										Table of Contents
									</SelectItem>
									<SelectItem value="Executive Summary">
										Executive Summary
									</SelectItem>
									<SelectItem value="Technical Approach">
										Technical Approach
									</SelectItem>
									<SelectItem value="Design">Design</SelectItem>
									<SelectItem value="Capabilities">Capabilities</SelectItem>
									<SelectItem value="Focus Documents">
										Focus Documents
									</SelectItem>
									<SelectItem value="Narrative">Narrative</SelectItem>
									<SelectItem value="Assignment">Assignment</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="status">Status</Label>
							<Select name="status" required>
								<SelectTrigger>
									<SelectValue placeholder="Select status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Not Started">Not Started</SelectItem>
									<SelectItem value="In Progress">In Progress</SelectItem>
									<SelectItem value="Done">Done</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
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

						<div className="space-y-2">
							<Label htmlFor="received">Received Grade</Label>
							<Input
								id="received"
								name="received"
								type="number"
								min="0"
								max="100"
								defaultValue="0"
								required
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="class">Class</Label>
						<Select name="class" required>
							<SelectTrigger>
								<SelectValue placeholder="Select class" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
								<SelectItem value="Jamik Tashpulatov">
									Jamik Tashpulatov
								</SelectItem>
								<SelectItem value="Emily Whalen">Emily Whalen</SelectItem>
							</SelectContent>
						</Select>
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
