'use client';

import { ReactBarcode } from 'react-jsbarcode';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import generatePDF from 'react-to-pdf';


const BarcodePage = () => {
	const [product, setProduct] = useState('');
	const [ean, setEan] = useState('');
	const ref = useRef(null);
	useEffect(() => {
		const getGtinData = async () => {
			return await axios.get(`/api/gtin-checkup/${ean}`).then(res =>
				setProduct(res.data.data)
			);
		};
		if (ean?.length === 13) {
			getGtinData();
		}
	}, [ean]);
	const getTargetElement = () => document.getElementById('pdf');

	const pdfConfig = {
		method: 'open',
		page: {
			format: 'a6',
			orientation: 'landscape'
		}
	};

	return (<main className="flex flex-col items-center justify-center h-dvh">

		<div className="mb-20">
			<Input className="text-center" type="number" placeholder="EAN" onChange={(e) => {
				if (e.target.value.length < 13) {
					setProduct('');
				}
				setEan(e.target.value);
			}}/>
		</div>

		<div id="pdf" className="p-1 w-[50mm] h-[30mm]">
			<p className="text-[11px] text-center font-medium tracking-tighter uppercase leading-3 h-[10mm] overflow-hidden">{product}</p>
			{product !== '' ? (<ReactBarcode className="w-full"
			                                 value={ean ? ean : '0000000000000'}
			                                 options={{
				                                 format: 'ean13',
				                                 margin: 2,
				                                 height: 50,
				                                 textAlign: 'center',
				                                 textMargin: 0
			                                 }}
			                                 renderer="svg"/>) : (<></>)}

		</div>
		<Button onClick={() => generatePDF(getTargetElement, pdfConfig)} className="mt-20">Drukuj</Button>
	</main>);
};

export default BarcodePage;