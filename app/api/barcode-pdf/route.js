// pages/api/barcode.js
import PDFDocument from 'pdfkit';
import SVGtoPDF from 'svg-to-pdfkit';
import bwipjs from 'bwip-js';
import path from 'path';
import fs from 'fs';

export default async function handler(req, res) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const {
		      ean,
		      name
	      } = req.body;

	if (!ean || typeof ean !== 'string' || ean.length !== 13 || !/^\d{13}$/.test(ean)) {
		return res.status(400).json({ error: 'Invalid or missing EAN' });
	}

	try {
		const svgBuffer = await bwipjs.toBuffer({
			bcid           : 'ean13',
			text           : ean,
			scale          : 3,
			includetext    : true,
			textxalign     : 'center',
			backgroundcolor: 'FFFFFF',
			format         : 'svg'
		});

		const doc = new PDFDocument({
			size  : [150, 100],
			margin: 10
		});

		const fontPath = path.join(process.cwd(), 'public', 'fonts', 'OpenSans.ttf');
		if (!fs.existsSync(fontPath)) {
			return res.status(500).json({ error: 'Font file not found' });
		}

		doc.registerFont('custom', fontPath);
		doc.font('custom');
		doc.fontSize(8).text(name || '', { align: 'center' });

		SVGtoPDF(doc, svgBuffer.toString(), 15, 25, {
			width : 120,
			height: 50
		});

		const chunks = [];
		doc.on('data', chunk => chunks.push(chunk));
		doc.on('end', () => {
			const pdfBuffer = Buffer.concat(chunks);
			res.setHeader('Content-Type', 'application/pdf');
			res.setHeader('Content-Disposition', `attachment; filename="${ean}.pdf"`);
			res.status(200).send(pdfBuffer);
		});
		doc.end();
	} catch (err) {
		console.error('PDF generation error:', err);
		res.status(500).json({ error: 'Failed to generate PDF' });
	}
}
