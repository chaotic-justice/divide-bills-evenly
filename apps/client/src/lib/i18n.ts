import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../locales/en.json";
import zh from "../locales/zh.json";

i18n
	.use({
		type: "languageDetector",
		async: true,
		detect: async (callback: (lng: string | readonly string[]) => void) => {
			if (typeof window !== "undefined") {
				const Detector = (await import("i18next-browser-languagedetector"))
					.default;
				const detector = new Detector();
				detector.init({
					order: ["localStorage", "cookie", "htmlTag", "path", "subdomain"],
					caches: ["localStorage"],
					cookieOptions: {
						path: "/",
						sameSite: "lax",
						secure: true,
						maxAge: 365 * 24 * 60 * 60,
					},
				});
				const lng = detector.detect();
				callback(lng || "en");
			} else {
				callback("en");
			}
		},
		init: () => {
			/* init */
		},
		cacheUserLanguage: (lng: string) => {
			if (typeof window !== "undefined") {
				localStorage.setItem("i18nextLng", lng);
			}
		},
	})
	.use(initReactI18next)
	.init({
		resources: {
			en: {
				translation: en,
			},
			zh: {
				translation: zh,
			},
		},
		fallbackLng: "en",
		debug: false,
		interpolation: {
			escapeValue: false,
		},
	});

export default i18n;
