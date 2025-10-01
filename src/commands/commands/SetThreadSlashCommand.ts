import SlashCommandManager from "../SlashCommandManager";
import SlashCommand from "../SlashCommand";
import {ForumChannel, ChannelType, CommandInteraction, CommandInteractionOptionResolver} from "discord.js";

export default class SetThreadChannelCommand extends SlashCommand {
    constructor(manager: SlashCommandManager) {
        super(manager, {
            name: "threadchannel",
            description: "Set the thread channel to this channel."
        });

        this.builder
            .addChannelOption(option => option
                .setName("channel")
                .setDescription("Channel to forward to")
                .setRequired(true)
            )
            .addBooleanOption(option => option
                .setName("setup")
                .setDescription("Overwrite the channel to bot preferred settings")
                .setRequired(true)
            )
            .setDefaultMemberPermissions(0x10)
    }

    execute(interaction: CommandInteraction) {
        super.execute(interaction);
        if (!interaction.guild || !(interaction.options instanceof CommandInteractionOptionResolver)) return

        const settings = this.manager.client.settings.get(interaction.guild)
        if (!settings) return

        const options: CommandInteractionOptionResolver = interaction.options
        const channel: ForumChannel = options.getChannel("channel", true, [ChannelType.GuildForum])
        const setup:   boolean      = options.getBoolean("setup", true)

        if (setup) {
            channel.setAvailableTags([{ name: "Resolved" }])
        }

        settings.setModMailChannel(channel.id)
        settings.commit()

        interaction.reply({ content: `:white_check_mark: The mod-mail channel has been set to \`${channel.name}\`.`, flags: 64})
    }
}
