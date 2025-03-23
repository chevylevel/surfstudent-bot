import { AuthenticateParams, RequestCodeParams } from "../types";
import { GCDataStorage } from "../GCDataStorage";
import { BaseClient } from "./BaseClient";
import { Api } from 'telegram';
import { ListenClient } from './ListenClient';

export class AuthService {
    clients: Map<string, BaseClient>;
    storage: GCDataStorage;

    constructor(
        clients: Map<string, BaseClient>,
        storage: GCDataStorage,
    ) {
        this.clients = clients;
        this.storage = storage;
    }

    async getClient(userId: string) {
        let client = this.clients.get(userId);

        if (!client) {
            client = new ListenClient();
            this.clients.set(userId, client);
        }

        await client.connect();

        return client.client;
    }

    async requestCode(
        userId: string,
        {
            phoneNumber,
            onError,
        }: RequestCodeParams) {
        const client = await this.getClient(userId);

        console.log("Sending code to:", phoneNumber);
        
        try {
            const result = await client?.sendCode(
                {
                    apiHash: process.env.API_HASH!,
                    apiId: parseInt(process.env.API_ID!),
                },
                phoneNumber,
            );

            console.log('result:', result);
            return result?.phoneCodeHash;
        } catch (error) {
            console.error('RequestCode code error:', error);
            onError();
        }
    }

    async signIn(
        userId: string,
        {
            phoneNumber,
            phoneCode,
            phoneCodeHash,
            onError,
        }: AuthenticateParams) {
        const client = await this.getClient(userId);

        try {
            await client?.invoke(
                new Api.auth.SignIn({
                    phoneNumber,
                    phoneCodeHash,
                    phoneCode,
                })
            );

            await this.onSuccessLogin(userId);
        } catch (error) {
            onError();
            throw new Error(`authService.signIn error: ${error}`,);
        }
    }

    async getMe(userId: string) {
        const client = await this.getClient(userId);

        try {
            return await client?.getMe();
        } catch (error) {
            console.error(`catch getMe no client, ${error}`);
            return null;
        }
    }

    async isAuth(userId: string) {
        const client = await this.getClient(userId);

        try {
            return await client.isUserAuthorized();
        } catch (error) {
            console.error(`isUserAuthorized checking error: ${error}`);
            return false;
        }
    }

    private async saveSession(userId: string) {
        const client = this.clients.get(userId);
        const session = client?.session.save();
        
        session && await this.storage.savePreference(userId, {
            session,
        });

        return session;
    }

    private async onSuccessLogin(userId: string) {
        await this.saveSession(userId);
    }
}
