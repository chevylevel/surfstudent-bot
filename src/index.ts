import dotenv from 'dotenv';

import { Bot } from './bot/Bot';
import { GCDataStorage } from './GCDataStorage';
import { BaseClient } from './client/BaseClient';
import { AuthService } from './client/AuthService';
import { ServerApp } from './ServerApp';
import { ListenClient } from './client/ListenClient';

dotenv.config();

export const API_ID = Number(process.env.API_ID);
export const API_HASH = process.env.API_HASH!;
export const BOT_USERNAME = process.env.BOT_USERNAME;
export const BOT_TOKEN = process.env.BOT_TOKEN!;
export const BUCKET_NAME = process.env.BUCKET_NAME;
export const SERVICE_PHONE = process.env.SERVICE_PHONE;
export const DOMAIN = process.env.DOMAIN!;
export const PORT = process.env.PORT || 3000;

async function main() {
    const storage = new GCDataStorage();
    if (!storage) return;

    const clients = new Map<string, BaseClient>();
    const users = await storage.getPreferences();

    for (const userId in users) {
        const session = users[userId]?.session;
        const client = new ListenClient(session);
        await client.init();

        clients.set(userId, client);
    }

    const authService = new AuthService(clients, storage);
    const bot = new Bot(storage, authService);
    await bot.init();

    const app = new ServerApp(bot.bot)
    await app.start();

    process.on("SIGINT", () => {
        console.log("Shutting down gracefully...");
        bot.bot.stop();
        process.exit(0);
    });

    process.on("SIGTERM", () => {
        console.log("Received SIGTERM. Shutting down gracefully...");
        bot.bot.stop();
        process.exit(0);
    });
}

main().catch((error) => {
    console.error("Error during startup:", error);
    process.exit(1);
});
