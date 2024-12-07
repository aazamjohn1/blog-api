import nodemailer from 'nodemailer'

const sendEmail = async (msg: any) => {
	try {
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: 'aazamjohn1@gmail.com', // Your Gmail address
				pass: 'rqtb zdho zgqm qbcj', // Gmail app password
			},
		})

		const mailOptions = msg

		const info = await transporter.sendMail(mailOptions)
		console.log('Email sent: ' + info.response)
	} catch (error) {
		console.error('Error sending email:', error)
	}
}
export default sendEmail
