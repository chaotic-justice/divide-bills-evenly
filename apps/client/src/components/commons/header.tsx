// src/components/Header.tsx
import { Link } from "@tanstack/react-router";
import { SquareMenuIcon, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from "../ui/button";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const links = [
			{ to: "/", label: "Home" },
			{ to: "/measure", label: "Measure" },
			{ to: "/version2", label: "version 2" },
		];

  return (
			<header className="px-4 py-10 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<nav className="relative z-50 flex items-center justify-between">
					{/* Left section */}
					<div className="flex items-center flex-1 md:gap-x-12">
						<Link
							to="/"
							className="flex items-center space-x-1"
							activeProps={{
								className: "font-bold",
							}}
							activeOptions={{ exact: true }}
							aria-label="Landing Page Boilerplate"
							title="Landing Page Boilerplate"
						>
							<img
								alt="Logo"
								src="/vite.svg"
								className="w-8 h-8"
								width={32}
								height={32}
							/>
							<span className="hidden text-gray-950 dark:text-gray-300 md:block">
								Coins Counter
							</span>
						</Link>
					</div>

					{/* Center section - Navigation */}
					<ul className="items-center justify-center flex-1 hidden gap-6 md:flex">
						{links.map((link) => (
							<li key={link.label}>
								<Link
									to={link.to}
									aria-label={link.label}
									title={link.label}
									className="tracking-wide transition-colors duration-200"
									activeProps={{
										className: "font-bold",
									}}
								>
									{link.label}
								</Link>
							</li>
						))}
					</ul>

					{/* Right section */}
					<div className="items-center justify-end flex-1 hidden md:flex gap-x-6">
						{/* <HeaderLinks /> */}
						{/* <ThemedButton /> */}
					</div>

					{/* Mobile menu Button */}
					<div className="md:hidden">
						<Button
							aria-label="Open Menu"
							title="Open Menu"
							className="p-2 -mr-1 transition duration-200 rounded focus:outline-none focus:shadow-outline hover:bg-deep-purple-50 focus:bg-deep-purple-50"
							onClick={() => setIsMenuOpen(true)}
						>
							<SquareMenuIcon />
						</Button>
						{isMenuOpen && (
							<div className="absolute top-0 left-0 z-50 w-full">
								<div className="p-5 border rounded shadow-sm bg-background">
									<div className="flex items-center justify-between mb-4">
										<div>
											<Link
												to="/"
												aria-label="Home"
												title="Home"
												className="inline-flex items-center"
											>
												<img
													alt={"logo"}
													src="/vite.svg"
													className="w-8 h-8"
													width={32}
													height={32}
												/>
												<span className="ml-2 text-xl font-bold tracking-wide text-gray-950 dark:text-gray-300">
													Coins Counter
												</span>
											</Link>
										</div>
										<div>
											<Button
												aria-label="Close Menu"
												title="Close Menu"
												className="font-normal tracking-wide transition-colors duration-200"
												onClick={() => setIsMenuOpen(false)}
											>
												<X />
											</Button>
										</div>
									</div>
									<nav>
										<ul className="space-y-4">
											{links.map((link) => (
												<li key={link.label}>
													<Link
														to={link.to}
														aria-label={link.label}
														title={link.label}
														className="font-medium tracking-wide transition-colors duration-200 hover:text-deep-purple-accent-400"
														onClick={() => setIsMenuOpen(false)}
													>
														{link.label}
													</Link>
												</li>
											))}
										</ul>
									</nav>
									<div className="pt-4">
										<div className="flex items-center justify-between gap-x-5">
											{/* <HeaderLinks /> */}
											<div className="flex items-center justify-end gap-x-5">
												{/* <ThemedButton /> */}
											</div>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				</nav>
			</header>
		);
}
