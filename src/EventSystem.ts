import ModMail, {RelayDirection} from "./mail/ModMail";
import {Guild, Interaction, Message} from "discord.js";
import ModMailClient from "./ModMailClient";

export default class EventSystem {
    public static client: ModMailClient

    public static async onInteraction(interaction: Interaction): Promise<void> {
        let mail:        ModMail | null = null
        let userMessage: Message<boolean> | undefined

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

                    mail = EventSystem.client.mail.create(interaction.user)
                    mail.guild_id = guild.id

                    userMessage = interaction.channel.messages.cache.find((message: Message) => message.author.id == interaction.user.id)
                    if (!userMessage) return

                    interaction.reply(`You have chosen to send mod mail to ${guild.name}.`)
                    await this.client.onMailOpen(userMessage)
                    break;
                case "mod_mail_open":
                    if (!interaction.channel || !interaction.channel.isDMBased()) return
                    mail = EventSystem.client.mail.create(interaction.user)

                    userMessage = interaction.channel.messages.cache.find((message: Message) => message.author.id == interaction.user.id)
                    if (!userMessage) return

                    const targetGuild: Guild = await this.client.guilds.fetch(mail.guild_id || '')
                    console.log(targetGuild)
                    await mail.makeInitialThread(targetGuild, interaction.user)
                    await mail.commit()
                    await mail.relay(userMessage, RelayDirection.Staff)

                    interaction.reply('Your mod-mail has been sent.')
                    break
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
