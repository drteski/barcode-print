import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import * as fs from 'node:fs';

export async function GET(request, { params }) {
	const { ean } = params;
	console.log(ean);
	const getGtinData = async () => {
		const browser = await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox']
		});
		const page = await browser.newPage();
		await page.setViewport({ width: 1920, height: 1080 });
		await page.goto(`https://www.eprodukty.gs1.pl/catalog/${ean}`);

		const scrapedData = await page.waitForSelector('.main__header', { timeout: 3000 }).then(res => res).catch(error => '');

		if (scrapedData === '') {
			return 'Nie znaleziono eanu';
		} else {
			const productName = await scrapedData?.evaluate(el => el.textContent);
			return productName.replace('Nazwa: ', '');

		}
	};
	const data = await getGtinData();

	return NextResponse.json({ data });
}
