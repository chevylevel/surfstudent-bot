import { Context } from "telegraf";
import { Message, Update } from "telegraf/types";

export type RequestCodeParams = {
    phoneNumber: string,
    onError: () => void,
}

export type AuthenticateParams = {
    phoneNumber: string,
    phoneCode: string,
    phoneCodeHash: string,
    onError: () => void,
}

export enum InputMode {
    IDLE = 'idle',
    WAITING_PHONE = 'waiting_phone',
    WAITING_CODE = 'waiting_code',
}

export enum BotCommands {
    START = 'start',
    LOGIN = 'login',
}

export interface SessionData {
    inputMode: InputMode;
    phone?: string;
    phoneCodeHash?: string;
    isAuthenticated?: boolean;
}

export interface MyContext extends Context<Update> {
    session: SessionData;
    update: Update & { message?: Message.TextMessage };
}
