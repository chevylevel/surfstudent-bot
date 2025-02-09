import { Bucket, Storage } from '@google-cloud/storage';
import { BUCKET_NAME } from '.';

export class GCDataStorage {
    storage: Storage;
    bucket: Bucket;

    constructor() {
        this.storage = new Storage();
        this.bucket = this.storage.bucket(BUCKET_NAME!);
    }

    async savePreference(userId: string, payload: Record<string, string>) {
        try {
            const file = this.bucket.file(`${userId}.json`);
            const [exists] = await file.exists();
            let currentUserData = {};

            if (exists) {
                const data = await file.download();
                currentUserData = JSON.parse(data.toString());
            }

            await file.save(
                JSON.stringify({ ...currentUserData, ...payload }, null, 2),
                { contentType: 'application/json' }
            );

        } catch (error) {
            console.error(`Save prefernce of user ${userId} error:`, error);
        }
    }

    async getPreferences(key?: string): Promise<{ [x: string]: any; }> {
        try {
            const [files] = await this.bucket.getFiles();
            if (!files.length) return [];

            const dataPromises = files.map(async (file) => {
                const data = await file.download();
                const parsedData = JSON.parse(data.toString())

                return { [file.name.split('.')[0]]: key ? parsedData[key] : parsedData }
            });

            return (await Promise.all(dataPromises)).reduce((acc, item) => {
                return Object.assign(acc, item);
            }, {});

        } catch (error) {
            console.error(`Get preferences error:`, error);

            return [];
        }
    }

    async getPreference(fileName: string, key: string): Promise<string | undefined> {
        try {
            const file = this.bucket.file(`${fileName}.json`);
            const [exists] = await file.exists();

            if (!exists) {
                console.warn(`File ${fileName}.json does not exist.`);

                await file.save(JSON.stringify({}), {
                    contentType: 'application/json',
                });

                return;
            }

            const data = await file.download();

            return JSON.parse(data.toString())?.[key];
        } catch (error) {
            console.error(`Get preference of ${fileName || "unknown"} error:`, error);
        }
    }
}
