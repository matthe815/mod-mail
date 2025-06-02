import ModMailManager, { TotalingFilter } from "./ModMailManager";
import {Snowflake} from "nodejs-snowflake";
import {
    Attachment,
    Guild, Message,
    MessageCreateOptions,
    ThreadChannel,
    User
} from "discord.js";
import {PoolConnection} from "mariadb";
import Config from "../../config/config.json";
import Utils from "../Utils";

export default class ModMail {
    manager:       ModMailManager

    mail_uuid:     string = ""
    thread_id:     string = ""
    user_id:       string = ""
    guild?:        Guild
    origMessage?:  Message
    created_at:    number = 0
    updated_at:    number = 0
    response_time: number = 0
    closed:        boolean = false
    anonymous:     boolean = false

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
            closed: false,
            anonymous: false
        })
    }

    public async makeInitialThread(guild: Guild, user: User): Promise<void> {
        const forumChannel = await this.manager.client.settings.get(guild)?.getModChannel().catch((e) => console.log(e))
        let thread: ThreadChannel

        if (!forumChannel || !forumChannel.isThreadOnly()) return

        thread = await forumChannel.threads.create({
            name: `Ticket WL-${this.manager.total({ filter: TotalingFilter.All })} - ${user.username}`,
            message: {
                content: `${user.username} > <@${user.id}> [${user.id}] has opened a mod-mail ticket.`
            }
        })

        await user.send(`Thank you for your inquiry, your ticket ID is ${this.manager.client.settings.get(guild)?.short_code}-${this.manager.total({ filter: TotalingFilter.All })}. The average response time is ${Utils.formatRelativeTime(await this.manager.getAverageResponseTime(guild.id) * 1000)}.`)
        this.setThread(thread)
    }

    public async close(): Promise<void> {
        this.setClosed(true)
        await this.commit()

        await this.relay({ content: "This ticket has been closed, if you have any future inquiries please open another ticket." }, RelayDirection.User)
    }

    public async open(): Promise<void> {
        this.setClosed(false)
        await this.commit()

        let thread: ThreadChannel | undefined = await this.getThread()
        if (!thread) return

        await this.relay({ content: `${thread.guild.name} has reopened your ticket. ${thread.name}` }, RelayDirection.User)
    }

    public setClosed(status: boolean): ModMail {
        this.closed = status
        return this
    }

    public setAnonymous(state: boolean): ModMail {
        this.anonymous = state
        return this
    }

    public setThread(thread: ThreadChannel | string): ModMail {
        this.thread_id = (thread instanceof ThreadChannel) ? thread.id : thread;
        return this
    }

    public async getThread(): Promise<ThreadChannel | undefined> {
        const thread = await this.manager.client.channels.fetch(this.thread_id)
        if (!thread || !thread.isThread()) return
        return thread
    }

    public setUser(user: User | string): ModMail {
        this.user_id = (user instanceof User) ? user.id : user
        return this;
    }

    public async getUser(): Promise<User> {
        return await this.manager.client.users.fetch(this.user_id)
    }

    public async relay(message: MessageCreateOptions | Message, direction: RelayDirection) {
        let messageOptions: MessageCreateOptions

        messageOptions = {
            content: message.content,
            files: (message instanceof Message) ? message.attachments.map((attachment: Attachment) => attachment.url) : message.files
        }

        switch (direction) {
            case RelayDirection.User:
                await this.reply(messageOptions);
                break;
            case RelayDirection.Staff:
                await this.send(messageOptions)
                break;
        }
    }

    public async reply(message: MessageCreateOptions) {
        if (this.response_time == 0) {
            this.response_time = (new Date().getTime() - this.created_at) / 1000

            await this.manager.setThreadResponseTime(this)
            await this.commit()
        }

        const user: User = await this.getUser()
        if (user == undefined) return

        await user.send(message)
    }

    public async send(message: MessageCreateOptions) {
        const thread = await this.getThread()
        if (thread == undefined || !thread.isThread()) return

        await thread.send({
            content: message.content?.length == 0 ? "No message provided" : message.content?.replace(/(@everyone|@here)/g, '[@]everyone'),
            files:  message.files
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
        this.anonymous = entry.anonymous
    }

    public async commit() {
        const connection: PoolConnection = await this.manager.client.db.getConnection()
        await connection.execute("INSERT INTO modmail_mail(mail_uuid, thread_id, user_id, response_time, closed, anonymous) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE closed = VALUES(closed), response_time = VALUES(response_time), anonymous = VALUES(anonymous)", [ this.mail_uuid, this.thread_id, this.user_id, this.response_time, this.closed, this.anonymous ])
    }
}

export enum RelayDirection {
    User,
    Staff
}

export type ModMailData = {
    mail_uuid:  string
    thread_id:  string
    user_id:    string
    created_at: number
    updated_at: number
    response_time:   number
    closed:     boolean
    anonymous:  boolean
}
