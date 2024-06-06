import ModMailClient from "../ModMailClient";
import UserBan, {UserBanData} from "./UserBan";

export default class UserBanManager {
    public client: ModMailClient
    private bans: UserBan[]

    constructor(client: ModMailClient) {
        this.client = client
        this.bans = []
    }

    public async load() {
        const connection = await this.client.db.getConnection()
        const rows: UserBanData[] = await connection.query("SELECT * FROM modmail_bans")

        for (const row of rows) {
            this.bans.push(new UserBan(this, row))
        }
    }

    public async unban(user_id: string, guild_id: string) {
        const connection = await this.client.db.getConnection()
        await connection.execute("DELETE FROM modmail_bans WHERE user_id = ? AND guild_id = ?", [user_id, guild_id])

        this.bans.splice(this.bans.findIndex((ban) => ban.user == user_id && ban.guild_id == guild_id))
    }

    public async ban(user_id: string, guild_id: string, banner?: string) {
        const connection = await this.client.db.getConnection()
        await connection.execute("INSERT INTO modmail_bans(user_id, guild_id, banned_by) VALUES (?, ?, ?)", [user_id, guild_id, ""])

        this.bans.push(new UserBan(this, { user_id, guild_id, banned_by: "" }))
    }

    public has(user_id: string, guild_id: string): boolean {
        return this.bans.find((ban: UserBan) => ban.user == user_id && ban.guild_id == guild_id) != null
    }

    public total(guild: string): number {
        return this.bans.filter((ban: UserBan) => ban.guild_id == guild).length
    }
}
