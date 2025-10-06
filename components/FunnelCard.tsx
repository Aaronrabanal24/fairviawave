"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export type FunnelCounts = {
	view_trust: number;
	precheck_start: number;
	precheck_submit: number;
	tour_request: number;
	application_open: number;
	application_submit: number;
	lease_open: number;
	lease_signed: number;
};

export type ActivityLevel = "low" | "medium" | "high";

const STAGE_LABELS: Record<keyof FunnelCounts, string> = {
	view_trust: "Trust Badge Views",
	precheck_start: "Pre-checks Started",
	precheck_submit: "Pre-checks Submitted",
	tour_request: "Tour Requests",
	application_open: "Applications Opened",
	application_submit: "Applications Submitted",
	lease_open: "Leases Opened",
	lease_signed: "Leases Signed",
};

const LEVEL_CONFIG: Record<ActivityLevel, { color: string; label: string }> = {
	low: { color: "bg-gray-200 text-gray-800", label: "Low Activity" },
	medium: { color: "bg-blue-200 text-blue-800", label: "Medium Activity" },
	high: { color: "bg-green-200 text-green-800", label: "High Activity" },
};

export function FunnelCard({
	counts,
	level,
	lastUpdatedISO,
	isLoading = false,
}: {
	counts?: FunnelCounts;
	level?: ActivityLevel;
	lastUpdatedISO?: string;
	isLoading?: boolean;
}) {
	if (isLoading || !counts || !level || !lastUpdatedISO) {
		return (
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-3/4" />
					<Skeleton className="h-4 w-1/2" />
				</CardHeader>
				<CardContent className="space-y-4">
					{Array.from({ length: 8 }).map((_, i) => (
						<div key={i} className="flex justify-between">
							<Skeleton className="h-4 w-1/3" />
							<Skeleton className="h-4 w-1/4" />
						</div>
					))}
				</CardContent>
			</Card>
		);
	}

	const totalSignals = Object.values(counts).reduce(
		(sum, value) => sum + value,
		0
	);

	return (
		<Card>
			<CardHeader>
				<div className="flex justify-between items-start">
					<div>
						<CardTitle>Conversion Funnel</CardTitle>
						<CardDescription>
							Last updated: {new Date(lastUpdatedISO).toLocaleString()}
						</CardDescription>
					</div>
					<Badge className={LEVEL_CONFIG[level].color}>
						{LEVEL_CONFIG[level].label}
					</Badge>
				</div>
			</CardHeader>
			<CardContent>
				{totalSignals === 0 ? (
					<div className="text-center text-gray-500 py-8">
						No signal data available.
					</div>
				) : (
					<ul className="space-y-2">
						{Object.entries(counts).map(([key, value]) => (
							<li
								key={key}
								className="flex justify-between items-center"
							>
								<span className="text-sm text-gray-600">
									{STAGE_LABELS[key as keyof FunnelCounts]}
								</span>
								<span className="font-semibold">
									{value.toLocaleString()}
								</span>
							</li>
						))}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}