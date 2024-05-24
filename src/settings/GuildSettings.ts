import GuildSettingsManager from "./GuildSettingsManager";

export default class GuildSettings {
    public manager: GuildSettingsManager
    public guild_id: string = ""

    constructor(manager: GuildSettingsManager, data: GuildSettingsData) {
        this.manager = manager
        this.guild_id = data.guild_id
    }
}

export type GuildSettingsData = {
    guild_id: string
}
