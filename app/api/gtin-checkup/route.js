import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
	const { eans } = await request.json();

	const items = [];
	for await (const ean of eans) {
		console.log(ean);
		await axios.get(`https://mojegs1.pl/api/v2/products/${ean}`, {
			auth: {
				password: process.env.GS1_PASSWORD,
				username: process.env.GS1_LOGIN
			}
		}).then(res => {
			items.push({
				name: res.data.data.attributes.commonName,
				ean : res.data.data.id
			});
		}).catch(() => items.push({
			name: 'Nie znaleziono produktu',
			ean : ean
		}));
	}
	return NextResponse.json({ data: items });
}
