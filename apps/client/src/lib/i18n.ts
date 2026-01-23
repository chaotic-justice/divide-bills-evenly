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
		cacheUserLanguage: () => {
			/* cacheUserLanguage */
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
