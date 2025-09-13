"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";

export const description = "An interactive area chart";

const chartData = [
	{ date: "2024-04-01", total: 222, average: 88 },
	{ date: "2024-04-02", total: 97, average: 97 },
	{ date: "2024-04-03", total: 167, average: 91 },
	{ date: "2024-04-04", total: 242, average: 89 },
	{ date: "2024-04-05", total: 373, average: 93 },
	{ date: "2024-04-06", total: 301, average: 90 },
	{ date: "2024-04-07", total: 245, average: 86 },
	{ date: "2024-04-08", total: 409, average: 94 },
	{ date: "2024-04-09", total: 59, average: 98 },
	{ date: "2024-04-10", total: 261, average: 87 },
	{ date: "2024-04-11", total: 327, average: 92 },
	{ date: "2024-04-12", total: 292, average: 89 },
	{ date: "2024-04-13", total: 342, average: 91 },
	{ date: "2024-04-14", total: 137, average: 90 },
	{ date: "2024-04-15", total: 120, average: 88 },
	{ date: "2024-04-16", total: 138, average: 86 },
	{ date: "2024-04-17", total: 446, average: 95 },
	{ date: "2024-04-18", total: 364, average: 92 },
	{ date: "2024-04-19", total: 243, average: 87 },
	{ date: "2024-04-20", total: 89, average: 89 },
	{ date: "2024-04-21", total: 137, average: 90 },
	{ date: "2024-04-22", total: 224, average: 85 },
	{ date: "2024-04-23", total: 138, average: 88 },
	{ date: "2024-04-24", total: 387, average: 94 },
	{ date: "2024-04-25", total: 215, average: 87 },
	{ date: "2024-04-26", total: 75, average: 95 },
	{ date: "2024-04-27", total: 383, average: 92 },
	{ date: "2024-04-28", total: 122, average: 87 },
	{ date: "2024-04-29", total: 315, average: 91 },
	{ date: "2024-04-30", total: 454, average: 96 },
	{ date: "2024-05-01", total: 165, average: 88 },
	{ date: "2024-05-02", total: 293, average: 90 },
	{ date: "2024-05-03", total: 247, average: 86 },
	{ date: "2024-05-04", total: 385, average: 93 },
	{ date: "2024-05-05", total: 481, average: 97 },
	{ date: "2024-05-06", total: 498, average: 98 },
	{ date: "2024-05-07", total: 388, average: 92 },
	{ date: "2024-05-08", total: 149, average: 89 },
	{ date: "2024-05-09", total: 227, average: 85 },
	{ date: "2024-05-10", total: 293, average: 90 },
	{ date: "2024-05-11", total: 335, average: 91 },
	{ date: "2024-05-12", total: 197, average: 87 },
	{ date: "2024-05-13", total: 197, average: 86 },
	{ date: "2024-05-14", total: 448, average: 95 },
	{ date: "2024-05-15", total: 473, average: 96 },
	{ date: "2024-05-16", total: 338, average: 91 },
	{ date: "2024-05-17", total: 499, average: 98 },
	{ date: "2024-05-18", total: 315, average: 90 },
	{ date: "2024-05-19", total: 235, average: 86 },
	{ date: "2024-05-20", total: 177, average: 88 },
	{ date: "2024-05-21", total: 82, average: 93 },
	{ date: "2024-05-22", total: 81, average: 94 },
	{ date: "2024-05-23", total: 252, average: 88 },
	{ date: "2024-05-24", total: 294, average: 90 },
	{ date: "2024-05-25", total: 201, average: 87 },
	{ date: "2024-05-26", total: 213, average: 85 },
	{ date: "2024-05-27", total: 420, average: 94 },
	{ date: "2024-05-28", total: 233, average: 86 },
	{ date: "2024-05-29", total: 78, average: 95 },
	{ date: "2024-05-30", total: 340, average: 91 },
	{ date: "2024-05-31", total: 178, average: 88 },
	{ date: "2024-06-01", total: 178, average: 89 },
	{ date: "2024-06-02", total: 470, average: 96 },
	{ date: "2024-06-03", total: 103, average: 92 },
	{ date: "2024-06-04", total: 439, average: 95 },
	{ date: "2024-06-05", total: 88, average: 90 },
	{ date: "2024-06-06", total: 294, average: 89 },
	{ date: "2024-06-07", total: 323, average: 91 },
	{ date: "2024-06-08", total: 385, average: 93 },
	{ date: "2024-06-09", total: 438, average: 95 },
	{ date: "2024-06-10", total: 155, average: 88 },
	{ date: "2024-06-11", total: 92, average: 91 },
	{ date: "2024-06-12", total: 492, average: 97 },
	{ date: "2024-06-13", total: 81, average: 92 },
	{ date: "2024-06-14", total: 426, average: 95 },
	{ date: "2024-06-15", total: 307, average: 90 },
	{ date: "2024-06-16", total: 371, average: 92 },
	{ date: "2024-06-17", total: 475, average: 96 },
	{ date: "2024-06-18", total: 107, average: 89 },
	{ date: "2024-06-19", total: 341, average: 91 },
	{ date: "2024-06-20", total: 408, average: 94 },
	{ date: "2024-06-21", total: 169, average: 87 },
	{ date: "2024-06-22", total: 317, average: 90 },
	{ date: "2024-06-23", total: 480, average: 97 },
	{ date: "2024-06-24", total: 132, average: 88 },
	{ date: "2024-06-25", total: 141, average: 89 },
	{ date: "2024-06-26", total: 434, average: 95 },
	{ date: "2024-06-27", total: 448, average: 96 },
	{ date: "2024-06-28", total: 149, average: 88 },
	{ date: "2024-06-29", total: 103, average: 90 },
	{ date: "2024-06-30", total: 446, average: 95 },
];

