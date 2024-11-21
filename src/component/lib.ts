import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { vDataType, vDocumentId, vLogLevel } from "../shared";
import { api } from "./_generated/api";

// TODO: set up logger

export const push = mutation({
  args: {
    documentId: vDocumentId,
    data: v.bytes(),
    type: vDataType,
    heads: v.array(v.string()),
    contents: v.optional(v.any()),
    logLevel: v.optional(vLogLevel),
    replaces: v.optional(v.array(v.id("changes"))),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("changes")
      .withIndex("by_type_key", (q) =>
        q
          .eq("documentId", args.documentId)
          .eq("type", args.type)
          .eq("heads", args.heads)
      )
      .first();
    const id =
      existing?._id ??
      ctx.db.insert("changes", {
        documentId: args.documentId,
        type: args.type,
        heads: args.heads,
        data: args.data,
        contents: args.contents,
      });
    if (args.replaces) {
      await Promise.all(
        args.replaces.map(async (id) => {
          const exists = await ctx.db.get(id);
          if (exists) {
            await ctx.db.delete(id);
          }
        })
      );
    }
    return id;
  },
});

const MINUTE = 60 * 1000;
const RETENTION_BUFFER = 5 * MINUTE;

export const pull = query({
  args: {
    documentId: vDocumentId,
    since: v.number(),
    until: v.optional(v.number()),
    cursor: v.union(v.string(), v.null()),
    numItems: v.optional(v.number()),
    logLevel: v.optional(vLogLevel),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("changes")
      .withIndex("by_insertion", (q) => {
        const qq = q
          .eq("documentId", args.documentId)
          .gt("_creationTime", args.since);
        return args.until ? qq.lte("_creationTime", args.until) : qq;
      })
      .paginate({
        numItems: args.numItems ?? 10,
        cursor: args.cursor,
      });

    // For the first page, also reach further back to avoid missing changes
    // inserted out of order.
    // This isn't part of the paginate call, since the cursors wouldn't
    // stay consistent if they're based on Date.now().
    if (!args.cursor) {
      const retentionBuffer = await ctx.db
        .query("changes")
        .withIndex("by_insertion", (q) =>
          q
            .eq("documentId", args.documentId)
            .gt("_creationTime", args.since - RETENTION_BUFFER)
            .lte("_creationTime", args.since)
        )
        .collect();
      result.page = retentionBuffer.concat(result.page);
    }
    return result;
  },
});

export const deleteDoc = mutation({
  args: { documentId: vDocumentId, cursor: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("changes")
      .withIndex("by_insertion", (q) => q.eq("documentId", args.documentId))
      .paginate({
        numItems: 1000,
        cursor: args.cursor ?? null,
      });
    await Promise.all(result.page.map((c) => ctx.db.delete(c._id)));
    if (!result.isDone) {
      // TODO: logging
      await ctx.scheduler.runAfter(0, api.lib.deleteDoc, {
        documentId: args.documentId,
        cursor: result.continueCursor,
      });
    }
  },
});
