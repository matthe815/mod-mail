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

                    if (this.client.bans.has(interaction.user.id, guild.id)) {
                        interaction.reply("You cannot pick a server you've been banned from.")
                        return
                    }

                    const mail: ModMail = EventSystem.client.mail.create(interaction.user)

                    await mail.makeInitialThread(guild, interaction.user)
                    await mail.commit()

                    const userMessage = interaction.channel.messages.cache.find((message: Message) => message.author.id == interaction.user.id)
                    if (!userMessage) return

                    interaction.reply(`You have chosen to send mod mail to ${guild.name}.`)
                    await mail.relay(userMessage, RelayDirection.Staff)
                    break;
            }
        }
        if (interaction.isCommand()) {
            const command = interaction.commandName
            const slashCommand = this.client.commands.get(command)
            if (!slashCommand) return

            slashCommand.execute(interaction)
        }
    }
}
