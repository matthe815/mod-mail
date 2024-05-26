import SlashCommandManager from "../SlashCommandManager";
import SlashCommand from "../SlashCommand";
import {CommandInteraction} from "discord.js";
import {RelayDirection} from "../../mail/ModMail";

export default class BanSlashCommand extends SlashCommand {
    constructor(manager: SlashCommandManager) {
        super(manager, {
            name: "threadban",
            description: "Ban the originator of the thread from making new ones."
        });

        this.builder.setDefaultMemberPermissions(0x4)
    }

    execute(interaction: CommandInteraction) {
        super.execute(interaction);
        if (!interaction.channel || !interaction.channel.isThread()) return

        const currentMail = this.manager.client.mail.getThreadMail(interaction.channel.id)
        if (!currentMail) return

        interaction.channel.setArchived(true)

        currentMail.setClosed(true)
        currentMail.commit()

        this.manager.client.bans.ban(currentMail.user_id, interaction.guildId || "")

        currentMail.relay({ content: "You have been banned from sending Mod Mail messages." }, RelayDirection.User)
        interaction.reply({ content: `The user has been banned from making mod mail.`, flags: 64})
    }
}
