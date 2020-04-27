import fs from 'fs'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import qs from 'qs'
import puppeteer from 'puppeteer'

const privateKeyName = 'privatekey.pem' // Should be valid path to the private key
// const issuer = '127.0.0.1' // Issuer for JWT, should be derived from your redirect URL
const issuer = 'revolut-jwt-sandbox.glitch.me' // Issuer for JWT, should be derived from your redirect URL

const clientId = 'pHoAaY4WLj_kaxNWdz5JE7Ie0JU9YrTCW-WZupdiTe0' // Your client ID
// const clientId = process.env.CLIENT_ID

const aud = 'https://revolut.com' // Constant
const payload = {
  "iss": issuer,
  "sub": clientId,
  "aud": aud
}
const privateKey = fs.readFileSync(privateKeyName);
const token = jwt.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: 60 * 60});

const baseUrl = 'https://sandbox-b2b.revolut.com/api/1.0'

// const authorizationCode = 'oa_sand_nK0apyybtAd_Oa8k305KAJ4fPeEHkIVf8eR8BrIcQNs'
const authorizationCode = 'oa_sand_sXY2WibpbngT_UcDF1JDMIYpWIrT-Sni7rKoGxFSRKU'
// const authorizationCode = process.env.AUTHORIZATION_CODE

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

// const performExampleRequest = async () => {
//   const exampleRequest = await axios.post('https://jsonplaceholder.typicode.com/posts', {
//     title: 'FOO',
//     body: 'BAR',
//     userId: 1
//   });
//   console.log('exampleRequest:', exampleRequest.data)
// }

const redirectUri = 'https://revolut-jwt-sandbox.glitch.me'

const getAuthCode = async () => {
  try {
      const authCode = await axios.get(`https://sandbox-business.revolut.com/app-confirm?client_id=${clientId}&redirect_uri=${redirectUri}`)
      console.log(`https://sandbox-business.revolut.com/app-confirm?client_id=${clientId}&redirect_uri=${redirectUri}`)
      console.log(authCode, 'lol')
  } catch (e) {
    console.log('DPIOEHJDFOWQIHFDF', e)
  }
}

const escapeXpathString = str => {
  const splitedQuotes = str.replace(/'/g, `', "'", '`);
  return `concat('${splitedQuotes}', '')`;
};

const clickByText = async (page, text) => {
  const escapedText = escapeXpathString(text);
  const linkHandlers = await page.$x(`//button[contains(text(), ${escapedText})]`);

  if (linkHandlers.length > 0) {
    await linkHandlers[0].click();
  } else {
    console.log(`Link not found: ${text}`);
  }
};

const getAuthorizationCode = async () => {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
      window.open = () => null;
    });
    await page.setViewport({width:1024, height: 768})
    await page.goto(`https://sandbox-business.revolut.com/app-confirm?client_id=${clientId}&redirect_uri=${redirectUri}`);
    await page.waitForNavigation({ waitUntil: 'networkidle2' })
    await clickByText(page, `Log in with email`);

    const elementHandle = await page.$('input');
    await elementHandle.type('triveryhard@gmail.com');
    await page.keyboard.press("Tab", { delay: 100 });
    await page.keyboard.type("Dindondindon1!")

    await page.keyboard.press("Tab", { delay: 100 });
    await page.keyboard.press("Tab", { delay: 100 });
    await page.keyboard.press("Enter", { delay: 100 });

    await page.waitForNavigation({ waitUntil: 'networkidle2' })

    await page.waitForFunction(
      'document.querySelector("body").innerText.includes("Authorise")'
    );
    await page.screenshot({path: 'screenshot.png', fullPage: true });

    await clickByText(page, `Authorise`);
    await page.waitForNavigation({ waitUntil: 'networkidle2' })

    await page.waitForFunction(
      'document.querySelector("body").innerText.includes("Continue")'
    );
    await clickByText(page, `Continue`);

    await page.waitForNavigation({ waitUntil: 'networkidle2' })
    await page.waitForNavigation({ waitUntil: 'networkidle2' })

    const authorizationCode = page.url().match(/(?<=\=)(.*?)(?=&)/)

    console.log(authorizationCode, authorizationCode[0], 'AUTH CODE')
    return authorizationCode[0]
};

export const getAuthToken = async (grantType, additionalOpts = {}) => {
  try {
    const authTokenParams = {
      grant_type: grantType,
      client_id: clientId,
      client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
      client_assertion: token,
      ...additionalOpts,
    }
    console.log(authTokenParams, 'PARAMS')
    // const options = {
    //   method: 'POST',
    //   headers: { 'content-type': 'application/x-www-form-urlencoded' },
    //   data: qs.stringify(authTokenParams),
    //   url: `${baseUrl}/auth/token`,
    // };
    // const authTokenInformations = await axios(options);
    const authTokenInformations = await axios.post(`${baseUrl}/auth/token`, qs.stringify(authTokenParams));
    return authTokenInformations
  } catch (e) {
    console.log('auth code error:', e)
  }
}

const getAccounts = async validToken => {
  try {
    const accounts = await axios.get(`${baseUrl}/accounts`, {
      headers: {
        'Authorization': `Bearer ${validToken}`
      }
    })
    console.log('accounts', accounts)
  } catch (e) {
    console.log('ERR getAccounts', e)
  }
}


// new Date() a la rep de l'api, puis comparer new Date() + expires_in, si > alors request refresh token
// axios interceptor 

const sup = getAuthToken('authorization_code', { code: getAuthorizationCode() })
  .then(res => console.log('REZ', res))
  .catch(e => console.log('HERR', e))

// getAuthCode()
// getAuthorizationCode()