import { NextResponse } from 'next/server';
import axios from 'axios';


// export const dynamic = 'force-dynamic';
// export const maxDuration = 60;

export async function POST(request) {
	const { eans } = await request.json();


	const items = [];
	for await (const ean of eans) {
		await axios.get(`https://mojegs1.pl/api/v2/products/${ean}`, {
			auth: {
				password: process.env.GS1_PASSWORD,
				username: process.env.GS1_LOGIN
			}
		}).then(res => {
			items.push({
				name: res.data.data.attributes.commonName,
				ean : res.data.data.id.slice(1, res.data.data.id.length - 1)
			});
		}).catch(() => items.push({
			name: 'Nie znaleziono produktu',
			ean : ean
		}));
	}

	return NextResponse.json({ data: items });
}
