import dotenv from 'dotenv'
import { getAuthToken } from './auth/index.mjs'

dotenv.config()

// const sup = getAuthToken('authorization_code', { code: authorizationCode })
//   .then(res => console.log('REZ', res))
//   .catch(e => console.log('HERR', e))