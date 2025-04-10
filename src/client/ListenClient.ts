import { NewMessage, NewMessageEvent } from "telegram/events";
import { regexTestMessage } from "../recognition/regexTestMessage";
import { aiTestMessage } from "../recognition/aiTestMessage";

import { BaseClient } from "./BaseClient";
import { Api } from "telegram";
import { RPCError } from "telegram/errors";

export class ListenClient extends BaseClient {
    userId: string;

    constructor(userId: string, session?: string,) {
        super(session);
        this.userId = userId;
    }

    async init() {
        try {
            this.client.addEventHandler(
                this.handleNewMessage.bind(this),
                new NewMessage({
                    func(event) {
                        if (event.isPrivate) return false;

                        if (
                            event.message.sender &&
                            event.message.sender instanceof Api.User &&
                            !event.message.sender.bot
                        ) {
                            return true;
                        }

                        return false;
                    },
                })
            );

            await super.connect();

        } catch (error) {
            if (error instanceof RPCError && error.code === 401 && error.message.includes('AUTH_KEY_UNREGISTERED')) {
                console.error(`AUTH_KEY_UNREGISTERED error for user ID: ${this.userId}`, error);
            } else {
                console.error(`Error initializing client for user ID: ${this.userId}`, error);
            }
        }
    }

    async handleNewMessage(event: NewMessageEvent) {

        const message = event.message;
        const channelId = (message.peerId as Api.PeerChannel)?.channelId;
        const messageLink = `https://t.me/c/${channelId}/${message.id}`;

        try {
            if (!regexTestMessage(message.text)) return;

            const aiApproved = await aiTestMessage(message.text);

            aiApproved && await this.client.sendMessage(process.env.BOT_USERNAME!, {
                message: `${message?.text} \n\n ${messageLink}`,
            });

        } catch (error) {
            console.error("Forwarding message error: ", error);
            if (error instanceof RPCError
                && error.code === 401
                && error.message.includes('AUTH_KEY_UNREGISTERED')
            ) {
                console.error(`AUTH_KEY_UNREGISTERED error during message handling for user ID: ${this.userId}`, error);
                // Consider your re-authentication strategy here as well.
            }
        }
    }
}