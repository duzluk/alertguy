/* eslint-disable require-jsdoc */
const fetch = require('node-fetch')
const applescript = require('applescript')
const nodemailer = require('nodemailer')
const os = require('os')
const qs = require('query-string');
class Alerts {

	constructor(config) {
		this.config = config
		this.osType = os.type()
			.toLowerCase()
	}

	async sendTelegramMessage(message) {
		try {
			console.log('Sending telegram message')

			if (this.config.telegram !== undefined) {
				const { token } = this.config.telegram
				const { chatId } = this.config.telegram
				const baseUrl = `https://api.telegram.org/bot${token}`
				const urlParams = qs.stringify({
					chat_id: chatId,
					text: message,
					parse_mode: 'HTML'
				})

				const url = `${baseUrl}/sendMessage?${urlParams}`
				// const url = encodeURI(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${message}&parse_mode=HTML`)
				await fetch(url, { method: 'post' })
				// await request.post(url) // removing for v14
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
		// ONLY GMAIL and HOTMAIL SUPPORTED NOW
		try {
			console.log('Sending email message')

			if (this.config.email !== undefined) {
				const transporter = await nodemailer.createTransport({
					// host: this.config.email.host,
					// port: this.config.email.port,
					// secure: this.config.email.secure === 'true', // true for 465, false for other ports
					service: emailProvider,
					auth: {
						user: this.config.email.userEmail,
						pass: this.config.email.pass,
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

	sendImessage(guid, message) {
		if (this.getOS() !== 'Mac') {
			console.log('Script must be hosted on a Mac computer for iMessage to work')

			return false
		}

		console.log('Sending iMessage')

		const script = `tell application "Messages"
		set myid to "${guid}"
		set mymessage to "${message}"
		set theBuddy to a reference to text chat id myid
		send mymessage to theBuddy
		end tell`

		applescript.execString(script, (err, rtn) => {
			if (err) {
				console.log(`Error on sending iMessage message: ${err}`)
			}

			if (Array.isArray(rtn)) {
				for (const songName of rtn) {
					console.log(songName)
				}
			}
		})
	}

	getOS() {
		// TODO retirar e usar de cawer
		let osName = 'Other'

		if (this.osType === 'darwin') osName = 'Mac'
		else if (this.osType === 'linux') osName = 'Linux'
		else if (this.osType.indexOf('win') > -1) osName = 'Windows'

		return osName
	}

}

module.exports = Alerts

