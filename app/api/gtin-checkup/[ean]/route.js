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
		const isProd = !!process.env.AWS_REGION || !!process.env.VERCEL || process.env.NODE_ENV === 'production';

		let browser;

		if (isProd) {
			chromium.setGraphicsMode = false;

			browser = await puppeteer.launch({
				args: chromium.args,
				defaultViewport: chromium.defaultViewport,
				executablePath: await chromium.executablePath(),
				headless: chromium.headless,
			});
		} else {
			// DEV: możesz też ręcznie podać ścieżkę do Chrome, jeśli Puppeteer nie znajdzie automatycznie
			browser = await puppeteer.launch({
				headless: true,
				executablePath: 'C:\\Users\\DKKT\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe' // <- odkomentuj jeśli potrzebne
			});
		}

		const page = await browser.newPage();
		await page.goto('https://www.eprodukty.gs1.pl/login');
		const element = await page.$('.button__login', {timeout: 1000})
		const text = await page.evaluate(el => el.textContent, element);
		if(text === 'Zaloguj się') {
			await page.goto('https://www.eprodukty.gs1.pl/login');
			await page.setViewport({width: 1920, height: 1024});
			await page.type('#email','biuro@dkkt.pl',{delay: 100});
			await page.type('#password','Dr83754126!@',{delay: 100})
			await page.keyboard.press('Enter');
		}
		const ell = await page.$('#dropdown-basic', {timeout: 5000});
		const logged = await page.evaluate(el => console.log(el), ell);
		console.log(logged)
		if(logged === 'Krzysztof Tomaszewski') {
			await page.goto(`https://www.eprodukty.gs1.pl/catalog?gtin_number=${ean}&offset=0`);
			const scrapedData = await page
			.waitForSelector('.catalog-table__gtin-number', { timeout: 3000 })
			.then(res => res)
			.catch(() => '');
			console.log(scrapedData)
			if (!scrapedData) {
				await browser.close();
				return 'Nie znaleziono eanu';
			}
		}

		const productName = await scrapedData.evaluate(el => el.textContent);
		await browser.close();
		return productName.replace('Nazwa: ', '');
	};

	const data = await getGtinData();
	return NextResponse.json({ data });
}
