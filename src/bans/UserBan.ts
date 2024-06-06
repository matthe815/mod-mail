import UserBanManager from "./UserBanManager";

export default class UserBan {
    public client: UserBanManager

    public user: string
    public guild_id: string
    public banned_by: string

    constructor(client: UserBanManager, data: UserBanData) {
        this.client = client
        this.user = data.user_id
        this.guild_id = data.guild_id
        this.banned_by = data.banned_by
    }
}

export type UserBanData = {
    user_id: string
    guild_id: string
    banned_by: string
}
