import { readFileSync, writeFileSync } from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { html as toReactElement } from 'satori-html';


// const fontFile = await fetch('https://www.thegreenwebfoundation.org/wp-content/themes/tgwf-2020/assets/fonts/twkeverett/twkeverett-regular.woff2');
// const fontData = await fontFile.arrayBuffer();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const fontData = readFileSync(path.resolve(__dirname, '../TWKEverett-Regular.otf'));
let template = readFileSync(path.resolve(__dirname, './green-badge.html'), 'utf8');

const height = 95;
const width = 200;

export const render = async () => {
	template = template
		.replace('{{url}}', 'www.yourdomain.xyz')
		.replace('{{provider}}', 'Acme Hosting');
	const html = toReactElement(template);
	const svg = await satori(html, {
		fonts: [
			{
				name: 'TWK Everett',
				data: fontData,
				style: 'normal',
			},
		],
		height,
		width,
	});

	writeFileSync(path.resolve(__dirname, '../output.svg'), svg);

	const resvg = new Resvg(svg, {
		fitTo: {
			mode: 'width',
			value: width * 2,
		},
	});

	const image = resvg.render();

	// return new Response(image.asPng(), {
	//   headers: {
	//     'content-type': 'image/png'
	//   }
	// });

	writeFileSync(path.resolve(__dirname, '../output.png'), image.asPng());
};

await render();

