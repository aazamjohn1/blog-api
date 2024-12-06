import { MailtrapClient } from 'mailtrap'

export const mailtrapClient = new MailtrapClient({
	// endpoint: 'https://send.api.mailtrap.io/',
	token: '164c92e8c3066348099f0b12554c4de5',
})

export const sender = {
	email: 'mailtrap@demomailtrap.com',
	name: 'Asadbek',
}
