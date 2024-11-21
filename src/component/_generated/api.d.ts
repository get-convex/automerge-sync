/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as automerge from "../automerge.js";
import type * as lib from "../lib.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  automerge: typeof automerge;
  lib: typeof lib;
}>;
export type Mounts = {
  automerge: {
    load: FunctionReference<
      "query",
      "public",
      {
        changes: Array<{
          _id: string;
          data: ArrayBuffer;
          heads: Array<string>;
        }>;
      },
      any
    >;
  };
  lib: {
    deleteDoc: FunctionReference<
      "mutation",
      "public",
      { cursor?: string; documentId: string },
      any
    >;
    pull: FunctionReference<
      "query",
      "public",
      {
        cursor: string | null;
        documentId: string;
        logLevel?: "error" | "warn" | "info" | "debug" | "trace";
        numItems?: number;
        since: number;
        until?: number;
      },
      any
    >;
    push: FunctionReference<
      "mutation",
      "public",
      {
        contents?: any;
        data: ArrayBuffer;
        documentId: string;
        heads: Array<string>;
        logLevel?: "error" | "warn" | "info" | "debug" | "trace";
        replaces?: Array<string>;
        type: "incremental" | "snapshot";
      },
      any
    >;
  };
};
// For now fullApiWithMounts is only fullApi which provides
// jump-to-definition in component client code.
// Use Mounts for the same type without the inference.
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
