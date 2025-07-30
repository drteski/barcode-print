// import { NextResponse } from 'next/server';
// import puppeteer from 'puppeteer';
// import chromium from '@sparticuz/chromium';

// export const dynamic = 'force-dynamic';
// export const maxDuration = 60;

// export async function GET(request, { params }) {
// 	const { ean } = params;
// 	console.log(ean)
// 	const getGtinData = async () => {
// 		console.log(ean)
// 		chromium.setGraphicsMode = false;
// 		const browser = await puppeteer.launch({
// 			args           : chromium.args,
// 			defaultViewport: chromium.defaultViewport,
// 			executablePath : await chromium.executablePath(),
// 			headless       : chromium.headless
// 		});
// 		const page = await browser.newPage();
// 		await page.goto(`https://www.eprodukty.gs1.pl/catalog/0${ean}`);

// 		const scrapedData = await page.waitForSelector('.main__header', { timeout: 1000 }).then(res => {
// 			console.log(res)
// 			return res}).catch(error => '');
// 		console.log(scrapedData)
// 		if (scrapedData === '') {
// 			return 'Nie znaleziono eanu';
// 		} else {
// 			const productName = await scrapedData?.evaluate(el => el.textContent);
// 			return productName.replace('Nazwa: ', '');

// 		}
// 	};

// 	const data = await getGtinData();

// 	return NextResponse.json({ data });
// }


import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request, { params }) {
	const { ean } = params;

	const getGtinData = async () => {
		chromium.setGraphicsMode = false;

		const browser = await puppeteer.launch({
			args: chromium.args,
			defaultViewport: chromium.defaultViewport,
			executablePath: await chromium.executablePath(),
			headless: chromium.headless,
		});

		const page = await browser.newPage();
		await page.goto(`https://www.eprodukty.gs1.pl/catalog/0${ean}`);

		const scrapedData = await page
			.waitForSelector('.main__header', { timeout: 1000 })
			.then(res => res)
			.catch(() => '');

		if (!scrapedData) {
			await browser.close();
			return 'Nie znaleziono eanu';
		}

		const productName = await scrapedData.evaluate(el => el.textContent);
		await browser.close();
		return productName.replace('Nazwa: ', '');
	};

	const data = await getGtinData();
	return NextResponse.json({ data });
}
