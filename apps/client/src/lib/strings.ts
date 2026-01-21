export const capitalize = (s: string | undefined) =>
	(s && String(s[0]).toUpperCase() + String(s).slice(1)) || "";
