import fs from 'fs'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import qs from 'qs'
import puppeteer from 'puppeteer'
import dotenv from 'dotenv'

import { BASE_API_URL, JWT_ISSUER, PRIVATE_KEY_NAME } from '../config/index.mjs'
import { clickButtonByText, ensureThatElementIsLoaded } from '../utils/puppeteer.mjs'

dotenv.config()

const clientId = process.env.CLIENT_ID

const aud = 'https://revolut.com'
const payload = {
	"iss": JWT_ISSUER,
	"sub": clientId,
	"aud": aud
}
const privateKey = fs.readFileSync(PRIVATE_KEY_NAME)
const token = jwt.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: 60 * 60 })

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'


export const getAuthorizationCode = async () => {
	const browser = await puppeteer.launch()
	const page = await browser.newPage()
	await page.evaluateOnNewDocument(() => {
		// prevents popups from opening  
		window.open = () => null
	})
	await page.setViewport({ width: 1024, height: 768 })

	const redirectUri = 'https://revolut-jwt-sandbox.glitch.me'

	await page.goto(`https://sandbox-business.revolut.com/app-confirm?client_id=${clientId}&redirect_uri=${redirectUri}`)
	await page.waitForNavigation({ waitUntil: 'networkidle2' })

	await clickButtonByText(page, 'Log in with email')

	const elementHandle = await page.$('input')
	await elementHandle.type(process.env.USER_EMAIL)
	
	await page.keyboard.press("Tab", { delay: 100 })
	await page.keyboard.type(process.env.USER_PWD)

	await page.keyboard.press("Tab", { delay: 100 })
	await page.keyboard.press("Tab", { delay: 100 })
	await page.keyboard.press("Enter", { delay: 100 })

	await page.waitForNavigation({ waitUntil: 'networkidle2' })

	// this makes sure that the Authorise button is properly loaded
	await ensureThatElementIsLoaded(page, 'Authorise')
	await clickButtonByText(page, `Authorise`)

	await page.waitForNavigation({ waitUntil: 'networkidle2' })

	await ensureThatElementIsLoaded(page, 'Continue')
	await clickButtonByText(page, `Continue`)

	await page.waitForNavigation({ waitUntil: 'networkidle2' })
	// wait for page redirection after first load
	await page.waitForNavigation({ waitUntil: 'networkidle2' })

	const authorizationCode = page.url().match(/(?<=\=)(.*?)(?=&)/)
	await browser.close()
	return authorizationCode[0]
}

export const getAuthToken = async authorizationCode => {
	const authTokenParams = {
		grant_type: 'authorization_code',
		client_id: clientId,
		client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
		client_assertion: token,
		code: authorizationCode,
	}

	const authTokenResponse = await axios.post(`${BASE_API_URL}/auth/token`, qs.stringify(authTokenParams))
	if (!authTokenResponse || authTokenResponse.status !== 200) {
		throw new Error('Auth token API call failed, please try again in a few minutes')
	}
	return authTokenResponse.data
}