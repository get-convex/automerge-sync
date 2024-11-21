import { defineApp } from "convex/server";
import automergeSync from "@convex-dev/automerge-sync/convex.config";

const app = defineApp();
app.use(automergeSync);

export default app;
