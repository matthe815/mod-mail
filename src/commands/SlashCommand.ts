import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    SlashCommandBuilder
} from "discord.js";
import SlashCommandManager from "./SlashCommandManager";

export default class SlashCommand {
    public manager: SlashCommandManager
    public builder: SlashCommandBuilder
    public name: string
    public description: string

    constructor(manager: SlashCommandManager, data: SlashCommandOptions) {
        this.manager = manager
        this.name = data.name
        this.description = data.description
        this.builder = new SlashCommandBuilder()
    }

    register() {
        return this.builder
            .setName(this.name)
            .setDescription(this.description)
    }

    execute(interaction: CommandInteraction) {
        console.log("Command executed")
    }
}

type SlashCommandOptions = {
    name: string
    description: string
}

export class PingSlashCommand extends SlashCommand {
    constructor(manager: SlashCommandManager) {
        super(manager, {
            name: "ping",
            description: "Ping"
        });

    }

    execute(interaction: CommandInteraction) {
        super.execute(interaction);
        interaction.reply({ content: "Pong!" })
    }
}

export class SetThreadChannelCommand extends SlashCommand {
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
            ).setDefaultMemberPermissions(0x10)
    }

    execute(interaction: CommandInteraction) {
        super.execute(interaction);
        if (!interaction.guild || !(interaction.options instanceof CommandInteractionOptionResolver)) return

        const settings = this.manager.client.settings.get(interaction.guild)
        if (!settings) return

        const options: CommandInteractionOptionResolver = interaction.options
        const channel = options.getChannel("channel")
        if (!channel) return

        settings.setModMailChannel(channel.id)
        settings.commit()

        interaction.reply({ content: `The mod-mail channel has been set to \`${channel.name}\`.`, flags: 64})
    }
}
