import { MyContext } from "../types";
import { AuthService } from "../client/AuthService";
import { 
    BotCommands, 
    InputMode } from "../types";
import { Telegraf } from "telegraf";

export class BotAuth {
    authService: AuthService
    bot: Telegraf<MyContext>;

    constructor(bot: Telegraf<MyContext>, authService: AuthService) {
        this.bot = bot;
        this.authService = authService;   
    }

    init() {
        this.bot.command(BotCommands.LOGIN, this.login.bind(this));
    }

    async login(ctx: MyContext) {
        if (ctx.session.isAuthenticated) {
            ctx.reply("You already logged in");

            return;
        }

        ctx.reply("📲 Send your phone number (with country code, e.g., +7XXXXXXXX)");
        ctx.session.inputMode = InputMode.WAITING_PHONE;
    }

    async hearAuthInput(ctx: MyContext) {
            if (!(ctx?.message && 'text' in ctx?.message)) return;
    
            if (ctx.session.inputMode === InputMode.WAITING_PHONE) {
                await this.inputPhone(ctx);
    
                return;
            }
    
            if (ctx.session.inputMode === InputMode.WAITING_CODE) {
                await this.inputCode(ctx);    
                return;
            }
        }

    async inputPhone(ctx: MyContext) {
        const userId = ctx?.from?.id.toString();
        if (!userId || !(ctx?.message && 'text' in ctx?.message)) return;

        const isValidPhone = new RegExp('^\\+(\\d+){11}$').test(ctx.message.text);

        if (!isValidPhone) {
            ctx.reply("❌ Invalid phone format. Try again");

            return;
        }

        const phoneCodeHash = await this.authService?.requestCode(userId, {
            phoneNumber: ctx.message.text,
            onError: () => ctx.reply("Code request server error. Try again later"),
        });

        if (!phoneCodeHash) return;
    
        ctx.session.phone = ctx.message.text;
        ctx.session.inputMode = InputMode.WAITING_CODE;
        ctx.session.phoneCodeHash = phoneCodeHash;
        ctx.reply("🔢 Send code in format: X X X X X: ❗️add spaces between symbols❗️");
    }

    async inputCode(ctx: MyContext) {
        const userId = ctx.from!.id.toString();
        const phone = ctx.session.phone;
        const phoneCodeHash = ctx.session.phoneCodeHash;
        const message = ctx.message;
        if (!phone || !userId || !(message && 'text' in message) || !phoneCodeHash) return;

        const isValidPhoneCode = new RegExp('^\\d \\d \\d \\d \\d$').test(message.text);

        if (!isValidPhoneCode) {
            ctx.reply("❌ Invalid code format. Try again \n❗️❗️❗️ Make sure you've added spaces between the digits ❗️❗️❗️");

            return;
        }

        const phoneCode = message.text.split(' ').join('');

        try {
            await this.authService.signIn(
                userId,
                {
                    phoneNumber: phone,
                    phoneCode,
                    phoneCodeHash,
                    onError: () => ctx.reply('❌ Login failed. Try again.'),
                },
            );

            await this.onLoginSuccess(ctx);
        } catch (error) {
            console.error(`SignIn error: ${error}`);
        }
    }

    async onLoginSuccess(ctx: MyContext) {
        const userId = ctx?.from?.id.toString();
        if (!userId) return;

        ctx.session.inputMode = InputMode.IDLE;
        ctx.reply("🎉 Successfully logged in!");

        ctx.session.isAuthenticated = true;
    }
}
