import SlashCommandManager from "../SlashCommandManager";
import SlashCommand from "../SlashCommand";
import {CommandInteraction} from "discord.js";

export default class PingSlashCommand extends SlashCommand {
    constructor(manager: SlashCommandManager) {
        super(manager, {
            name: "ping",
            description: "Ping"
        });

    }

    execute(interaction: CommandInteraction) {
        super.execute(interaction);
        interaction.reply({content: "Pong!"})
    }
}
