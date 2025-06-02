import {
    CommandInteraction,
    EmbedBuilder,
    SlashCommandStringOption,
    TextBasedChannel
} from "discord.js";
import SlashCommand from "../SlashCommand";
import SlashCommandManager from "../SlashCommandManager";

export default class FeedbackCommand extends SlashCommand {
    constructor(manager: SlashCommandManager) {
        super(manager, {
            name: "feedback",
            description: "Send feedback in regards to an experiment"
        });

        this.builder
            .addStringOption((option: SlashCommandStringOption) => option
                .setName("feedback")
                .setDescription("The feedback for which to send")
                .setRequired(true)
            )
    }

    execute(interaction: CommandInteraction): void {
        const feedback: string = String(interaction.options.get("feedback", true).value)

        const modal = new EmbedBuilder()
            .setTitle("New Feedback")
            .setDescription(feedback)
            .addFields([
                { name: 'User', value: `${interaction.user.username} (${interaction.user.id})`, inline: true },
                { name: 'Guild', value: `${interaction.guild?.name} (${interaction.guild?.id})`, inline: true}
            ])
        
        const channel: TextBasedChannel = this.manager.client.channels.resolve('645108836423958540') as TextBasedChannel
        channel.send({ embeds: [modal] })
        interaction.reply({ content: ":white_check_mark: Your feedback has been sent!", flags: "Ephemeral" })
    }
}
