import { config } from 'dotenv';
import readline from 'readline/promises';
import { GoogleGenAI } from '@google/genai';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

config();

let tools = [];
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const mcpClient = new Client({
    name: 'example-client',
    version: '1.0.0',
});

const chatHistory = [];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

mcpClient
    .connect(new SSEClientTransport(new URL('http://localhost:3001/sse')))
    .then(async () => {
        console.log('✅ Connected to MCP server');

        tools = (await mcpClient.listTools()).tools.map((tool) => ({
            name: tool.name,
            description: tool.description,
            parameters: {
                type: tool.inputSchema.type,
                properties: tool.inputSchema.properties,
                required: tool.inputSchema.required,
            },
        }));

        await chatLoop();
    })
    .catch((err) => {
        console.error('❌ Failed to connect to MCP server:', err);
        process.exit(1);
    });

async function chatLoop(toolCall) {
    if (toolCall) {
        // Optional debug
        // console.log("⚙️ Calling tool:", toolCall.name);

        chatHistory.push({
            role: 'model',
            parts: [
                {
                    text: `Invoking tool: ${toolCall.name}`,
                    type: 'text',
                },
            ],
        });

        try {
            const toolResult = await mcpClient.callTool({
                name: toolCall.name,
                arguments: toolCall.args,
            });

            chatHistory.push({
                role: 'user',
                parts: [
                    {
                        text: 'Tool result: ' + (toolResult.content?.[0]?.text || 'No response'),
                        type: 'text',
                    },
                ],
            });
        } catch (err) {
            console.error('❌ Tool call error:', err);
            chatHistory.push({
                role: 'user',
                parts: [
                    {
                        text: 'Error calling tool: ' + err.message,
                        type: 'text',
                    },
                ],
            });
        }
    } else {
        const question = await rl.question('You: ');
        if (question.toLowerCase() === 'exit') {
            rl.close();
            process.exit(0);
        }

        chatHistory.push({
            role: 'user',
            parts: [
                {
                    text: question,
                    type: 'text',
                },
            ],
        });
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: chatHistory,
        config: {
            tools: [
                {
                    functionDeclarations: tools,
                },
            ],
        },
    });

    const candidate = response.candidates?.[0];
    const part = candidate?.content?.parts?.[0] ?? {};
    const functionCall = part.functionCall;
    const responseText = part.text;

    if (functionCall) {
        return await chatLoop(functionCall);
    }

    chatHistory.push({
        role: 'model',
        parts: [
            {
                text: responseText,
                type: 'text',
            },
        ],
    });

    console.log(`AI: ${responseText}\n`);

    await chatLoop();
}
