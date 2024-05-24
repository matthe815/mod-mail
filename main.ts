import ModMailClient from "./src/ModMailClient";
import {Events, ForumChannel, Message, Partials, ThreadChannel} from "discord.js";
import Config from "./config/config.json"

const client: ModMailClient = new ModMailClient({ intents: ["GuildMembers", "DirectMessages", "Guilds", "MessageContent", "GuildMessages"], partials: [Partials.Message, Partials.Channel, Partials.ThreadMember] })

client.on(Events.ClientReady, async () => {
    console.log("Bot is online.")

    await client.mail.load()
    console.log(`Loaded ${client.mail.totalOpen()} pieces of mail.`)
})

client.on(Events.MessageCreate, async (message: Message) => {
    if (message.author.bot) return

    if (message.channel.isDMBased()) await client.replyToDM(message)
    if (message.channel.isThread()) await client.replyToThread(message)
})

client.on(Events.ThreadUpdate, async (last, now) => {
    const mail = client.mail.getThreadMail(now.id)
    if (!mail) return

    mail.setClosed(!!now.archived)

    if (mail.closed) {
        await mail.reply({
            content: "This ticket has been closed, if you have any future inquiries please open another ticket."
        })
        return
    }

    const newTags = now.appliedTags.filter((tag) => !last.appliedTags.includes(tag))
    if (!(now.parent instanceof ForumChannel)) return

    const threadParent: ForumChannel = now.parent

    if (last.appliedTags.length != now.appliedTags.length) {
        mail.reply({
            content: `This ticket has been assigned with the tag: ${threadParent.availableTags.find((tag) => tag.id == newTags[0])?.name}`
        })
    }
})

client.login(Config.token)
