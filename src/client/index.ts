import {
  Expand,
  FunctionReference,
  GenericActionCtx,
  GenericDataModel,
  GenericMutationCtx,
  GenericQueryCtx,
  mutationGeneric,
  queryGeneric,
} from "convex/server";
import { GenericId, v } from "convex/values";
import { api } from "../component/_generated/api";
import { DocumentId } from "@automerge/automerge-repo";

export class AutomergeSync {
  constructor(public component: UseApi<typeof api>) {}
  loadDoc(ctx: RunActionCtx, documentId: DocumentId) {
    // TODO
  }
  deleteDoc(ctx: RunActionCtx, documentId: DocumentId) {
    // TODO
  }
  /**
   * For easy re-exporting.
   * Apps can do
   * ```ts
   * export const { add, count } = automergeSync.api();
   * ```
   */
  syncApi<T, DataModel extends GenericDataModel>(callbacks: {
    canRead: (
      ctx: GenericQueryCtx<DataModel>,
      documentId: DocumentId
    ) => boolean;
    canChange: (
      ctx: GenericMutationCtx<DataModel>,
      documentId: DocumentId
    ) => boolean;
    onSnapshot: (
      ctx: GenericMutationCtx<DataModel>,
      documentId: DocumentId,
      doc: T
    ) => void;
  }) {
    return {
      // TODO
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
type RunActionCtx = {
  runAction: GenericActionCtx<GenericDataModel>["runAction"];
};

export type OpaqueIds<T> =
  T extends GenericId<infer _T>
    ? string
    : T extends (infer U)[]
      ? OpaqueIds<U>[]
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
