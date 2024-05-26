import {Duration} from "luxon";
import {GuildMember, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, User} from "discord.js";

export default class Utils {
    public static makeUserMembershipList(membershipList: GuildMember[]): StringSelectMenuBuilder {
        return new StringSelectMenuBuilder()
            .addOptions(
                membershipList.map((membership: GuildMember) => {
                    return new StringSelectMenuOptionBuilder()
                        .setLabel(membership.guild.name)
                        .setValue(membership.guild.id)
                })
            )
    }

    public static formatRelativeTime(milliseconds: number): string {
        // Create a Luxon Duration object from milliseconds
        const duration = Duration.fromMillis(milliseconds).rescale();

        // Extract hours and minutes from the duration
        const hours = duration.hours;
        const minutes = duration.minutes;
        const seconds = duration.seconds;

        // Build the formatted string
        let formattedString = [];
        if (hours > 0) {
            formattedString.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
        }
        if (minutes > 0) {
            formattedString.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
        }
        if (seconds > 0) {
            formattedString.push(`${seconds} ${seconds === 1 ? 'seconds' : 'seconds'}`);
        }

        // Return the formatted string
        return formattedString.join(" ");
    }

    public static async getMembership(user: User): Promise<GuildMember[]> {
        const memberships: GuildMember[] = []

        for (const guild of user.client.guilds.cache.values()) {
            const member = await guild.members.fetch(user.id).catch((e) => console.log(e))
            if (!member) continue

            memberships.push(member)
        }

        return memberships
    }
}
