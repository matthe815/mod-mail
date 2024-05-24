import {
    ActionRowBuilder, Attachment,
    Client,
    ClientOptions, Guild,
    GuildMember, Interaction,
    Message,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder, User
} from "discord.js";
import ModMailManager from "./mail/ModMailManager";
import MariaDB, {Pool} from "mariadb"
import Config from "../config/config.json"
import ModMail from "./mail/ModMail";

export default class ModMailClient extends Client {
    mail: ModMailManager
    db: Pool

    constructor(options: ClientOptions) {
        super(options)
        this.mail = new ModMailManager(this)
        this.db = MariaDB.createPool(Config.database)
    }

    public async replyToDM(message: Message) {
        const userGuilds: GuildMember[] = await this.getAllUserMembership(message.author)
        const recentMail = this.mail.getRecentMail(message.author.id)

        if (recentMail != undefined) {
            recentMail.send(message)
            return
        }

        if (userGuilds.length == 1) {
            const mail = this.mail.create(message.author)
            const thread = await mail.makeInitialThread(userGuilds[0].guild, message.author)
            if (!thread) return
            mail.setThread(thread)
            await mail.commit()
            await mail.send(message)
            await message.reply(`Thank you for your inquiry, your ticket ID is #${mail.mail_uuid}. The average response time is ${Math.floor(await this.mail.getAverageResponseTime(userGuilds[0].guild))} seconds.`)
            return
        }

        const serverSelector: StringSelectMenuBuilder = new StringSelectMenuBuilder()
            .addOptions(
                userGuilds.map((membership: GuildMember) => {
                    return new StringSelectMenuOptionBuilder()
                        .setLabel(membership.guild.name)
                        .setValue(membership.guild.id)
                })
            )
            .setCustomId("mod_mail")

        const actionRowBuilder: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(serverSelector)

        const response = await message.reply({
            content: "You are in multiple servers with the bot, please select the one you wish to send mail to.",
            components: [actionRowBuilder]
        })

        const filter = (interaction: Interaction) => message.author.id === interaction.user.id
        const guildReply = await response.awaitMessageComponent({ filter, time: 60_000 })

        const mail = await this.handleInteraction(guildReply)
        if (!mail) return
        await message.reply(`Thank you for your inquiry, your ticket ID is #${mail.mail_uuid}. The average response time is ${Math.floor(await this.mail.getAverageResponseTime(userGuilds[0].guild))} seconds.`)
    }

    public async handleInteraction(interaction: Interaction): Promise<ModMail | undefined> {
        if (!interaction.isStringSelectMenu()) return;
        if (interaction.customId != "mod_mail") return;

        const guild: Guild | undefined = this.guilds.cache.get(interaction.values[0])
        if (!guild) return

        const mail = this.mail.create(interaction.user)
        const thread = await mail.makeInitialThread(guild, interaction.user)
        if (!thread) return

        mail.setThread(thread)
        await mail.commit()

        if (!mail) {
            interaction.reply("Something went wrong attempting to send your mail.")
            return
        }

        const userMessage = interaction.channel?.messages.cache.find((message: Message) => message.author.id == interaction.user.id)
        if (!userMessage) {
            interaction.reply("Something went wrong attempting to send your mail.")
            return
        }

        mail.send(userMessage)
        return mail
    }

    public async replyToThread(message: Message) {
        const modMail = this.mail.getThreadMail(message.channel.id)
        if (!modMail) return


        modMail.reply({
            content: `[${message.author.username}] ${message.content}`,
            files: message.attachments.map((attachment: Attachment) => attachment.url)
        })
    }

    public async getAllUserMembership(user: User): Promise<GuildMember[]> {
        const memberships: GuildMember[] = []

        for (const guild of this.guilds.cache.values()) {
            const member = await guild.members.fetch(user.id)
            if (!member) continue

            memberships.push(member)
        }

        return memberships
    }
}