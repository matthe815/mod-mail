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
                    mail.guild = guild

                    userMessage = interaction.channel.messages.cache.find((message: Message) => message.author.id == interaction.user.id)
                    if (!userMessage) return
                    mail.origMessage = userMessage

                    interaction.reply(`You have chosen to send mod mail to ${guild.name}.`)
                    await this.client.onMailOpen(userMessage)
                    break;
                case "mod_mail_open":
                    if (!interaction.channel || !interaction.channel.isDMBased()) return

                    mail = this.client.mail.getRecentMail(interaction.user.id) || null
                    if (!mail || !mail.guild || !mail.origMessage) {
                        interaction.reply('Failed to create mail')
                        return
                    }

                    userMessage = mail.origMessage
                    if (!userMessage) return

                    await mail.makeInitialThread(mail.guild, interaction.user)
                    await mail.commit()
                    await mail.relay(userMessage, RelayDirection.Staff)
                    await mail.relay({ content: `This user would like to: ${interaction.values[0]}` }, RelayDirection.Staff)

                    interaction.reply('Your modmail has been submitted.')
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
