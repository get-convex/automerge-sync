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
/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  example: typeof example;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
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
        any
      >;
    };
    lib: {
      deleteDoc: FunctionReference<
        "mutation",
        "internal",
        { cursor?: string; documentId: string },
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
        any
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
        any
      >;
    };
  };
};
