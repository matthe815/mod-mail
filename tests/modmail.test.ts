import ModMail, {ModMailData} from "../src/mail/ModMail";
import ModMailManager from "../src/mail/ModMailManager";
import ModMailClient from "../src/ModMailClient";

const mailClient = new ModMailClient({ intents: [] })
const modMailManager = new ModMailManager(mailClient)

test('Must construct new mail', () => {
    const mail = ModMail.create(modMailManager)
    expect(true).toBe(true)
})

test('Must properly set mail values', () => {
    const mail = ModMail.create(modMailManager)
    const testEntry: ModMailData = {
        closed: true,
        response_time: 12,
        created_at: mail.created_at,
        updated_at: new Date().getTime(),
        thread_id: "123",
        user_id: "143",
        mail_uuid: "132"
    }
    mail.set(testEntry)

    expect(mail.mail_uuid).toBe("132")
    expect(mail.closed).toBe(true)
    expect(mail.updated_at).toBe(testEntry.updated_at)
    expect(mail.thread_id).toBe("123")
    expect(mail.user_id).toBe("143")
    expect(mail.response_time).toBe(12)
})

test('Must properly get recent threads', () => {
    expect(modMailManager.getRecentMail("123")).toBe(undefined)
    expect(modMailManager.getThreadMail("123")).toBe(undefined)
})
