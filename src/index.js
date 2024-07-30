import { Hono } from 'hono';
import satori from 'satori';
import { html as to_react_element } from 'satori-html';

import twk_everett_font_data from './fonts/TWKEverett-Regular.otf';
import template_blank from './templates/blank.template.svg';
import template_green from './templates/green.template.svg';
import template_text from './templates/text.template.html';

const app = new Hono();

const HEIGHT = 95;
const WIDTH = 200;

app.get('/', (c) => {
	return c.text(
		'Provide a url to check. For example, https://green-web-badge.vnphanquang.workers.dev/google.com',
	);
});

app.get('/:hostname', async (c) => {
	const hostname = c.req.param('hostname');

	let svg = template_blank;
	let ttl = 86400; // 1 day
	try {
		const greencheck = await (
			await fetch(
				`https://api.thegreenwebfoundation.org/api/v3/greencheck/${encodeURIComponent(hostname)}`,
			)
		).json();

		if (greencheck.green) {
			const { hosted_by } = greencheck;

			const template = template_text
				.replace('{{url}}', hostname.slice(0, 30))
				.replace('{{provider}}', hosted_by);
			const html = to_react_element(template);
			const text_svg = await satori(html, {
				fonts: [
					{
						name: 'TWK Everett',
						data: twk_everett_font_data,
						style: 'normal',
					},
				],
				height: HEIGHT,
				width: WIDTH,
			});
			const paths = Array.from(text_svg.match(/<path[^>]*\/>/g)).join('');
			svg = template_green.replace('{{text}}', paths);
			ttl = 604800; // 1 week

			/**
			 * ---NOTICE---
			 * It is possible to convert svg to png using resvg (web-assembly),
			 * using the code below.
			 * However, resvg is quite heavy (causing slow cold start) and will increase
			 * the size of the uploaded Cloudflare worker to more than 1MB,
			 * which is the limit for free plan.
			 */

			// const { initResgWasm } = await import('./resvg.js');
			// const Resvg = await initResgWasm();
			// const png = new Resvg(svg, {
			// 	fitTo: {
			// 		mode: 'height',
			// 		value: WIDTH * 2,
			// 	},
			// })
			// 	.render()
			// 	.asPng();
		}
	} catch (err) {
		console.error(err);
	}

	c.header('Content-Type', 'image/svg+xml');
	c.header('Cache-Control', `public, immutable, no-transform, max-age=${ttl}`);
	return c.body(svg);
});

export default app;