const chartConfig = {
	total: {
		label: "Received Grade",
		color: "var(--primary)",
	},
	average: {
		label: "Target Grade",
		color: "var(--muted-foreground)",
	},
} satisfies ChartConfig;

export function ChartAreaInteractive() {
	const isMobile = useIsMobile();
	const [timeRange, setTimeRange] = React.useState("90d");
	const { isAuthenticated } = useConvexAuth();
	const assignments = useQuery(api.assignments.list);
	const semesters = useQuery(api.userPreferences.getSemesters);

	React.useEffect(() => {
		if (isMobile) {
			setTimeRange("7d");
		}
	}, [isMobile]);

	const currentSemester = React.useMemo(() => {
		if (!semesters || semesters.length === 0) return null;

		const now = new Date();
		return (
			semesters.find((semester) => {
				const semesterStart = new Date(semester.startDate);
				const semesterEnd = new Date(semester.endDate);
				return now >= semesterStart && now <= semesterEnd;
			}) || null
		);
	}, [semesters]);

	const processedData = React.useMemo(() => {
		if (!isAuthenticated || !assignments) {
			return chartData;
		}

		const gradedAssignments = assignments.filter(
			(assignment) => assignment.received !== -1 && assignment.received > 0,
		);

		if (gradedAssignments.length === 0) {
			return chartData;
		}

		const dateGroups: Record<string, { grades: number[]; targets: number[] }> =
			{};

		gradedAssignments.forEach((assignment) => {
			const date = new Date(assignment.dueDate).toISOString().split("T")[0];
			if (!dateGroups[date]) {
				dateGroups[date] = { grades: [], targets: [] };
			}
			dateGroups[date].grades.push(assignment.received);
			dateGroups[date].targets.push(assignment.target);
		});

		const realData = Object.entries(dateGroups)
			.map(([date, data]) => {
				const avgGrade =
					data.grades.reduce((sum, grade) => sum + grade, 0) /
					data.grades.length;
				const avgTarget =
					data.targets.reduce((sum, target) => sum + target, 0) /
					data.targets.length;

				return {
					date,
					total: Math.round(avgGrade),
					average: Math.round(avgTarget),
				};
			})
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

		return realData.length > 0 ? realData : chartData;
	}, [isAuthenticated, assignments]);

	const filteredData = processedData.filter((item) => {
		const date = new Date(item.date);

		if (timeRange === "semester" && currentSemester) {
			const semesterStart = new Date(currentSemester.startDate);
			const semesterEnd = new Date(currentSemester.endDate);
			return date >= semesterStart && date <= semesterEnd;
		}

		const referenceDate = new Date();
		let daysToSubtract = 90;
		if (timeRange === "30d") {
			daysToSubtract = 30;
		} else if (timeRange === "7d") {
			daysToSubtract = 7;
		}
		const startDate = new Date(referenceDate);
		startDate.setDate(startDate.getDate() - daysToSubtract);
		return date >= startDate;
	});

	return (
		<Card className="@container/card">
			<CardHeader>
				<CardTitle>Assignment Grades</CardTitle>
				<CardDescription>
					<span className="hidden @[540px]/card:block">
						{timeRange === "semester" &&
							currentSemester &&
							(isAuthenticated && assignments && assignments.length > 0
								? `Your grades vs targets for ${currentSemester.name}`
								: `Grades for ${currentSemester.name}`)}
						{timeRange === "90d" &&
							(isAuthenticated && assignments && assignments.length > 0
								? "Your grades vs targets for the last 90 days"
								: "Grades for the last 90 days")}
						{timeRange === "30d" &&
							(isAuthenticated && assignments && assignments.length > 0
								? "Your grades vs targets for the last 30 days"
								: "Grades for the last 30 days")}
						{timeRange === "7d" &&
							(isAuthenticated && assignments && assignments.length > 0
								? "Your grades vs targets for the last 7 days"
								: "Grades for the last 7 days")}
					</span>
					<span className="@[540px]/card:hidden">
						{timeRange === "semester" && currentSemester
							? currentSemester.name
							: isAuthenticated && assignments && assignments.length > 0
								? "Your Grades"
								: "Time Period"}
					</span>
				</CardDescription>
				<CardAction>
					<ToggleGroup
						type="single"
						value={timeRange}
						onValueChange={setTimeRange}
						variant="outline"
						className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
					>
						{currentSemester && (
							<ToggleGroupItem value="semester">
								{currentSemester.name}
							</ToggleGroupItem>
						)}
						<ToggleGroupItem value="90d">Last 90 days</ToggleGroupItem>
						<ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
						<ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
					</ToggleGroup>
					<Select value={timeRange} onValueChange={setTimeRange}>
						<SelectTrigger
							className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
							size="sm"
							aria-label="Select a value"
						>
							<SelectValue placeholder="Marking Period" />
						</SelectTrigger>
						<SelectContent className="rounded-xl">
							{currentSemester && (
								<SelectItem value="semester" className="rounded-lg">
									{currentSemester.name}
								</SelectItem>
							)}
							<SelectItem value="90d" className="rounded-lg">
								Last 90 days
							</SelectItem>
							<SelectItem value="30d" className="rounded-lg">
								Last 30 days
							</SelectItem>
							<SelectItem value="7d" className="rounded-lg">
								Last 7 days
							</SelectItem>
						</SelectContent>
					</Select>
				</CardAction>
			</CardHeader>
			<CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
				<ChartContainer
					config={chartConfig}
					className="aspect-auto h-[250px] w-full"
				>
					<AreaChart data={filteredData}>
						<defs>
							<linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="5%"
									stopColor="var(--color-total)"
									stopOpacity={1.0}
								/>
								<stop
									offset="95%"
									stopColor="var(--color-total)"
									stopOpacity={0.1}
								/>
							</linearGradient>
							<linearGradient id="fillAverage" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="5%"
									stopColor="var(--color-average)"
									stopOpacity={0.8}
								/>
								<stop
									offset="95%"
									stopColor="var(--color-average)"
									stopOpacity={0.1}
								/>
							</linearGradient>
						</defs>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="date"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							minTickGap={32}
							tickFormatter={(value) => {
								const date = new Date(value);
								return date.toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
								});
							}}
						/>
						<ChartTooltip
							cursor={false}
							content={
								<ChartTooltipContent
									labelFormatter={(value) => {
										return new Date(value).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
										});
									}}
									indicator="dot"
								/>
							}
						/>
						<Area
							dataKey="average"
							type="natural"
							fill="url(#fillAverage)"
							stroke="var(--color-average)"
							strokeDasharray="5 5"
							fillOpacity={0.1}
						/>
						<Area
							dataKey="total"
							type="natural"
							fill="url(#fillTotal)"
							stroke="var(--color-total)"
							strokeWidth={2}
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
