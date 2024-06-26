import SlashCommandManager from "../SlashCommandManager";
import SlashCommand from "../SlashCommand";
import {CommandInteraction} from "discord.js";
import {RelayDirection} from "../../mail/ModMail";

export default class UnBanSlashCommand extends SlashCommand {
    constructor(manager: SlashCommandManager) {
        super(manager, {
            name: "threadunban",
            description: "Unban the originator of the thread from making new ones."
        });

        this.builder.setDefaultMemberPermissions(0x4)
    }

    execute(interaction: CommandInteraction) {
        super.execute(interaction);
        if (!interaction.channel || !interaction.channel.isThread()) return

        const currentMail = this.manager.client.mail.getThreadMail(interaction.channel.id)
        if (!currentMail) return

        currentMail.setClosed(true)
        currentMail.commit()

        this.manager.client.bans.unban(currentMail.user_id, interaction.guildId || "")

        currentMail.relay({ content: `You have been unbanned from sending Mod Mail messages in ${interaction.guild?.name}.` }, RelayDirection.User)
        interaction.reply({ content: `The user has been unbanned from making mod mail.`, flags: 64 }).then(() => {
            if (!interaction.channel || !interaction.channel.isThread()) return
            interaction.channel.setArchived(true)
        })
    }
}

