const escapeXpathString = string => {
	const splitedQuotes = string.replace(/'/g, `', "'", '`)
	return `concat('${splitedQuotes}', '')`
}

export const clickButtonByText = async (page, text) => {
	const escapedText = escapeXpathString(text)
	const linkHandlers = await page.$x(`//button[contains(text(), ${escapedText})]`)

	if (linkHandlers.length > 0) {
		await linkHandlers[0].click()
	} else {
		console.log(`Link not found: ${text}`)
	}
}

// makes sure that an element with the following innerText is in the DOM
export const ensureThatElementIsLoaded = async (page, elementText) => {
	await page.waitForFunction(
		`document.querySelector("body").innerText.includes("${elementText}")`
	)
}