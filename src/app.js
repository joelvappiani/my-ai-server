import { fileURLToPath } from 'url';
import path from 'path';
import { LlamaModel, LlamaContext, LlamaChatSession } from 'node-llama-cpp';
import express from 'express';
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const model = new LlamaModel({
    modelPath: path.join(__dirname, 'models', 'llama-2-7b-chat.Q4_K_M.gguf'),
});
const context = new LlamaContext({ model });
const session = new LlamaChatSession({ context });
// stream function
// async () => {
//     const q1 = 'Tell me how to make a pizza?';
//     console.log('User: ' + q1);
//     process.stdout.write('AI: ');
//     const a1 = await session.prompt(q1, {
//         onToken(chunk) {
//             process.stdout.write(context.decode(chunk));
//         },
//     });
// };
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.post('/chat', async (req, res) => {
    const prompt = `User: ${req.body.prompt}`;
    //const response = await session.prompt(prompt);
    process.stdout.write('AI: ');
    const response = await session.prompt(prompt, {
        onToken(chunk) {
            process.stdout.write(context.decode(chunk));
        },
    });
    res.json({ response });
});
app.listen(3000, () => {
    console.log('Server connected');
});
