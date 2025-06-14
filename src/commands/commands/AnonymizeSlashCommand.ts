import SlashCommandManager from "../SlashCommandManager";
import SlashCommand from "../SlashCommand";
import {CommandInteraction} from "discord.js";

export default class AnonymizeSlashCommand extends SlashCommand {
    constructor(manager: SlashCommandManager) {
        super(manager, {
            name: "anonymous",
            description: "Turn this thread into an anonymous one."
        });

        this.builder.setDefaultMemberPermissions(0x4)
    }

    execute(interaction: CommandInteraction) {
        super.execute(interaction);
        if (!interaction.channel || !interaction.channel.isThread()) return

        const currentMail = this.manager.client.mail.getThreadMail(interaction.channel.id)
        if (!currentMail) return

        currentMail.setAnonymous(!currentMail.anonymous)
        currentMail.commit()

        if (currentMail.anonymous) {
            interaction.reply({ content: `This thread has been made anonymous by ${interaction.user.displayName}.`})
        } else {
            interaction.reply({ content: `This thread has been made unanonymous by ${interaction.user.displayName}.`})
        }
    }
}
