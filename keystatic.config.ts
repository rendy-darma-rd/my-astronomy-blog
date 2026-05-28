import { config, fields, collection } from '@keystatic/core';

// Use GitHub storage in production, local storage in development
// This allows editing from production while keeping local development simple
const storage = import.meta.env.MODE === 'production' || import.meta.env.KEYSTATIC_GITHUB_MODE === 'true'
  ? {
      kind: 'github' as const,
      repo: {
        owner: import.meta.env.KEYSTATIC_GITHUB_OWNER || 'rendy-darma-rd',
        name: import.meta.env.KEYSTATIC_GITHUB_REPO || 'my-astronomy-blog',
      },
    }
  : { kind: 'local' as const };

export default config({
  storage,
  collections: {
    posts: collection({
      label: 'Articles',
      slugField: 'title',
      path: 'src/content/blog/*',
      entryLayout: 'content',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ label: 'Description', multiline: true }),
        pubDate: fields.date({ label: 'Publish Date' }),
        heroImage: fields.image({ label: 'Cover Image' }),
        topic: fields.select({
          label: 'Topic',
          options: [
            { label: 'Benda Kecil', value: 'benda-kecil' },
            { label: 'Planet', value: 'planet' },
            { label: 'Bintang', value: 'bintang' },
            { label: 'Gugus Bintang', value: 'gugus-bintang' },
            { label: 'Galaksi', value: 'galaksi' },
            { label: 'Alam Semesta', value: 'alam-semesta' },
            { label: 'Misi Antariksa', value: 'misi-antariksa' },
            { label: 'Sejarah', value: 'sejarah' },
          ],
          defaultValue: 'planet',
        }),
        content: fields.markdoc({ label: 'Content' }),
      },
    }),
  },
});
