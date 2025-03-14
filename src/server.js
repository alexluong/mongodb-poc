import http from "http";

export function createServer(dbClient) {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    console.log(`${req.method} ${url.pathname}`);

    if (
      req.method === "GET" &&
      (url.pathname === "/" || url.pathname === "/health")
    ) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    let db = dbClient.db();

    if (!dbClient.db()) {
      try {
        await dbClient.connect();
        db = dbClient.db();
      } catch (err) {
        console.error(err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Failed to connect to database" }));
        return;
      }
    }

    try {
      if (req.method === "GET" && url.pathname === "/health/db") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
        return;
      } else if (req.method === "POST" && url.pathname === "/increment") {
        const result = await db
          .collection("counter")
          .findOneAndUpdate(
            { _id: "counter" },
            { $inc: { value: 1 } },
            { upsert: true, returnDocument: "after" }
          );
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ value: result.value }));
      } else if (req.method === "DELETE" && url.pathname === "/clear") {
        await db.collection("counter").deleteOne({ _id: "counter" });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ value: 0 }));
      } else if (req.method === "GET" && url.pathname === "/value") {
        const counter = await db
          .collection("counter")
          .findOne({ _id: "counter" });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ value: counter?.value || 0 }));
      } else {
        res.writeHead(404);
        res.end();
      }
    } catch (err) {
      console.error(err);
      res.writeHead(500);
      res.end();
    }
  });
}
