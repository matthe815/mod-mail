import GuildSettings, { GuildSettingsData } from "./GuildSettings";
import {Guild} from "discord.js";
import ModMailClient from "../ModMailClient";

export default class GuildSettingsManager {
    client: ModMailClient
    private settings: GuildSettings[]

    constructor(client: ModMailClient) {
        this.client = client
        this.settings = []
    }


    public async load() {
        const connection = await this.client.db.getConnection()
        const rows: GuildSettings[] = await connection.query("SELECT * FROM modmail_settings")

        for (const row of rows) {
            this.settings.push(new GuildSettings(this, { guild_id: row.guild_id, modmail_channel: row.modmail_channel }))
        }
    }

    public create(data: GuildSettingsData) {
        const settings = new GuildSettings(this, data)
        this.settings.push(settings)

        settings.commit()
    }

    public get(guild: Guild): GuildSettings | undefined {
        return this.settings.find((setting: GuildSettings) => setting.guild_id == guild.id)
    }

    public total(): number {
        return this.settings.length
    }
}
