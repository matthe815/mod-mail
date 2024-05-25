import ModMailManager from "./ModMailManager";
import {Snowflake} from "nodejs-snowflake";
import {
    Attachment,
    Channel,
    Guild,
    Message,
    MessageCreateOptions,
    MessagePayload,
    ThreadChannel,
    User
} from "discord.js";
import {PoolConnection} from "mariadb";
import Config from "../../config/config.json";

export default class ModMail {
    manager:       ModMailManager

    mail_uuid:     string = ""
    thread_id:     string = ""
    user_id:       string = ""
    created_at:    number = 0
    updated_at:    number = 0
    response_time: number = 0
    closed:        boolean = false

    constructor(manager: ModMailManager, entry: ModMailData) {
        this.manager = manager
        this.set(entry)
    }

    public static create(manager: ModMailManager): ModMail {
        const mail_uuid = (new Snowflake()).getUniqueID()

        return new ModMail(manager, {
            mail_uuid: mail_uuid.toString(),
            response_time: 0,
            thread_id: "",
            user_id: "",
            created_at: new Date().getTime(),
            updated_at: new Date().getTime(),
            closed: false
        })
    }

    public async makeInitialThread(guild: Guild, user: User): Promise<ThreadChannel | undefined> {
        const forumChannel = guild.channels.cache.get(Config.modMailChannel)

        if (!forumChannel) return
        if (!forumChannel.isThreadOnly()) return

        return await forumChannel.threads.create({
            name: `Ticket WL-${this.manager.total()} - ${user.username}`,
            message: {
                content: `${user.username} has opened a mod-mail ticket.`
            }
        })
    }

    public setClosed(status: boolean): ModMail {
        this.closed = status
        return this;
    }

    public setThread(thread: ThreadChannel): ModMail {
        this.thread_id = thread.id;
        return this;
    }

    public async getThread(): Promise<ThreadChannel | undefined> {
        const thread = await this.manager.client.channels.fetch(this.thread_id)
        if (!thread || !thread.isThread()) return
        return thread
    }

    public setUser(user: User): ModMail {
        this.user_id = user.id
        return this;
    }

    public getUser(): Promise<User> {
        return this.manager.client.users.fetch(this.user_id)
    }

    public async relay(message: MessageCreateOptions, direction: any) {
        // TODO; Implement relay.
    }

    public async reply(message: MessageCreateOptions) {
        if (this.response_time == 0) {
            this.response_time = (new Date().getTime() - this.created_at) / 1000
            await this.commit()
        }

        const user = await this.getUser()
        if (user == undefined) return

        await user.send(message)
    }

    public async send(message: MessageCreateOptions) {
        const thread = await this.getThread()
        if (thread == undefined || !thread.isThread()) return

        thread.send({
            content: message.content?.length == 0 ? "No message provided" : message.content?.replace(/(@everyone|@here)/g, '[@]everyone'),
            files:  message.files //message.attachments.map((attachment: Attachment) => attachment.url)
        })
    }

    public set(entry: ModMailData) {
        this.mail_uuid = entry.mail_uuid
        this.thread_id = entry.thread_id
        this.user_id = entry.user_id
        this.created_at = entry.created_at
        this.updated_at = entry.updated_at
        this.response_time = entry.response_time
        this.closed = entry.closed
    }

    public async commit() {
        const connection: PoolConnection = await this.manager.client.db.getConnection()
        await connection.execute("INSERT INTO modmail_mail(mail_uuid, thread_id, user_id, response_time, closed) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE closed = VALUES(closed), response_time = VALUES(response_time)", [ this.mail_uuid, this.thread_id, this.user_id, this.response_time, this.closed ])
    }
}

export type ModMailData = {
    mail_uuid:  string
    thread_id:  string
    user_id:    string
    created_at: number
    updated_at: number
    response_time:   number
    closed:     boolean
}
