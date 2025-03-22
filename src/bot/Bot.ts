import { Telegraf } from "telegraf";
import { session } from 'telegraf/session';
import { message } from "telegraf/filters";

import { 
    InputMode, 
    MyContext, 
} from "../types";

import { AuthService } from "../client/AuthService";
import { GCDataStorage } from "../GCDataStorage";
import { BotAuth } from "./BotAuth";

const contextSession = session({
    defaultSession: () => ({
        inputMode: InputMode.IDLE,
    })
})

export class Bot {
    bot: Telegraf<MyContext>;
    storage: GCDataStorage;
    authService: AuthService;
    botAuth: BotAuth;

    constructor(
        storage: GCDataStorage,
        authService: AuthService,
    ) {
        this.bot = new Telegraf<MyContext>(process.env.BOT_TOKEN!);
        this.storage = storage;
        this.authService = authService;

        this.botAuth = new BotAuth(this.bot, this.authService);
    }

    async init() {
        this.bot.use(contextSession);
        this.bot.use(async (ctx, next) => {
            const userId = ctx?.from?.id?.toString();
            if (!userId) return await next();

            if (ctx.session.isAuthenticated !== undefined) return await next();

            ctx.session.isAuthenticated = await this.authService.isAuth(userId);

            await next();
        })

        this.botAuth.init();

        this.bot.start(this.start.bind(this));
        this.bot.on(message('text'), (ctx) => {
            if (ctx.session.isAuthenticated) return;

            this.botAuth.hearAuthInput(ctx);
        });
    };

    async start(ctx: MyContext) {
        if (ctx.session.isAuthenticated) return;

        ctx.reply('Welcome to surfstudent_bot, start with /login');
    }
}
