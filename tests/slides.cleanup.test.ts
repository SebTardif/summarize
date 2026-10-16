import type { ReadStream } from "node:fs";
import type { ServerResponse } from "node:http";
import { PassThrough } from "node:stream";
import { describe, expect, it, vi } from "vitest";
import { pipeSlideImage } from "../src/daemon/server-session-routes.js";
import { releaseSlideInput } from "../src/slides/extract.js";

describe("slide cleanup", () => {
  it("destroys a slide image stream when the client disconnects", () => {
    const stream = new PassThrough() as unknown as ReadStream;
    const destroy = vi.spyOn(stream, "destroy");
    const res = new PassThrough() as unknown as ServerResponse;
    pipeSlideImage(res, stream);
    res.emit("close");
    expect(destroy).toHaveBeenCalledOnce();
  });

  it("keeps a finished extract when temp cleanup fails", async () => {
    await expect(
      releaseSlideInput(async () => {
        throw new Error("file is locked");
      }),
    ).resolves.toBeUndefined();
  });
});
