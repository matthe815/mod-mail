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

    public async getAverageResponseTime(guild: Guild): Promise<number> {
        const guildMail = await Promise.all(this.mail.filter(async (mail) => {
            const thread = await mail.getThread()
            if (!thread || !thread.isThread()) return false
            return thread.guild.id == guild.id
        }))

        if (guildMail.length == 0) return 0;

        const mailResponseTimes: number[] = guildMail.map((mail: ModMail) => mail.response_time)
        return mailResponseTimes.reduce((mail1, mail2) => mail1 + mail2) / (mailResponseTimes.length - 1)
    }

    public getRecentMail(user: string): ModMail | undefined {
        return this.mail.find((mail: ModMail) => mail.user_id == user && !mail.closed)
    }

    public getThreadMail(channel: string): ModMail | undefined {
        return this.mail.find((mail: ModMail) => mail.thread_id == channel)
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
            const mail = new ModMail(this, entry);
            this.mail.push(mail)
        }
    }

    public total(): number {
        return this.mail.length
    }

    public totalOpen(): number {
        return this.mail.filter((mail: ModMail) => !mail.closed).length
    }
}
