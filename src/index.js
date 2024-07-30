import { Hono } from 'hono';
import satori from 'satori';
import { html as toReactElement } from 'satori-html';

import twkEverettFontData from './fonts/TWKEverett-Regular.otf';
import { initResgWasm } from './resvg.js';
import greenTemplate from './templates/green.template.html';

const app = new Hono();

const HEIGHT = 95;
const WIDTH = 200;

app.get('/', async (c) => {
	const template = greenTemplate
		.replace('{{url}}', 'www.yourdomain.xyz')
		.replace('{{provider}}', 'Acme Hosting');
	const html = toReactElement(template);
	const svg = await satori(html, {
		fonts: [
			{
				name: 'TWK Everett',
				data: twkEverettFontData,
				style: 'normal',
			},
		],
		height: HEIGHT,
		width: WIDTH,
	});

	const Resvg = await initResgWasm();
	const png = new Resvg(svg, {
		fitTo: {
			mode: 'height',
			value: WIDTH * 2,
		},
	})
		.render()
		.asPng();

	c.header('Content-Type', 'image/png');
	c.header('Cache-Control', 'public, immutable, no-transform, max-age=604800');
	return c.body(png);
});

export default app;

