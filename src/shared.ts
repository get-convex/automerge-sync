import type { DocumentId } from "@automerge/automerge-repo";
import { v, VString } from "convex/values";

export const vDocumentId = v.string() as VString<DocumentId>;
export const vDataType = v.union(
  v.literal("incremental"),
  v.literal("snapshot")
);
export const vLogLevel = v.union(
  v.literal("error"),
  v.literal("warn"),
  v.literal("info"),
  v.literal("debug"),
  v.literal("trace")
);
