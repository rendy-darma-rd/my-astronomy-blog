import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown, MDX, and MDOC files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/artikel', pattern: '**/*.{md,mdx,mdoc}' }),
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		// Use string for image path since glob loader doesn't support image() helper
		heroImage: z.string().optional(),
		// Topic field for categorizing articles
		topic: z.enum(['benda-kecil', 'planet', 'bintang', 'gugus-bintang', 'galaksi', 'alam-semesta', 'misi-antariksa', 'sejarah']).optional(),
	}),
});

export const collections = { blog };
