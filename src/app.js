import { fileURLToPath } from 'url';
import path from 'path';
import { LlamaModel, LlamaContext, LlamaChatSession } from 'node-llama-cpp';
import express from 'express';
const app = express();
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const model = new LlamaModel({
    modelPath: path.join(__dirname, 'models', 'llama-2-7b-chat.Q4_K_M.gguf'),
});

app.use(cors());
const context = new LlamaContext({ model });
const session = new LlamaChatSession({ context });
io.on('connection', (socket) => {
    socket.on('prompt', async (data) => {
        const prompt = `User: ${data}`;
        console.log('AI generating');
        let message = '';
        await session.prompt(prompt, {
            onToken(chunk) {
                message += context.decode(chunk);
                socket.emit('response', message);
                //process.stdout.write(context.decode(chunk));
            },
        });
    });

    let chunk = '';
    process.stdout.on('data', (data) => {
        chunk += data;
        socket.emit('response', chunk);
    });
});

httpServer.listen(3000, () => {
    console.log('Server connected');
});
