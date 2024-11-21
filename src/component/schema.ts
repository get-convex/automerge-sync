import { defineTable, defineSchema } from "convex/server";
import { v } from "convex/values";
import { vDataType, vDocumentId } from "../shared";

export default defineSchema({
  changes: defineTable({
    documentId: vDocumentId,
    type: vDataType,
    heads: v.array(v.string()),
    data: v.bytes(),
    // Snapshots contain the entire document, for convenience of querying.
    contents: v.optional(v.any()),
    // For optionally storing raw change values, for debugging.
    debugDump: v.optional(v.any()),
  })
    .index("by_type_key", ["documentId", "type", "heads"])
    .index("by_insertion", ["documentId"]),
});
