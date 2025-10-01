"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ModMail_1 = __importDefault(require("../src/mail/ModMail"));
const ModMailClient_1 = __importDefault(require("../src/ModMailClient"));
const UserBan_1 = __importDefault(require("../src/bans/UserBan"));
const Utils_1 = __importDefault(require("../src/Utils"));
const mailClient = new ModMailClient_1.default({ intents: [] });
test('Must construct new mail', () => {
    const mail = ModMail_1.default.create(mailClient.mail);
    expect(true).toBe(true);
});
test('Must properly set mail values', () => {
    const mail = ModMail_1.default.create(mailClient.mail);
    const testEntry = {
        closed: true,
        response_time: 12,
        created_at: mail.created_at,
        updated_at: new Date().getTime(),
        thread_id: "123",
        user_id: "143",
        mail_uuid: "132",
        anonymous: true
    };
    mail.set(testEntry);
    expect(mail.mail_uuid).toBe("132");
    expect(mail.closed).toBe(true);
    expect(mail.updated_at).toBe(testEntry.updated_at);
    expect(mail.thread_id).toBe("123");
    expect(mail.user_id).toBe("143");
    expect(mail.response_time).toBe(12);
});
test('Must properly get recent threads', () => {
    expect(mailClient.mail.getRecentMail("123")).toBe(undefined);
    expect(mailClient.mail.getThreadMail("123")).toBe(undefined);
});
test('Must start with no bans', () => {
    expect(mailClient.bans.total("123")).toBe(0);
});
test('Must properly construct bans', () => {
    const guildban = new UserBan_1.default(mailClient.bans, { user_id: "123", banned_by: "", guild_id: "123" });
    expect(guildban.user).toBe("123");
    expect(guildban.guild_id).toBe("123");
    expect(guildban.banned_by).toBe("");
});
test('Must properly construct a relative time', () => {
    let relativeTime = Utils_1.default.formatRelativeTime(4000);
    expect(relativeTime).toBe("4 seconds");
    relativeTime = Utils_1.default.formatRelativeTime(65000);
    expect(relativeTime).toBe("1 minute 5 seconds");
    relativeTime = Utils_1.default.formatRelativeTime(3782000);
    expect(relativeTime).toBe("1 hour 3 minutes 2 seconds");
    relativeTime = Utils_1.default.formatRelativeTime(0);
    expect(relativeTime).toBe("unknown");
    relativeTime = Utils_1.default.formatRelativeTime(NaN);
    expect(relativeTime).toBe("unknown");
});
