/* eslint-disable */
/**
 * Generated `ComponentApi` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { FunctionReference } from "convex/server";

/**
 * A utility for referencing a Convex component's API.
 *
 * Usage:
 * ```js
 * export type MyComponentApi = ComponentApi;
 * ```
 */

export type ComponentApi<Name extends string | undefined = string | undefined> =
  {
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
        },
        Name
      >;
    };
    lib: {
      deleteDoc: FunctionReference<
        "mutation",
        "internal",
        { cursor?: string; documentId: string },
        null,
        Name
      >;
      latestSnapshot: FunctionReference<
        "query",
        "internal",
        { documentId: string },
        any,
        Name
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
        },
        Name
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
        string,
        Name
      >;
    };
  };
