import { NewMessage, NewMessageEvent } from "telegram/events";
import { regexTestMessage } from "../recognition/regexTestMessage";
import { aiTestMessage } from "../recognition/aiTestMessage";

import { BaseClient } from "./BaseClient";
import { Api } from "telegram";

export class ListenClient extends BaseClient {
    constructor(session?: string) {
        super(session);
    }

    async init() {
        this.client.addEventHandler(
            this.handleNewMessage.bind(this),
            new NewMessage({
                func(event) {
                    if (event.isPrivate) return false;

                    if (
                        event.message.senderId &&
                        event.message.senderId instanceof Api.PeerUser &&
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

        await this.client.connect();
    }

    async handleNewMessage(event: NewMessageEvent) {
        const message = event.message;
        const channelId = (message.peerId as Api.PeerChannel)?.channelId;

        const messageLink = `https://t.me/c/${channelId}/${message.id}`;

        try {

            console.log('message:', message.text);
            
            if (!regexTestMessage(message.text)) return;
            
            const aiApproved = await aiTestMessage(message.text);

            aiApproved && await this.client.sendMessage(process.env.BOT_USERNAME!, {
                message: `${message?.text} \n ${messageLink}`,
            });

        } catch (error) {
            console.error("Forwarding message error: ", error);
        }
    }
}