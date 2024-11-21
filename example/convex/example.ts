import { internalMutation, query, mutation } from "./_generated/server";
import { components } from "./_generated/api";
import { AutomergeSync } from "@convex-dev/automerge-sync";

const automergeSync = new AutomergeSync(components.automergeSync, {
  logLevel: "trace",
});

export const { push, pull, compact } = automergeSync.syncApi();
