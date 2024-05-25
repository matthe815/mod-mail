import ModMailClient from "../ModMailClient";
import ModMail, {ModMailData} from "./ModMail";
import {PoolConnection} from "mariadb";
import {Channel, Guild, User} from "discord.js";
import Config from "../../config/config.json"

export default class ModMailManager {
    client: ModMailClient

    private mail: ModMail[]

    constructor(client: ModMailClient) {
        this.client = client
        this.mail = []
    }

    public async getAverageResponseTime(guild: string): Promise<number> {
        const guildMail: ModMail[] = await this.getGuildMail(guild)
        if (guildMail.length == 0) return 1;

        const totalResponseTimes: number[] = guildMail.map((mail: ModMail) => mail.response_time)
        return totalResponseTimes.reduce((mail_a: number, mail_b: number) => mail_a + mail_b) / (totalResponseTimes.length - 1)
    }

    public getRecentMail(user: string): ModMail | undefined {
        return this.mail.find((mail: ModMail) => mail.user_id == user && !mail.closed)
    }

    public getThreadMail(channel: string): ModMail | undefined {
        return this.mail.find((mail: ModMail) => mail.thread_id == channel)
    }

    public getGuildMail(guild: string): Promise<ModMail[]> {
        return Promise.all(this.mail.filter(async (mail: ModMail) => {
            const thread = await mail.getThread()
            if (!thread) return false
            return thread.guild.id == guild
        }))
    }

    public create(user: User): ModMail {
        const mail: ModMail = ModMail.create(this)
            .setUser(user)

        this.mail.push(mail)
        return mail
    }

    public async load() {
        const connection: PoolConnection = await this.client.db.getConnection()
        const mailEntries: ModMailData[] = await connection.query("SELECT * FROM modmail_mail")

        for (const entry of mailEntries) {
            const mail: ModMail = new ModMail(this, entry);
            this.mail.push(mail)
        }
    }

    public total(opts: GetTotalingOptions): number {
        switch (opts.filter) {
            default:
            case TotalingFilter.All:
                return this.mail.length
            case TotalingFilter.Closed:
                return this.mail.filter((mail: ModMail) => mail.closed).length
            case TotalingFilter.Open:
                return this.mail.filter((mail: ModMail) => !mail.closed).length
            case TotalingFilter.Responded:
                return this.mail.filter((mail: ModMail) => mail.response_time > 0).length
        }
    }
}

type GetTotalingOptions = {
    filter: TotalingFilter
}

enum TotalingFilter {
    All,
    Open,
    Closed,
    Responded
}
