/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as example from "../example.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  example: typeof example;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  automergeSync: {
    automerge: {
      load: FunctionReference<
        "query",
        "internal",
        {
          changes: Array<{
            _id: string;
            data: ArrayBuffer;
            heads: Array<string>;
          }>;
        },
        {
          data: ArrayBuffer;
          doc: Record<string, any>;
          heads: Array<string>;
          missing: Array<string>;
        }
      >;
    };
    lib: {
      deleteDoc: FunctionReference<
        "mutation",
        "internal",
        { cursor?: string; documentId: string },
        null
      >;
      latestSnapshot: FunctionReference<
        "query",
        "internal",
        { documentId: string },
        any
      >;
      pull: FunctionReference<
        "query",
        "internal",
        {
          cursor: string | null;
          documentId: string;
          logLevel?: "error" | "warn" | "info" | "debug" | "trace";
          numItems?: number;
          since: number;
          until?: number;
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            _creationTime: number;
            _id: string;
            contents?: any;
            data: ArrayBuffer;
            debugDump?: any;
            documentId: string;
            heads: Array<string>;
            type: "incremental" | "snapshot";
          }>;
          pageStatus?: "SplitRecommended" | "SplitRequired" | null;
          splitCursor?: string | null;
        }
      >;
      push: FunctionReference<
        "mutation",
        "internal",
        {
          contents?: any;
          data: ArrayBuffer;
          documentId: string;
          heads: Array<string>;
          logLevel?: "error" | "warn" | "info" | "debug" | "trace";
          replaces?: Array<string>;
          type: "incremental" | "snapshot";
        },
        string
      >;
    };
  };
};
