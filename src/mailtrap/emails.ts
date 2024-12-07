import {
	PASSWORD_RESET_REQUEST_TEMPLATE,
	PASSWORD_RESET_SUCCESS_TEMPLATE,
	VERIFICATION_EMAIL_TEMPLATE,
} from './emailTemplates'

import sendEmail from './mailtrap.config'

const sender = process.env.SENDER_EMAIL || 'aazamjohn1@gmail.com'
export const sendVerificationEmail = async (
	email: string,
	verificationToken: string
) => {
	const recipient = [{ email }]

	try {
		const msg = {
			from: sender,
			to: recipient,
			subject: 'Verify your email',
			html: VERIFICATION_EMAIL_TEMPLATE.replace(
				'{verificationCode}',
				verificationToken
			),
			category: 'Email Verification',
		}
		const response = await sendEmail(msg)

		console.log('Email sent successfully', response)
	} catch (error) {
		console.error(`Error sending verification`, error)

		throw new Error(`Error sending verification email: ${error}`)
	}
}

export const sendPasswordResetEmail = async (
	email: string,
	resetURL: string
) => {
	const recipient = [{ email }]

	try {
		const msg = {
			from: sender,
			to: recipient,
			subject: 'Reset your password',
			html: PASSWORD_RESET_REQUEST_TEMPLATE.replace('{resetURL}', resetURL),
			category: 'Password Reset',
		}
		const response = await sendEmail(msg)
		console.log('Email sent successfully', response)
	} catch (error) {
		console.error(`Error sending password reset email`, error)

		throw new Error(`Error sending password reset email: ${error}`)
	}
}

export const sendResetSuccessEmail = async (email: string) => {
	const recipient = [{ email }]

	try {
		const msg = {
			from: sender,
			to: recipient,
			subject: 'Password Reset Successful',
			html: PASSWORD_RESET_SUCCESS_TEMPLATE,
			category: 'Password Reset',
		}

		const response = await sendEmail(msg)
		console.log('Password reset email sent successfully', response)
	} catch (error) {
		console.error(`Error sending password reset success email`, error)

		throw new Error(`Error sending password reset success email: ${error}`)
	}
}
