import SlashCommandManager from "../SlashCommandManager";
import {CommandInteraction} from "discord.js/typings";
import SlashCommand from "../SlashCommand";

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
