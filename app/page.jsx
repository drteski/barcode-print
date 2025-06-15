'use client';

import { ReactBarcode } from 'react-jsbarcode';
import { Button } from '@/components/ui/button';
import { createRef, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Textarea } from '@/components/ui/textarea';
import { isValidEAN13 } from '@/lib/checkEan';


export const MaterialSymbolsLightDownload = (props) => (
	<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
		<path fill="currentColor"
		      d="m12 15.577l-3.539-3.538l.708-.72L11.5 13.65V5h1v8.65l2.33-2.33l.709.719zM6.616 19q-.691 0-1.153-.462T5 17.384v-2.423h1v2.423q0 .231.192.424t.423.192h10.77q.23 0 .423-.192t.192-.424v-2.423h1v2.423q0 .691-.462 1.153T17.384 19z"></path>
	</svg>
);

export const MaterialSymbolsLightScreenRotationAltRounded = (props) => (
	<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
		<path fill="currentColor"
		      d="M12.444 20.246L6.533 14.36q-.074-.081-.11-.175q-.036-.095-.036-.186q0-.182.13-.34q.131-.159.361-.159q.103 0 .199.037t.17.11l5.91 5.91q.174.193.443.184q.27-.01.442-.183l5.308-5.308h-2.812q-.212 0-.356-.144t-.143-.357t.143-.356t.357-.143h3.692q.343 0 .575.232t.233.576v3.692q0 .213-.145.356t-.356.144t-.356-.144t-.143-.356v-2.812l-5.308 5.308q-.221.22-.513.34t-.614.12q-.302 0-.608-.12q-.307-.12-.552-.34M3.77 10.731q-.343 0-.575-.232t-.232-.576V6.231q0-.213.144-.356t.356-.144t.356.144t.144.356v2.811L9.27 3.735q.243-.24.547-.35t.608-.11q.324 0 .617.11t.515.35l5.911 5.886q.074.081.11.175t.036.186q0 .182-.13.34q-.131.159-.362.159q-.102 0-.198-.037t-.17-.11l-5.91-5.911q-.174-.192-.443-.182q-.27.009-.442.182L4.65 9.731h2.812q.212 0 .356.144t.144.357t-.144.356t-.356.143z"></path>
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
	const inputRef = useRef(null);
	const refs = useMemo(() => {
		const items = {};
		Array.from(Array(eans.length).keys()).forEach(
			(item, index) => items[index] = createRef(null)
		);
		return items;
	}, [eans]);

	const handleDownloadPdf = async (ref, currentEan, name) => {
		try {
			const response = await fetch('/api/barcode', {
				method : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body   : JSON.stringify({
					ean: currentEan,
					name
				})
			});


			if (!response.ok) {
				throw new Error('Błąd generowania PDF');
			}

			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${currentEan}-${name}.pdf`;
			a.click();
			URL.revokeObjectURL(url);
		} catch (err) {
			console.error(err);
			alert('Nie udało się pobrać pliku PDF.');
		}
	};

	const getGtinData = async (e) => {
		setProducts([]);
		setIsLoading(true);
		e.preventDefault();

		const gtinData = eans.map(async (ean) => {
			return await axios.get(`/api/gtin-checkup/${ean}`).then(res =>
				setProducts((prevState) => [{
					name: res.data.data,
					ean
				}, ...prevState])
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

		const eanCodes = e.target.value.split(/^((?![\d]{13}).)*$/gm).filter(ean => ean !== '').filter(ean => ean.match(/\d/)).map(ean => ean.split(/[\n]|[;]|[.]|[,]|[:]|[ ]|[-]/gm))
			.flatMap(ean => ean).filter(ean => ean.match(/\d/)).filter(ean => ean.match(/[\d]{13}/)).filter(ean => ean.length === 13).reduce((prev, curr) => {
				if (prev.includes(curr)) return prev;
				return [...prev, curr];
			}, []).filter(ean => ean[0] !== '7');
		const validEans = eanCodes.filter(ean => isValidEAN13(ean));
		const inValidEans = eanCodes.filter(ean => !isValidEAN13(ean));
		setInvalidEans(inValidEans);
		return setEans(validEans);
	};

	const convertText = () => {
		inputRef.current.value = eans.join('\n');
	};


	return (
		<main className="grid sm:grid-cols-[auto_1fr] sm:grid-rows-1 gap-4 h-dvh p-4 overflow-x-auto grid-cols-1 grid-rows-auto">

			<div className="w-full sm:w-[300px] sm:h-[calc(100dvh_-_32px)] h-[calc(50dvh_-_24px)] flex flex-col gap-4 relative">
				<Textarea ref={inputRef} className="border h-full resize-none"
				          rows="20"
				          placeholder="EANy"
				          onChange={(e) => handleEanInput(e)}/>
				<Button className="w-full py-5"
				        size="icon"
				        onClick={getGtinData}>{isLoading ? (<SvgSpinners90RingWithBg className="w-7 h-7"/>) :
					<>{eans.length === 0 ? ('---') : (`Stwórz ${eans.length} etykiety`)}</>}</Button>
				<Button className="absolute top-2 right-2"
				        onClick={convertText} title="Przetwórz tekst"
				        size="icon"><MaterialSymbolsLightScreenRotationAltRounded
					className="w-6 h-6"/></Button>
				{invalidEans.length !== 0 &&
					<div className="text-sm text-bold gap-2">
						<div>Niepoprawne eany:</div>
						<p className="text-xs">{invalidEans.join(', ')}</p>
					</div>}
			</div>
			<div className="grid h-[min-content] sm:max-h-[calc(100dvh_-_32px)] max-h-[calc(50dvh_-_24px)] overflow-y-auto gap-4 items-center grid-cols-[repeat(auto-fill,_minmax(36mm,_1fr))]">
				<>
					{(products || []).map((product, index) => {
						const {
							      name,
							      ean
						      } = product;
						console.log(name);
						if (name === 'Nie znaleziono eanu') return;
						return (<div key={ean}
						             className="border border-neutral-200 h-[150px] rounded-md relative pt-12 bg-white flex items-center justify-center">
							<div ref={refs[index]} id="pdf" className="p-0.5 w-[35mm] h-[25mm]">
								<p className="text-[10px] text-center font-medium tracking-[-0.5px] -translate-y-1 uppercase leading-[10px] h-[14mm] block">{name}</p>
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