import { v, type Validator, type Value } from "convex/values";
import { mutation, query } from "./_generated/server.js";
import { vDataType, vDocumentId, vLogLevel } from "../shared.js";
import { api } from "./_generated/api.js";
import schema from "./schema.js";

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
  returns: v.id("changes"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("changes")
      .withIndex("by_type_key", (q) =>
        q
          .eq("documentId", args.documentId)
          .eq("type", args.type)
          .eq("heads", args.heads),
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
          const exists = await ctx.db.get("changes", id);
          if (exists) {
            await ctx.db.delete("changes", id);
          }
        }),
      );
    }
    return id;
  },
});

const MINUTE = 60 * 1000;
const RETENTION_BUFFER = 5 * MINUTE;

export function vPaginationResult<
  T extends Validator<Value, "required", string>,
>(itemValidator: T) {
  return v.object({
    page: v.array(itemValidator),
    continueCursor: v.string(),
    isDone: v.boolean(),
    splitCursor: v.optional(v.union(v.string(), v.null())),
    pageStatus: v.optional(
      v.union(
        v.literal("SplitRecommended"),
        v.literal("SplitRequired"),
        v.null(),
      ),
    ),
  });
}

const vChange = v.object({
  ...schema.tables.changes.validator.fields,
  _id: v.id("changes"),
  _creationTime: v.number(),
});

export const pull = query({
  args: {
    documentId: vDocumentId,
    since: v.number(),
    until: v.optional(v.number()),
    cursor: v.union(v.string(), v.null()),
    numItems: v.optional(v.number()),
    logLevel: v.optional(vLogLevel),
  },
  returns: vPaginationResult(vChange),
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
            .lte("_creationTime", args.since),
        )
        .collect();
      result.page = retentionBuffer.concat(result.page);
    }
    return result;
  },
});

export const deleteDoc = mutation({
  args: { documentId: vDocumentId, cursor: v.optional(v.string()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("changes")
      .withIndex("by_insertion", (q) => q.eq("documentId", args.documentId))
      .paginate({
        numItems: 1000,
        cursor: args.cursor ?? null,
      });
    await Promise.all(result.page.map((c) => ctx.db.delete("changes", c._id)));
    if (!result.isDone) {
      // TODO: logging
      await ctx.scheduler.runAfter(0, api.lib.deleteDoc, {
        documentId: args.documentId,
        cursor: result.continueCursor,
      });
    }
  },
});

export const latestSnapshot = query({
  args: { documentId: vDocumentId },
  returns: v.any(),
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("changes")
      .withIndex("by_type_key", (q) =>
        q.eq("documentId", args.documentId).eq("type", "snapshot"),
      )
      .filter((q) => q.field("contents"))
      .order("desc")
      .first();
    return result?.contents;
  },
});
