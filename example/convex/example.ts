import { internalMutation, query, mutation } from "./_generated/server";
import { components } from "./_generated/api";
import { AutomergeSync } from "@convex-dev/automerge-sync";

const automergeSync = new AutomergeSync(components.automergeSync, {
  shards: { beans: 10, users: 100 },
});
const numUsers = automergeSync.for("users");

export const addOne = mutation({
  args: {},
  handler: async (ctx, _args) => {
    await numUsers.inc(ctx);
  },
});

export const getCount = query({
  args: {},
  handler: async (ctx, _args) => {
    return await numUsers.count(ctx);
  },
});

export const usingClient = internalMutation({
  args: {},
  handler: async (ctx, _args) => {
    await automergeSync.add(ctx, "accomplishments");
    await automergeSync.add(ctx, "beans", 2);
    const count = await automergeSync.count(ctx, "beans");
    return count;
  },
});

export const usingFunctions = internalMutation({
  args: {},
  handler: async (ctx, _args) => {
    await numUsers.inc(ctx);
    await numUsers.inc(ctx);
    await numUsers.dec(ctx);
    return numUsers.count(ctx);
  },
});

export const directCall = internalMutation({
  args: {},
  handler: async (ctx, _args) => {
    await ctx.runMutation(components.automergeSync.lib.add, {
      name: "pennies",
      count: 250,
    });
    await ctx.runMutation(components.automergeSync.lib.add, {
      name: "beans",
      count: 3,
      shards: 100,
    });
    const count = await ctx.runQuery(components.automergeSync.lib.count, {
      name: "beans",
    });
    return count;
  },
});

// Direct re-export of component's API.
export const { add, count } = automergeSync.api();
