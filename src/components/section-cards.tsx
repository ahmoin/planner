import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { useConvexAuth, useQuery } from "convex/react";
import * as React from "react";
import { api } from "@/../convex/_generated/api";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function SectionCards() {
	const { isAuthenticated } = useConvexAuth();
	const assignments = useQuery(api.assignments.list);

	const stats = React.useMemo(() => {
		if (!isAuthenticated || !assignments || assignments.length === 0) {
			return {
				gpa: "N/A",
				lateAssignments: 0,
				averageGrade: "N/A",
				growthRate: "N/A",
				gpaChange: 0,
				lateChange: 0,
				gradeChange: 0,
				growthChange: 0,
			};
		}

		const gradedAssignments = assignments.filter(
			(assignment) => assignment.received !== -1 && assignment.received > 0,
		);

		if (gradedAssignments.length === 0) {
			return {
				gpa: "N/A",
				lateAssignments: 0,
				averageGrade: "N/A",
				growthRate: "N/A",
				gpaChange: 0,
				lateChange: 0,
				gradeChange: 0,
				growthChange: 0,
			};
		}

		const totalGrade = gradedAssignments.reduce(
			(sum, assignment) => sum + assignment.received,
			0,
		);
		const averageGrade = totalGrade / gradedAssignments.length;

		const gpa = (averageGrade / 100) * 4.0;

		const now = new Date();
		const lateAssignments = assignments.filter((assignment) => {
			const dueDate = new Date(assignment.dueDate);
			return dueDate < now && assignment.submittedDate === -1;
		}).length;

		const sortedAssignments = [...gradedAssignments].sort(
			(a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
		);

		let growthRate = 0;
		if (sortedAssignments.length >= 4) {
			const recentHalf = sortedAssignments.slice(
				-Math.floor(sortedAssignments.length / 2),
			);
			const olderHalf = sortedAssignments.slice(
				0,
				Math.floor(sortedAssignments.length / 2),
			);

			const recentAvg =
				recentHalf.reduce((sum, a) => sum + a.received, 0) / recentHalf.length;
			const olderAvg =
				olderHalf.reduce((sum, a) => sum + a.received, 0) / olderHalf.length;

			growthRate = ((recentAvg - olderAvg) / olderAvg) * 100;
		}

		return {
			gpa: gpa.toFixed(2),
			lateAssignments,
			averageGrade: averageGrade.toFixed(1),
			growthRate: growthRate.toFixed(1),
			gpaChange: growthRate > 0 ? 1 : growthRate < 0 ? -1 : 0,
			lateChange: lateAssignments <= 2 ? -1 : 1,
			gradeChange: averageGrade >= 85 ? 1 : -1,
			growthChange: growthRate >= 0 ? 1 : -1,
		};
	}, [isAuthenticated, assignments]);

	return (
		<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Unweighted GPA</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{stats.gpa}
					</CardTitle>
					<CardAction>
						<Badge variant="outline">
							{stats.gpaChange >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
							{stats.gpaChange >= 0 ? "+" : ""}
							{Math.abs(stats.gpaChange * 12.5).toFixed(1)}%
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						{stats.gpaChange >= 0 ? "Trending up" : "Needs improvement"}
						{stats.gpaChange >= 0 ? (
							<IconTrendingUp className="size-4" />
						) : (
							<IconTrendingDown className="size-4" />
						)}
					</div>
					<div className="text-muted-foreground">
						{isAuthenticated && assignments && assignments.length > 0
							? stats.gpaChange >= 0
								? "Your GPA is performing well"
								: "Focus on upcoming assignments"
							: "Complete assignments to see your GPA"}
					</div>
				</CardFooter>
			</Card>
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Overdue Assignments</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{stats.lateAssignments}
					</CardTitle>
					<CardAction>
						<Badge variant="outline">
							{stats.lateChange <= 0 ? (
								<IconTrendingDown />
							) : (
								<IconTrendingUp />
							)}
							{stats.lateChange <= 0 ? "-" : "+"}
							{Math.abs(stats.lateChange * 20)}%
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						{stats.lateAssignments === 0
							? "All caught up!"
							: `${stats.lateAssignments} assignment${stats.lateAssignments > 1 ? "s" : ""} overdue`}
						{stats.lateChange <= 0 ? (
							<IconTrendingDown className="size-4" />
						) : (
							<IconTrendingUp className="size-4" />
						)}
					</div>
					<div className="text-muted-foreground">
						{stats.lateAssignments === 0
							? "Great time management!"
							: "Focus on completing overdue work"}
					</div>
				</CardFooter>
			</Card>
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Average Assignment Grade</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{stats.averageGrade === "N/A" ? "N/A" : `${stats.averageGrade}%`}
					</CardTitle>
					<CardAction>
						<Badge variant="outline">
							{stats.gradeChange >= 0 ? (
								<IconTrendingUp />
							) : (
								<IconTrendingDown />
							)}
							{stats.gradeChange >= 0 ? "+" : ""}
							{Math.abs(stats.gradeChange * 2.5).toFixed(1)}%
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						{stats.averageGrade === "N/A"
							? "No grades yet"
							: parseFloat(stats.averageGrade) >= 90
								? "Excellent performance"
								: parseFloat(stats.averageGrade) >= 80
									? "Good consistency"
									: "Room for improvement"}
						{stats.gradeChange >= 0 ? (
							<IconTrendingUp className="size-4" />
						) : (
							<IconTrendingDown className="size-4" />
						)}
					</div>
					<div className="text-muted-foreground">
						{stats.averageGrade === "N/A"
							? "Complete assignments to see your average"
							: parseFloat(stats.averageGrade) >= 85
								? "Exceeding expectations"
								: "Work towards your targets"}
					</div>
				</CardFooter>
			</Card>
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Performance Trend</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{stats.growthRate === "N/A" ? "N/A" : `${stats.growthRate}%`}
					</CardTitle>
					<CardAction>
						<Badge variant="outline">
							{stats.growthChange >= 0 ? (
								<IconTrendingUp />
							) : (
								<IconTrendingDown />
							)}
							{stats.growthChange >= 0 ? "+" : ""}
							{stats.growthRate === "N/A" ? "0" : stats.growthRate}%
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						{stats.growthRate === "N/A"
							? "Need more data"
							: parseFloat(stats.growthRate) > 5
								? "Strong improvement"
								: parseFloat(stats.growthRate) > 0
									? "Steady progress"
									: parseFloat(stats.growthRate) === 0
										? "Consistent performance"
										: "Declining trend"}
						{stats.growthChange >= 0 ? (
							<IconTrendingUp className="size-4" />
						) : (
							<IconTrendingDown className="size-4" />
						)}
					</div>
					<div className="text-muted-foreground">
						{stats.growthRate === "N/A"
							? "Complete more assignments to track progress"
							: parseFloat(stats.growthRate) >= 0
								? "Keep up the momentum"
								: "Focus on improvement strategies"}
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
