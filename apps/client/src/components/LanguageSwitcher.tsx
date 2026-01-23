import { useTranslation } from "react-i18next";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
	const { i18n } = useTranslation();

	return (
		<div className="flex items-center gap-2">
			<Globe className="w-4 h-4 text-muted-foreground" />
			<Select
				value={i18n.language}
				onValueChange={(value) => i18n.changeLanguage(value)}
			>
				<SelectTrigger className="w-[120px] h-8 text-xs font-medium border-0 bg-transparent hover:bg-muted/50 transition-colors focus:ring-0">
					<SelectValue placeholder="Language" />
				</SelectTrigger>
				<SelectContent align="end" className="min-w-[120px]">
					<SelectItem value="en" className="text-xs">
						English
					</SelectItem>
					<SelectItem value="zh" className="text-xs">
						中文
					</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
