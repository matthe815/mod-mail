import {
    ActionRowBuilder,
    Attachment,
    Client,
    ClientOptions,
    GuildMember,
    Message,
    StringSelectMenuBuilder
} from "discord.js";
import ModMailManager from "./mail/ModMailManager";
import MariaDB, {Pool} from "mariadb"
import Config from "../config/config.json"
import ModMail, {RelayDirection} from "./mail/ModMail";
import UserBanManager from "./bans/UserBanManager";
import Utils from "./Utils";
import EventSystem from "./EventSystem";
import GuildSettingsManager from "./settings/GuildSettingsManager";
import SlashCommandManager from "./commands/SlashCommandManager";
import PingSlashCommand from "./commands/commands/PingSlashCommand";
import SetThreadChannelCommand from "./commands/commands/SetThreadSlashCommand";
import BanSlashCommand from "./commands/commands/BanSlashCommand";
import UnBanSlashCommand from "./commands/commands/UnBanSlashCommand";
import AnonymizeSlashCommand from "./commands/commands/AnonymizeSlashCommand";
import FeedbackCommand from "./commands/commands/FeedbackCommand";

export default class ModMailClient extends Client {
    mail: ModMailManager
    settings: GuildSettingsManager
    commands: SlashCommandManager
    bans: UserBanManager
    db: Pool

    constructor(options: ClientOptions) {
        super(options)
        EventSystem.client = this

        this.mail = new ModMailManager(this)
        this.bans = new UserBanManager(this)
        this.settings = new GuildSettingsManager(this)
        this.commands = new SlashCommandManager(this)
        this.db = MariaDB.createPool(Config.database)

        this.commands.add(new PingSlashCommand(this.commands))
        this.commands.add(new SetThreadChannelCommand(this.commands))
        this.commands.add(new BanSlashCommand(this.commands))
        this.commands.add(new UnBanSlashCommand(this.commands))
        this.commands.add(new AnonymizeSlashCommand(this.commands))
        this.commands.add(new FeedbackCommand(this.commands))
    }

    public async onDMReply(message: Message): Promise<void> {
        const userMembership: GuildMember[] = (await Utils.getMembership(message.author)).filter((member: GuildMember) => !this.bans.has(member.id, member.guild.id))
        const currentMail = this.mail.getRecentMail(message.author.id)

        if (currentMail != undefined) {
            await currentMail.relay(message, RelayDirection.Staff)
            return
        }

        let mail:             ModMail | undefined
        let stringMenu:       StringSelectMenuBuilder | undefined
        let actionRowBuilder: ActionRowBuilder<StringSelectMenuBuilder> | undefined

        switch(userMembership.length) {
            case 0:
                await message.reply("You have no servers of which you can submit mail into.")
                return;
            case 1:
                mail = this.mail.create(message.author)
                mail.guild = userMembership[0].guild
                mail.origMessage = message
                await this.onMailOpen(message)
                break;
            default:
                stringMenu = (Utils.makeUserMembershipList(userMembership)).setCustomId("mod_mail")
                actionRowBuilder = (new ActionRowBuilder<StringSelectMenuBuilder>()).addComponents(stringMenu)

                await message.reply({
                    content: "You are in multiple servers with the bot, please select the one you wish to send mail to.",
                    components: [actionRowBuilder]
                })
                break;
        }
    }

    public async onThreadReply(message: Message): Promise<void> {
        const currentMail: ModMail | undefined = this.mail.getThreadMail(message.channel.id)

        if (!currentMail) return
        if (!message.guild || !message.channel.isThread()) return
        if (currentMail.closed) return

        const staffUsername: string = `[${message.author.username}]`

        await currentMail.relay({
            content: `${!currentMail.anonymous ? staffUsername : ""} ${message.content}`,
            files: message.attachments.map((attachment: Attachment) => attachment.url)
        }, RelayDirection.User)
    }

    async onMailOpen(message: Message): Promise<void> {
        const stringMenu:       StringSelectMenuBuilder = (Utils.makeDefaultOptions()).setCustomId("mod_mail_open")
        const actionRowBuilder: ActionRowBuilder<StringSelectMenuBuilder> = (new ActionRowBuilder<StringSelectMenuBuilder>()).addComponents(stringMenu)

        await message.reply({
            content: "What are you contacting the server in regards to today?",
            components: [actionRowBuilder]
        })
    }
}
