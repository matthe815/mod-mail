import GuildSettingsManager from "./GuildSettingsManager";

export default class GuildSettings {
    public manager: GuildSettingsManager
    public guild_id: string = ""
    public modmail_channel: string = ""

    constructor(manager: GuildSettingsManager, data: GuildSettingsData) {
        this.manager = manager
        this.guild_id = data.guild_id

        if (data.modmail_channel) this.modmail_channel = data.modmail_channel
    }

    public setModMailChannel(channel_id: string): GuildSettings {
        this.modmail_channel = channel_id
        return this
    }
}

export type GuildSettingsData = {
    guild_id: string
    modmail_channel?: string
}
