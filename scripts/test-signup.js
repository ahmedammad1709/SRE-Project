import signupHandler from "../api/signup/index.js";
import { Readable } from "stream";

function makeReq(body) {
  const stream = new Readable({ read() {} });
  stream.method = "POST";
  stream.push(JSON.stringify(body));
  stream.push(null);
  return stream;
}

function makeRes() {
  return {
    statusCode: 200,
    headers: {},
    setHeader(k, v) {
      this.headers[k] = v;
    },
    end(payload) {
      try {
        console.log("response:", JSON.parse(payload));
      } catch {
        console.log("response:", payload);
      }
    },
  };
}

async function main() {
  const req = makeReq({
    name: "Test User",
    email: "test@example.com",
    password: "Password123",
    confirmPassword: "Password123",
  });
  const res = makeRes();
  await signupHandler(req, res);
}

main();
