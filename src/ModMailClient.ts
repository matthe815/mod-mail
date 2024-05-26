import {
    ActionRowBuilder,
    Attachment,
    Client,
    ClientOptions,
    GuildMember,
    Message,
    StringSelectMenuBuilder,
    ThreadChannel,
    User
} from "discord.js";
import ModMailManager, {TotalingFilter} from "./mail/ModMailManager";
import MariaDB, {Pool} from "mariadb"
import Config from "../config/config.json"
import ModMail, {RelayDirection} from "./mail/ModMail";
import UserBanManager from "./bans/UserBanManager";
import Utils from "./Utils";
import EventSystem from "./EventSystem";

export default class ModMailClient extends Client {
    mail: ModMailManager
    bans: UserBanManager

    db: Pool

    constructor(options: ClientOptions) {
        super(options)
        EventSystem.client = this

        this.mail = new ModMailManager(this)
        this.bans = new UserBanManager(this)
        this.db = MariaDB.createPool(Config.database)
    }

    public async onDMReply(message: Message) {
        const userMembership: GuildMember[] = await this.getAllUserMembership(message.author)
        const currentMail = this.mail.getRecentMail(message.author.id)

        if (currentMail != undefined) {
            await currentMail.relay(message, RelayDirection.Staff)
            return
        }

        let mail:             ModMail | undefined
        let thread:           ThreadChannel | undefined
        let stringMenu:       StringSelectMenuBuilder | undefined
        let actionRowBuilder: ActionRowBuilder<StringSelectMenuBuilder> | undefined

        switch(userMembership.length) {
            case 0:
                await message.reply("You have no servers of which you can submit mail into.")
                return;
            case 1:
                mail = this.mail.create(message.author)
                await mail.makeInitialThread(userMembership[0].guild, message.author)
                if (!thread) return

                await mail.commit()
                await mail.relay(message, RelayDirection.Staff)
                break;
            default:
                stringMenu = (Utils.MakeUserMembershipList(userMembership)).setCustomId("mod_mail")
                actionRowBuilder = (new ActionRowBuilder<StringSelectMenuBuilder>()).addComponents(stringMenu)

                await message.reply({
                    content: "You are in multiple servers with the bot, please select the one you wish to send mail to.",
                    components: [actionRowBuilder]
                })
                break;
        }

        await message.reply(`Thank you for your inquiry, your ticket ID is WL-${this.mail.total({ filter: TotalingFilter.All })}. The average response time is ${Utils.formatRelativeTime(await this.mail.getAverageResponseTime(userMembership[0].guild.id) * 1000)}.`)
    }

    public async replyToThread(message: Message) {
        const modMail = this.mail.getThreadMail(message.channel.id)
        if (!modMail) return

        switch (message.content) {
            case ">>ban":
                if (!message.guild) return
                if (!message.channel.isThread()) return

                modMail.setClosed(true)
                message.channel.setArchived(true)

                await modMail.commit()
                await this.bans.ban(message.author.id, message.guild.id)
                await modMail.reply({ content: "You have been banned from sending Mod Mail messages." })
                return
            case ">>unban":
                if (!message.guild) return
                if (!message.channel.isThread()) return

                await this.bans.unban(message.author.id, message.guild.id)
                await modMail.reply({ content: "You have been unbanned from sending Mod Mail messages." })
                return
        }

        if (modMail.closed) return

        await modMail.reply({
            content: `[${message.author.username}] ${message.content}`,
            files: message.attachments.map((attachment: Attachment) => attachment.url)
        })
    }

    public async getAllUserMembership(user: User): Promise<GuildMember[]> {
        const memberships: GuildMember[] = []

        for (const guild of this.guilds.cache.values()) {
            try {
                const member = await guild.members.fetch(user.id)
                if (!member) continue
                if (this.bans.has(member.id, member.guild.id)) continue

                memberships.push(member)
            } catch (e) {}
        }

        return memberships
    }
}
