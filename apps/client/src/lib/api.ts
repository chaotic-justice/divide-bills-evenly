import { env } from "cloudflare:workers";
import { edenTreaty } from "@elysiajs/eden";
import type { App } from "pumpkin-tree-api";

export const api = edenTreaty<App>(env.VITE_API_URL);
