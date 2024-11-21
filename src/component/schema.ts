import type { DocumentId } from "@automerge/automerge-repo";
import { defineTable, defineSchema } from "convex/server";
import { v } from "convex/values";
import { vDataType, vDocumentId } from "../shared";

export default defineSchema({
  automerge: defineTable({
    documentId: vDocumentId,
    type: v.union(v.literal("incremental"), v.literal("snapshot")),
    hash: v.string(),
    data: v.bytes(),
    // For optionally storing raw change values, for debugging.
    debugDump: v.optional(v.any()),
  })
    .index("doc_type_hash", ["documentId", "type", "hash"])
    .index("documentId", ["documentId"]),
});
