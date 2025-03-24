import { StringSession } from "telegram/sessions";
import { TelegramClient } from 'telegram';
import { LogLevel } from "telegram/extensions/Logger";

export class BaseClient {
    client: TelegramClient;
    session: StringSession;

    constructor(session?: string) {
        this.session = new StringSession(session || '');

        this.client = new TelegramClient(
            this.session,
            parseInt(process.env.API_ID!),
            process.env.API_HASH!,
            { connectionRetries: 5 }
        );

        this.client.setLogLevel(LogLevel.DEBUG);
    }

    async connect() {
        try {
            if (!this.client.connected) {
                await this.client.connect();
            }
        } catch (error) {
            console.error('Client connection error:', error);
        }
    }
}
