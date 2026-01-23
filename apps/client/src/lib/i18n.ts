import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import resourcesToBackend from "i18next-resources-to-backend";

i18n
	.use(
		resourcesToBackend(
			(language: string, _namespace: string) =>
				import(`../../public/locales/${language}.json`),
		),
	)
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
				if (lng) callback(lng); // Only callback if language is detected
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
		fallbackLng: "en",
		debug: false,
		interpolation: {
			escapeValue: false,
		},
	});

export default i18n;
