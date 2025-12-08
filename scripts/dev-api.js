import http from "http";
import url from "url";

const routes = {
  "/api/signup": () => import("../api/signup.js"),
  "/api/login": () => import("../api/login.js"),
  "/api/verify-otp": () => import("../api/verify-otp.js"),
  "/api/users": () => import("../api/users.js"),
  "/api/projects": () => import("../api/projects.js"),
  "/api/chat": () => import("../api/chat.js"),
  "/api/generate-summary": () => import("../api/generate-summary.js"),
  "/api/generate-report": () => import("../api/generate-report.js"),
};

const server = http.createServer(async (req, res) => {
  try {
    const parsed = url.parse(req.url, true);
    const basePath = parsed.pathname;
    const key = Object.keys(routes).find((r) => basePath === r);
    if (!key) {
      res.statusCode = 404;
      res.end("Not Found");
      return;
    }
    const mod = await routes[key]();
    const handler = mod.default;
    await handler(req, res);
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ success: false, error: err?.message || String(err) }));
  }
});

const port = Number(process.env.API_DEV_PORT || 3001);
server.listen(port, () => {
  console.log(`Dev API server listening on http://localhost:${port}`);
});
