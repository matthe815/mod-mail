import SlashCommandManager from "../SlashCommandManager";
import SlashCommand from "../SlashCommand";
import {ForumChannel, ChannelType, CommandInteraction, CommandInteractionOptionResolver} from "discord.js";

export default class SetThreadChannelCommand extends SlashCommand {
    constructor(manager: SlashCommandManager) {
        super(manager, {
            name: "shortcode",
            description: "Set the short code for the server"
        });

        this.builder
            .addStringOption(option => option
                .setName("code")
                .setDescription("A short multi-letter short code for mail titles")
                .setRequired(true)
            ).setDefaultMemberPermissions(0x10)
    }

    execute(interaction: CommandInteraction) {
        super.execute(interaction);
        if (!interaction.guild || !(interaction.options instanceof CommandInteractionOptionResolver)) return

        const settings = this.manager.client.settings.get(interaction.guild)
        if (!settings) return

        const options: CommandInteractionOptionResolver = interaction.options
        const shortcode: string = options.getString("shortcode", true)

        settings.short_code = shortcode
        settings.commit()

        interaction.reply({ content: `:white_check_mark: The servers' modmail shortcode has been changed to \`${shortcode}\`.`, flags: 64})
    }
}
