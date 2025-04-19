import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { createPost } from "./mcp.tool.js";
import crypto from 'crypto';
import { registerTools } from "./register.tools.js";

const server = new McpServer({
    name: "example-server",
    version: "1.0.0"
});

const app = express();
// app.use(express.json())

registerTools(server);



app.use('/github-webhook', express.raw({ type: '*/*' }));


function verifySignature(req, res, next) {
    const signature = req.get('x-hub-signature-256');
    const hmac = crypto.createHmac('sha256', process.env.GITHUB_SECRET);
    const digest = 'sha256=' + hmac.update(req.body).digest('hex');
    console.log("verify signature");
    
  
    if (signature !== digest) {
      return res.status(401).send('Signature mismatch');
    }
  
    // Convert raw body back to JSON so your handler can use req.body
    try {
      req.body = JSON.parse(req.body.toString());
    } catch (e) {
      return res.status(400).send('Invalid JSON payload');
    }
    console.log("verified");
    
  
    next();
  }
  
  app.post('/github-webhook', verifySignature, async (req, res) => {
    const payload = req.body;

    console.log("getting request from webhook");
    console.log("payload",payload.toString());
    
    
  
    if (payload?.commits?.length) {
      const commit = payload.commits[0];
      const repo = payload.repository?.full_name;
      const pusher = payload.pusher?.name;
      const message = commit.message;
  
      const tweetText = `🛠 New push to ${repo} by ${pusher}: "${message}"`;
  
      try {
        const tweet = await createPost(tweetText); // assuming this returns { data: ... }
        console.log('✅ Tweet posted:', tweet.content[0].text);
      } catch (error) {
        console.error('❌ Error tweeting:', error);
      }
    }
  
    res.sendStatus(200);
  });


const transports = {};

app.get("/sse", async (req, res) => {
    const transport = new SSEServerTransport('/messages', res);
    transports[ transport.sessionId ] = transport;
    res.on("close", () => {
        delete transports[ transport.sessionId ];
    });
    await server.connect(transport);
});

app.post("/messages", async (req, res) => {
    const sessionId = req.query.sessionId;
    const transport = transports[ sessionId ];
    if (transport) {
        await transport.handlePostMessage(req, res);
    } else {
        res.status(400).send('No transport found for sessionId');
    }
});

app.listen(3001, () => {
    console.log("Server is running on http://localhost:3001");
});