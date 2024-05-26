import ModMail, {RelayDirection} from "./mail/ModMail";
import {Guild, Interaction, Message} from "discord.js";
import ModMailClient from "./ModMailClient";

export default class EventSystem {
    public static client: ModMailClient

    public static async onInteraction(interaction: Interaction): Promise<void> {
        if (interaction.isStringSelectMenu()) {
            switch (interaction.customId) {
                case "mod_mail":
                    if (!interaction.channel || !interaction.channel.isDMBased()) return

                    const guild: Guild | undefined = EventSystem.client.guilds.cache.get(interaction.values[0])
                    if (!guild) return

                    const mail: ModMail = EventSystem.client.mail.create(interaction.user)

                    await mail.makeInitialThread(guild, interaction.user)
                    await mail.commit()

                    const userMessage = interaction.channel.messages.cache.find((message: Message) => message.author.id == interaction.user.id)
                    if (!userMessage) return

                    await mail.relay(userMessage, RelayDirection.Staff)
                    break;
            }
        }
    }
}
