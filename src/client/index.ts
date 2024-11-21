import {
  Expand,
  FunctionReference,
  GenericDataModel,
  GenericMutationCtx,
  GenericQueryCtx,
  mutationGeneric,
  queryGeneric,
} from "convex/server";
import { ConvexError, GenericId, Infer, v } from "convex/values";
import { api } from "../component/_generated/api";
import { DocumentId } from "@automerge/automerge-repo";
import { vDataType, vDocumentId, vLogLevel } from "../shared";

export const PERMISSION_ERROR = "permission_denied" as const;

export class AutomergeSync {
  constructor(
    public component: UseApi<typeof api>,
    private opts?: {
      // TODO: allow overriding snapshot function
      logLevel?: "error" | "warn" | "info" | "debug" | "trace";
    }
  ) {}
  async load(ctx: RunQueryCtx, documentId: DocumentId) {
    const changes = await this.pull(ctx, {
      documentId: documentId,
      since: 0,
      cursor: null,
      numItems: 1000,
    });
    const { doc, heads } = await ctx.runQuery(this.component.automerge.load, {
      changes: changes.page.map((c) => ({
        _id: c._id,
        data: c.data,
        heads: c.heads,
      })),
    });
    return { doc, heads, isCurrent: changes.isDone };
  }
  async delete(ctx: RunQueryCtx & RunMutationCtx, documentId: DocumentId) {
    await ctx.runMutation(this.component.lib.deleteDoc, { documentId });
  }

  pullArgs = v.object({
    documentId: vDocumentId,
    since: v.number(),
    until: v.optional(v.number()),
    cursor: v.union(v.string(), v.null()),
    numItems: v.optional(v.number()),
    logLevel: v.optional(vLogLevel),
  });
  async pull(ctx: RunQueryCtx, args: Infer<typeof this.pullArgs>) {
    return ctx.runQuery(this.component.lib.pull, args);
  }

  pushArgs = v.object({
    documentId: vDocumentId,
    data: v.bytes(),
    type: vDataType,
    heads: v.array(v.string()),
    contents: v.optional(v.any()),
    logLevel: v.optional(vLogLevel),
    replaces: v.optional(v.array(v.string())),
  });
  async push(ctx: RunMutationCtx, args: Infer<typeof this.pushArgs>) {
    return ctx.runMutation(this.component.lib.push, args);
  }

  compactArgs = v.object({
    documentId: vDocumentId,
    cursor: v.optional(v.string()),
    until: v.number(),
  });
  async compact(
    ctx: RunQueryCtx & RunMutationCtx,
    args: Infer<typeof this.compactArgs>
  ) {
    const changes = await this.pull(ctx, {
      documentId: args.documentId,
      since: 0,
      cursor: args.cursor ?? null,
      numItems: 1000,
      until: args.until,
    });
    if (changes.page.length === 0) {
      return {
        doc: null,
        isDone: true,
        continueCursor: null,
      };
    }
    const { doc, heads, missing, data } = await ctx.runQuery(
      this.component.automerge.load,
      {
        changes: changes.page.map((c) => ({
          _id: c._id,
          data: c.data,
          heads: c.heads,
        })),
      }
    );
    const missingIds = new Set(missing);
    if (missingIds.size > 0) {
      // TODO: warning!
    }
    if (changes.page.length > 1) {
      await this.push(ctx, {
        documentId: args.documentId,
        data,
        type: "snapshot",
        heads,
        contents: doc,
        replaces: changes.page
          .filter((c) => !missingIds.has(c._id))
          .map((c) => c._id),
      });
    } else {
      // TODO: log
    }
    return {
      doc,
      isDone: changes.isDone,
      continueCursor: changes.continueCursor,
    };
  }

  /**
   * For easy re-exporting.
   * Apps can do
   * ```ts
   * export const { add, count } = automergeSync.api();
   * ```
   */
  syncApi<T, DataModel extends GenericDataModel>(callbacks?: {
    canRead: (
      ctx: GenericQueryCtx<DataModel>,
      documentId: DocumentId
    ) => boolean | Promise<boolean>;
    canChange: (
      ctx: GenericMutationCtx<DataModel>,
      documentId: DocumentId
    ) => boolean | Promise<boolean>;
    onSnapshot?: (
      ctx: GenericMutationCtx<DataModel>,
      documentId: DocumentId,
      doc: T,
      isCurrent: boolean
    ) => void | Promise<void>;
  }) {
    return {
      pull: queryGeneric({
        args: this.pullArgs,
        handler: async (ctx, args) => {
          if (
            callbacks?.canRead &&
            !(await callbacks.canRead(ctx, args.documentId))
          ) {
            throw new ConvexError(PERMISSION_ERROR);
          }
          return this.pull(ctx, args);
        },
      }),
      push: mutationGeneric({
        args: this.pushArgs,
        handler: async (ctx, args) => {
          if (
            callbacks?.canChange &&
            !(await callbacks.canChange(ctx, args.documentId))
          ) {
            throw new ConvexError(PERMISSION_ERROR);
          }
          return this.push(ctx, args);
        },
      }),
      compact: mutationGeneric({
        args: v.object({
          documentId: vDocumentId,
          cursor: v.optional(v.string()),
          until: v.number(),
        }),
        handler: async (ctx, args) => {
          if (
            callbacks?.canChange &&
            !(await callbacks.canChange(ctx, args.documentId))
          ) {
            throw new ConvexError(PERMISSION_ERROR);
          }
          const { doc, isDone, continueCursor } = await this.compact(ctx, args);
          if (callbacks?.onSnapshot) {
            await callbacks.onSnapshot(ctx, args.documentId, doc as T, isDone);
          }
          return {
            doc,
            isDone,
            continueCursor,
          };
        },
      }),
    };
  }
}

/* Type utils follow */

type RunQueryCtx = {
  runQuery: GenericQueryCtx<GenericDataModel>["runQuery"];
};
type RunMutationCtx = {
  runMutation: GenericMutationCtx<GenericDataModel>["runMutation"];
};

export type OpaqueIds<T> = T extends GenericId<infer _T> | string
  ? string
  : T extends (infer U)[]
    ? OpaqueIds<U>[]
    : T extends ArrayBuffer
      ? ArrayBuffer
      : T extends object
        ? { [K in keyof T]: OpaqueIds<T[K]> }
        : T;

export type UseApi<API> = Expand<{
  [mod in keyof API]: API[mod] extends FunctionReference<
    infer FType,
    "public",
    infer FArgs,
    infer FReturnType,
    infer FComponentPath
  >
    ? FunctionReference<
        FType,
        "internal",
        OpaqueIds<FArgs>,
        OpaqueIds<FReturnType>,
        FComponentPath
      >
    : UseApi<API[mod]>;
}>;
