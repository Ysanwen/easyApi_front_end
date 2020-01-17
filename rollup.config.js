import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import uuid1 from 'uuid/v1';
import * as fs from 'fs-extra';

const production = !process.env.ROLLUP_WATCH;

const uuid = uuid1();
fs.emptyDirSync('dist');

export default {
	input: 'src/main.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: `dist/static/${uuid}_bundle.js`
	},
	plugins: [
		svelte({
			// enable run-time checks when not in production
			dev: !production,
			// we'll extract any component CSS out into
			// a separate file — better for performance
			css: css => {
				css.write(`dist/static/${uuid}_bundle.css`);
			}
		}),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration —
		// consult the documentation for details:
		// https://github.com/rollup/rollup-plugin-commonjs
		resolve({
			browser: true,
			dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/')
		}),
		commonjs(),

		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('dist'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser(),
		// copy public files to dist
		cpStatic('public', 'dist')
	],
	watch: {
		clearScreen: false
	}
};

function cpStatic (fromPath, toPath) {
	try	{
		fs.copySync(fromPath, toPath);
		if (fs.existsSync(`${toPath}/index.html`)) {
			let indexHtml = fs.readFileSync(`${toPath}/index.html`, 'utf8');
			indexHtml = indexHtml.replace('</head>',
			`<link rel='stylesheet' href='static/${uuid}_bundle.css'>\n<script defer src='static/${uuid}_bundle.js'></script>\n</head>`);
			fs.writeFileSync(`${toPath}/index.html`, indexHtml);
		}
	} catch (err) {
		console.log(`copy static file error: ${err.message}`);
	}
}

function serve() {
	let started = false;

	return {
		writeBundle() {
			if (!started) {
				started = true;

				require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
					stdio: 'inherit',
					shell: true
				});
			}
		}
	};
}