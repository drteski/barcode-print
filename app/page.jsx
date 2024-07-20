'use client';

import { ReactBarcode } from 'react-jsbarcode';
import { Button } from '@/components/ui/button';
import { createRef, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Textarea } from '@/components/ui/textarea';
import { isValidEAN13 } from '@/lib/checkEan';


export const MaterialSymbolsLightDownload = (props) => (
	<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
		<path fill="currentColor"
		      d="m12 15.577l-3.539-3.538l.708-.72L11.5 13.65V5h1v8.65l2.33-2.33l.709.719zM6.616 19q-.691 0-1.153-.462T5 17.384v-2.423h1v2.423q0 .231.192.424t.423.192h10.77q.23 0 .423-.192t.192-.424v-2.423h1v2.423q0 .691-.462 1.153T17.384 19z"></path>
	</svg>
);

export const SvgSpinners90RingWithBg = (props) => (
	<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
		<path fill="currentColor"
		      d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
		      opacity=".25"></path>
		<path fill="currentColor"
		      d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z">
			<animateTransform attributeName="transform"
			                  dur="0.75s"
			                  repeatCount="indefinite"
			                  type="rotate"
			                  values="0 12 12;360 12 12"></animateTransform>
		</path>
	</svg>
);


const BarcodePage = () => {
	const [products, setProducts] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [eans, setEans] = useState([]);
	const [invalidEans, setInvalidEans] = useState([]);
	const refs = useMemo(() => {
		const items = {};
		Array.from(Array(eans.length).keys()).forEach(
			(item, index) => items[index] = createRef(null)
		);
		return items;
	}, [eans]);

	const handleDownloadPdf = async (ref, currentEan, name) => {
		const element = ref.current;
		const pdf = new jsPDF('landscape', 'mm', [25, 35]);
		const pdfWidth = pdf.internal.pageSize.getWidth();
		const pdfHeight = pdf.internal.pageSize.getHeight();
		await html2canvas(element, { scale: 15 }).then(canvas => {
			const data = canvas.toDataURL('image/png');
			pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
			pdf.save(`${currentEan}-${name}.pdf`);
		});
	};

	const getGtinData = async (e) => {
		setProducts([]);
		setIsLoading(true);
		e.preventDefault();

		const gtinData = eans.map(async (ean) => {
			return await axios.get(`/api/gtin-checkup/${ean}`).then(res =>
				setProducts((prevState) => [{ name: res.data.data, ean }, ...prevState])
			).catch(
				setProducts((prevState) => [...prevState])
			);
		});
		await Promise.all(gtinData).then(() => setIsLoading(false));
	};
	const handleEanInput = (e) => {
		e.preventDefault();

		if (e.target.value.length < 13)
			return setProducts([]);

		if (e.target.value.length === 13)
			return setEans([e.target.value]);

		const eanCodes = e.target.value.split(/[\n]|[;]|[.]|[,]|[:]|[ ]/gm).filter(ean => ean !== '').filter(ean => ean.match(/\d/)).filter(ean => ean.length === 13).reduce((prev, curr) => {
			if (prev.includes(curr)) return prev;
			return [...prev, curr];
		}, []);
		const validEans = eanCodes.filter(ean => isValidEAN13(ean));
		const inValidEans = eanCodes.filter(ean => !isValidEAN13(ean));
		setInvalidEans(inValidEans);
		return setEans(validEans);
	};


	return (<main className="grid grid-cols-[auto_1fr] grid-rows-1 gap-4 h-dvh p-4 min-w-[600px] overflow-x-auto">

		<div className="w-[300px] h-[calc(100dvh_-_32px)] flex flex-col gap-4">
			<Textarea className="border h-full resize-none"
			          rows="20"
			          placeholder="EANy"
			          onChange={(e) => handleEanInput(e)}/>
			<Button className="w-full py-5"
			        size="icon"
			        onClick={getGtinData}>{isLoading ? (<SvgSpinners90RingWithBg className="w-7 h-7"/>) :
				<>Szukaj {eans.length} eanów</>}</Button>
			{invalidEans.length !== 0 &&
				<div className="text-sm text-bold gap-2">
					<div>Niepoprawne eany:</div>
					<p className="text-xs">{invalidEans.join(', ')}</p>
				</div>}
		</div>
		<div className="grid h-[min-content] max-h-[calc(100dvh_-_32px)] overflow-y-auto gap-4 items-center grid-cols-[repeat(auto-fill,_minmax(36mm,_1fr))]">
			<>
				{(products || []).map((product, index) => {
					const { name, ean } = product;
					return (<div key={ean} className="border border-neutral-200 h-[150px] rounded-md relative pt-8">
						<div ref={refs[index]} id="pdf" className="p-0.5 w-[35mm] h-[25mm]">
							<p className="text-[10px] text-center font-medium tracking-[-0.5px] uppercase leading-[10px] h-[14mm] overflow-hidden block">{name}</p>
							{name !== '' ? (<ReactBarcode className="w-full h-[10mm]"
							                              value={ean ? ean : '0000000000000'}
							                              options={{
								                              format    : 'ean13',
								                              margin    : 2,
								                              height    : 40,
								                              textAlign : 'center',
								                              textMargin: 1
							                              }}
							                              renderer="svg"/>) : (<></>)}

						</div>
						<Button onClick={() => handleDownloadPdf(refs[index], ean, name)}
						        className="absolute top-2 right-2"
						        size="icon"><MaterialSymbolsLightDownload className="h-6 w-6"/></Button></div>);
				})}
			</>
		</div>
	</main>);
};

export default BarcodePage;