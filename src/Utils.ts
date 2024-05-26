import {GuildMember, StringSelectMenuBuilder, StringSelectMenuOptionBuilder} from "discord.js/typings";
import {Duration} from "luxon";

export default class Utils {
    public static MakeUserMembershipList(membershipList: GuildMember[]): StringSelectMenuBuilder {
        return new StringSelectMenuBuilder()
            .addOptions(
                membershipList.map((membership: GuildMember) => {
                    return new StringSelectMenuOptionBuilder()
                        .setLabel(membership.guild.name)
                        .setValue(membership.guild.id)
                })
            )
    }

    public static formatRelativeTime(milliseconds: number) {
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
}
