import {
    CommandInteraction,
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
