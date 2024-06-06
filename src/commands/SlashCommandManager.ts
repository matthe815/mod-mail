import SlashCommand from "./SlashCommand";
import ModMailClient from "../ModMailClient";
import {Routes} from "discord.js";
import Config from "../../config/config.json"

export default class SlashCommandManager {
    public client: ModMailClient

    private commands: SlashCommand[]

    constructor(client: ModMailClient) {
        this.client = client
        this.commands = []
    }

    public add(command: SlashCommand) {
        this.commands.push(command)
    }

    public async load() {
        const commands = []

        for (const command of this.commands) {
            commands.push(command.register().toJSON())
        }

        await this.client.rest.put(Routes.applicationCommands(Config.client_id), { body: commands })
    }

    public total(): number {
        return this.commands.length
    }

    public get(name: string): SlashCommand | undefined {
        return this.commands.find((command: SlashCommand) => command.name == name)
    }
}
