import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

const root = process.cwd();
const port = Number(process.env.PORT || 8000);
const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"]
]);

function resolveFile(url) {
  const requestedPath = decodeURIComponent(new URL(url, `http://localhost:${port}`).pathname);
  const relativePath = requestedPath === "/" ? "index.html" : requestedPath.slice(1);
  const filePath = path.resolve(root, relativePath);
  return filePath.startsWith(root) ? filePath : "";
}

createServer(async (request, response) => {
  const filePath = resolveFile(request.url);
  const fileStat = filePath && await stat(filePath).catch(() => null);

  if (!fileStat?.isFile()) {
    const fallbackPath = path.join(root, "404.html");
    const fallbackStat = await stat(fallbackPath).catch(() => null);

    if (!fallbackStat?.isFile()) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(404, {
      "content-type": "text/html; charset=utf-8",
      "content-length": fallbackStat.size
    });
    createReadStream(fallbackPath).pipe(response);
    return;
  }

  response.writeHead(200, {
    "content-type": contentTypes.get(path.extname(filePath)) || "application/octet-stream",
    "content-length": fileStat.size
  });
  createReadStream(filePath).pipe(response);
}).listen(port, () => {
  console.log(`Serving ${root} at http://localhost:${port}`);
});
