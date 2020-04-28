import axios from 'axios'
import { BASE_API_URL } from '../config/index.mjs'

export const getAccounts = async validToken => {
	const accountsResponse = await axios.get(`${BASE_API_URL}/accounts`, {
		headers: {
			'Authorization': `Bearer ${validToken}`
		}
	})
	if (!accountsResponse || accountsResponse.status !== 200) {
		throw new Error('Accounts API call failed, please try again in a few minutes')
	}
	return accountsResponse.data
}