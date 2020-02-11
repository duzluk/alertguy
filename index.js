const request = require('request')
const applescript = require('applescript')
const nodemailer = require('nodemailer')

class Alerts {

	constructor(config) {

		this.config = config

	}

	async sendTelegramMessage(message) {

		try {

			console.log('Sending telegram message')

			if (this.config.telegram !== undefined) {

				const { token } = this.config.telegram
				const { chatId } = this.config.telegram
				const url = encodeURI(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${message}&parse_mode=HTML`)
				await request.post(url)
				console.log('telegram message sent')

				return true

			}

			console.log('Telegram config not found')

		} catch (error) {

			console.log(`Error on sending telegram message: ${error.stack}`)

		}

		return false

	}

	async sendEmail(emailInfo, emailProvider) {

		// ONLY GMAIL IS SUPPORTED NOW
		try {

			console.log('Sending email message')

			if (this.config.email !== undefined) {

				const transporter = await nodemailer.createTransport({
					// host: this.config.email.host,
					// port: this.config.email.port,
					// secure: this.config.email.secure === 'true', // true for 465, false for other ports
					service: emailProvider,
					auth: {
						user: this.config.email.userEmail, // generated ethereal user
						pass: this.config.email.pass, // generated ethereal password
					},
				})

				const mailOptions = {
					from: this.config.email.userEmail,
					to: this.config.email.userEmail,
					subject: emailInfo.subject,
					text: emailInfo.message,
				}

				await transporter.sendMail(mailOptions, (error, info) => {

					if (error) {

						console.log(error.stack)

					} else {

						console.log(`Email sent: ${info.response}`)

					}

				})

			}

		} catch (error) {

			console.log(`Error on sendEmail: ${error.stack}`)

		}

	}

	async sendImessage() {

		// TODO
		console.log('Sending imessage')

		// const script = 'tell application "iTunes" to get name of selection';
		const script = `tell application "Messages

		set myid to get id of first service

		set theBuddy to buddy "X" of service id myid

		send "Hi there" to theBuddy

		end tell`

		applescript.execString(script, (err, rtn) => {

			if (err) {
				// Something went wrong!
			}

			if (Array.isArray(rtn)) {

				for (const songName of rtn) {

					console.log(songName)

				}

			}

		})

	}

}

module.exports = Alerts

