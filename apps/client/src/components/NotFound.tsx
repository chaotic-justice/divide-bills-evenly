import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export function NotFound({ children }: { children?: React.ReactNode }) {
	const { t } = useTranslation();
	return (
		<div className="space-y-2 p-2">
			<div className="text-gray-600 dark:text-gray-400">
				{children || <p>{t("error.notFoundDescription")}</p>}
			</div>
			<p className="flex items-center gap-2 flex-wrap">
				<button
					onClick={() => window.history.back()}
					className="bg-emerald-500 text-white px-2 py-1 rounded-sm uppercase font-black text-sm"
				>
					{t("error.goBack")}
				</button>
				<Link
					to="/"
					className="bg-cyan-600 text-white px-2 py-1 rounded-sm uppercase font-black text-sm"
				>
					{t("error.startOver")}
				</Link>
			</p>
		</div>
	);
}
