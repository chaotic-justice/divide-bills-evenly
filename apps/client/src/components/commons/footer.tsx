// src/components/Footer.tsx
import { Link } from "@tanstack/react-router";

export function Footer() {
	return (
		<footer className="border-t bg-background">
			<div className="container py-8 md:py-12">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					{/* Brand Section */}
					<div className="md:col-span-2">
						<Link to="/" className="flex items-center space-x-2 mb-4">
							<div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg" />
							<span className="font-bold text-xl">YourBrand</span>
						</Link>
						<p className="text-muted-foreground max-w-md">
							Building amazing experiences with modern web technologies. Fast,
							responsive, and user-friendly applications.
						</p>
					</div>

					{/* Quick Links */}
					<div>
						<h3 className="font-semibold mb-4">Quick Links</h3>
						<ul className="space-y-2">
							<li>
								<Link
									to="/"
									className="text-muted-foreground hover:text-foreground transition-colors"
								>
									Home
								</Link>
							</li>
							<li>
								<Link
									to="/measure"
									className="text-muted-foreground hover:text-foreground transition-colors"
								>
									Measure
								</Link>
							</li>
							<li>
								<a
									href="#"
									className="text-muted-foreground hover:text-foreground transition-colors"
								>
									Services
								</a>
							</li>
							<li>
								<a
									href="#"
									className="text-muted-foreground hover:text-foreground transition-colors"
								>
									Contact
								</a>
							</li>
						</ul>
					</div>

					{/* Contact Info */}
					<div>
						<h3 className="font-semibold mb-4">Contact</h3>
						<ul className="space-y-2 text-muted-foreground">
							<li>hello@yourbrand.com</li>
							<li>+1 (555) 123-4567</li>
							<li>123 Main St, City, State</li>
						</ul>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
					<p className="text-sm text-muted-foreground">
						© 2024 YourBrand. All rights reserved.
					</p>
					<div className="flex space-x-6 mt-4 md:mt-0">
						<a
							href="#"
							className="text-muted-foreground hover:text-foreground transition-colors"
						>
							Terms
						</a>
						<a
							href="#"
							className="text-muted-foreground hover:text-foreground transition-colors"
						>
							Privacy
						</a>
						<a
							href="#"
							className="text-muted-foreground hover:text-foreground transition-colors"
						>
							Cookies
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
