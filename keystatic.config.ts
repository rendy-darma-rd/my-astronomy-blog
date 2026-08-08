import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: { kind: 'local' },
  collections: {
    posts: collection({
      label: 'Articles',
      slugField: 'title',
      path: 'src/content/artikel/*',
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
