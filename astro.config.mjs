// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import node from '@astrojs/node';

// Orígenes permitidos para CORS (ajusta en producción a tu dominio real)
const ALLOWED_ORIGINS = [
  'https://femundo.org',
  'https://www.femundo.org',
];

// https://astro.build/config
export default defineConfig({
	site: 'https://femundo.org',
	output: 'server',
	adapter: node({ mode: 'standalone' }),
	integrations: [mdx(), sitemap(), react()],
	vite: {
		optimizeDeps: {
			include: ['react', 'react-dom']
		}
	},
	server: {
		headers: {
			// Prevenir clickjacking
			'X-Frame-Options': 'DENY',
			// Prevenir MIME-sniffing
			'X-Content-Type-Options': 'nosniff',
			// Protección XSS básica en navegadores antiguos
			'X-XSS-Protection': '1; mode=block',
			// Forzar HTTPS por 1 año (habilitar sólo cuando tengas SSL en VPS)
			'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
			// No enviar Referer a sitios externos
			'Referrer-Policy': 'strict-origin-when-cross-origin',
			// Limitar funcionalidades del navegador
			'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
			// Content Security Policy
			'Content-Security-Policy': [
				"default-src 'self'",
				"script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // unsafe-inline/eval requerido por Astro/React en dev; afinar en prod
				"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
				"font-src 'self' https://fonts.gstatic.com",
				"img-src 'self' data: blob: https:",
				"connect-src 'self'",
				"frame-ancestors 'none'",
				"form-action 'self'",
				"base-uri 'self'",
			].join('; '),
		}
	}
});
