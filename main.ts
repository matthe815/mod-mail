import ModMailClient from "./src/ModMailClient";
import {Events, ForumChannel, Guild, GuildForumTag, Interaction, Message, Partials} from "discord.js";
import Config from "./config/config.json"
import {TotalingFilter} from "./src/mail/ModMailManager";
import EventSystem from "./src/EventSystem";
import {RelayDirection} from "./src/mail/ModMail";

const client: ModMailClient = new ModMailClient({ intents: ["GuildMembers", "DirectMessages", "Guilds", "MessageContent", "GuildMessages"], partials: [Partials.Message, Partials.Channel, Partials.ThreadMember] })

client.on(Events.ClientReady, async () => {
    console.log("Bot is online.")

    await client.mail.load()
    await client.bans.load()
    await client.settings.load()
    await client.commands.load()
    console.log(`Loaded ${client.mail.total({ filter: TotalingFilter.Open })} pieces of mail.`)

    let count = 0;

    for (const guild of client.guilds.cache.values()) {
        if (guild.members.cache.size >= guild.memberCount) continue
        await guild.members.fetch()
        count++
    }

    console.log(`Cached ${count} oversized servers.`)
    console.log(`Loaded ${client.settings.total()} server settings`)
    console.log(`Loaded ${client.commands.total()} commands`)
})

client.on(Events.GuildCreate, (guild: Guild) => {
    client.settings.create({ guild_id: guild.id })
    console.log("I joined a server.")
})

client.on(Events.MessageCreate, async (message: Message) => {
    if (message.author.bot) return

    if (message.channel.isDMBased()) await client.onDMReply(message)
    if (message.channel.isThread()) await client.onThreadReply(message)
})

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    await EventSystem.onInteraction(interaction)
})

client.on(Events.ThreadUpdate, async (last, now) => {
    if (!(now.parent instanceof ForumChannel)) return

    const mail = client.mail.getThreadMail(now.id)
    let tagDiff: string[]
    let threadParent: ForumChannel

    if (!mail) return

    if (now.archived != undefined && mail.closed != now.archived) {
        if (now.archived) await mail.close()
        if (!now.archived) await mail.open()
        return
    }

    tagDiff = now.appliedTags.filter((tag: string) => !last.appliedTags.includes(tag))
    threadParent = now.parent

    if (last.appliedTags.length != now.appliedTags.length) {
       await mail.relay({
            content: `This ticket has been assigned with the tag: ${threadParent.availableTags.find((tag: GuildForumTag) => tag.id == tagDiff[0])?.name}`
       }, RelayDirection.User)
    }
})

client.on(Events.Error, (log) => {
    console.log(log)
})

client.login(Config.token)
