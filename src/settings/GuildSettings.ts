import GuildSettingsManager from "./GuildSettingsManager";
import {ForumChannel} from "discord.js";

export default class GuildSettings {
    public manager: GuildSettingsManager
    public guild_id: string = ""
    public modmail_channel: string = ""
    public short_code: string = "WL"

    constructor(manager: GuildSettingsManager, data: GuildSettingsData) {
        this.manager = manager
        this.guild_id = data.guild_id

        if (data.modmail_channel) this.modmail_channel = data.modmail_channel
    }

    public setModMailChannel(channel_id: string): GuildSettings {
        this.modmail_channel = channel_id
        return this
    }

    public async getModChannel(): Promise<ForumChannel | undefined> {
        const channel = await this.manager.client.channels.fetch(this.modmail_channel)
        if (!channel || !(channel instanceof ForumChannel)) return
        return channel
    }

    public async commit(): Promise<void> {
        const connection = await this.manager.client.db.getConnection()
        await connection.execute("INSERT INTO modmail_settings(guild_id, modmail_channel, short_code) VALUES(?, ?) ON DUPLICATE KEY UPDATE modmail_channel = VALUES(modmail_channel), short_code = VALUES(short_code)", [this.guild_id, this.modmail_channel, this.short_code])
    }
}

export type GuildSettingsData = {
    guild_id: string
    modmail_channel?: string
}
