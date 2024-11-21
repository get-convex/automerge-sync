import * as Automerge from "@automerge/automerge/slim/next";
// @ts-expect-error wasm is not a module
import { automergeWasmBase64 } from "@automerge/automerge/automerge.wasm.base64.js";
import { query } from "./_generated/server";
import { v } from "convex/values";
import { mergeArrays } from "@automerge/automerge-repo/helpers/mergeArrays.js";

let loaded: Promise<void> | undefined;
async function loadWasm() {
  if (!loaded) {
    loaded = Automerge.initializeBase64Wasm(automergeWasmBase64 as string);
  }
  await loaded;
  return Automerge;
}

export const load = query({
  args: {
    changes: v.array(
      v.object({
        _id: v.id("changes"),
        data: v.bytes(),
        heads: v.array(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const A = await loadWasm();
    const doc = A.loadIncremental(
      A.init(),
      mergeArrays(args.changes.map((c) => new Uint8Array(c.data)))
    );
    const heads = A.getHeads(doc);
    const missing = args.changes
      .filter((c) => A.getMissingDeps(doc, c.heads).length > 0)
      .map((c) => c._id);
    return {
      doc,
      heads,
      missing,
    };
  },
});
