import { getAuthToken, getAuthorizationCode } from './auth/index.mjs'
import { getAccounts } from './api/accounts.mjs'

// Encapsulating function to access async/await and make code more readable
const main = async () => await Promise.resolve()

main().then(async () => {
    try {
        const authorizationCode = await getAuthorizationCode()
        const { access_token } = await getAuthToken(authorizationCode)
        // we will not need to use refresh_token here since the token we get will always be valid & used straight away
        
        const accounts = await getAccounts(access_token)
        console.log('All accounts:')
        console.table(accounts)
    } catch (err) {
        console.log('An error occured while trying to get accounts. Please try again later.')
        console.error(err.message)
    }
})