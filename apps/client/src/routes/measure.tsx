import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Ruler } from "lucide-react";
import { Badge } from "../components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export const Route = createFileRoute("/measure")({
	component: Measure,
});

function Measure() {
	const [inches, setInches] = useState("");
	const [millimeters, setMillimeters] = useState("");

	const mm = inches ? parseFloat(inches) * 25.4 : 0;
	const roundedMm = Math.round(mm);
	const inchesFromMm = millimeters ? parseFloat(millimeters) / 25.4 : 0;
	const roundedInches = Math.round(inchesFromMm * 100) / 100;

	return (
		<div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
			<div className="container mx-auto max-w-md">
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
						<Ruler className="w-8 h-8 text-primary-foreground" />
					</div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
						Unit Converter
					</h1>
					<p className="text-gray-600 dark:text-gray-300">
						Convert inches to millimeters with precision
					</p>
				</div>

				<Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
					<CardHeader className="text-center">
						<CardTitle className="flex items-center justify-center gap-2 text-xl">
							<Ruler className="w-5 h-5" />
							Inches to Millimeters
						</CardTitle>
						<CardDescription>
							Enter a value in inches to see the conversion
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="inches" className="text-sm font-medium">
								Inches
							</Label>
							<Input
								id="inches"
								type="number"
								value={inches}
								onChange={(e) => setInches(e.target.value)}
								placeholder="e.g., 12.5"
								className="text-center text-lg"
								min="0"
								step="0.01"
							/>
						</div>

						{inches && (
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
										Actual Result:
									</span>
									<Badge variant="secondary" className="text-sm px-3 py-1">
										{mm.toFixed(2)} mm
									</Badge>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
										Rounded Result:
									</span>
									<Badge variant="default" className="text-sm px-3 py-1">
										{roundedMm} mm
									</Badge>
								</div>
							</div>
						)}

						<div className="border-t border-gray-200 dark:border-gray-700 my-6" />

						<div className="space-y-2">
							<Label htmlFor="millimeters" className="text-sm font-medium">
								Millimeters
							</Label>
							<Input
								id="millimeters"
								type="number"
								value={millimeters}
								onChange={(e) => setMillimeters(e.target.value)}
								placeholder="e.g., 318.5"
								className="text-center text-lg"
								min="0"
								step="0.01"
							/>
						</div>

						{millimeters && (
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
										Actual Result:
									</span>
									<Badge variant="secondary" className="text-sm px-3 py-1">
										{inchesFromMm.toFixed(4)} in
									</Badge>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
										Rounded Result:
									</span>
									<Badge variant="default" className="text-sm px-3 py-1">
										{roundedInches} in
									</Badge>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
