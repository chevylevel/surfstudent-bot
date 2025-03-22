import express, { Application } from 'express';
import bodyParser from 'body-parser';
import { Telegraf } from 'telegraf';

import { MyContext } from './types';

export class ServerApp {
    private app: Application;
    private bot: Telegraf<MyContext>;

    constructor(bot: Telegraf<MyContext>) {
        this.app = express();
        this.bot = bot;

        this.setupMiddleware();
        this.setupRoutes();
    }

    private setupMiddleware() {
        this.app.use(bodyParser.json());
    }

    private setupRoutes() {
        this.app.post('/webhook', async (req, res) => {
            try {
                await this.bot.handleUpdate(req.body);
                res.sendStatus(200);
            } catch (error) {
                console.error('Error handling update', error);
                res.sendStatus(500);
            }
        });
    }

    async start() {
        this.app.listen(process.env.PORT, async () => {
            console.log(`Server is running on port ${process.env.PORT}`);
            await this.setWebhook();
        });
    }

    setWebhook = async () => {
        const webhookUrl = `${process.env.BOT_URL}/webhook`;
        const webhookSetUrl = `https://api.telegram.org/bot${process.env.BOT_TOKEN!}/setWebhook?url=${webhookUrl}`;

        try {
            const response = await fetch(webhookSetUrl);
            const result = await response.json();

            if (result.ok) {
                console.log('Webhook set successfully');
            } else {
                console.error('Failed to set webhook:', result);
            }
        } catch (error) {
            console.error('Error setting webhook:', error);
        }
    };
}
