import { config, fields, collection } from '@keystatic/core';

export default config({
  storage:
    import.meta.env.PROD
      ? {
          kind: 'github',
          repo: { owner: 'rendy-darma-rd', name: 'my-astronomy-blog' },
          branchPrefix: 'keystatic/',
        }
      : { kind: 'local' },
  collections: {
    posts: collection({
      label: 'Articles',
      slugField: 'title',
      path: 'src/content/artikel/*',
      entryLayout: 'content',
      format: { contentField: 'content' },
      columns: ['title', 'status', 'pubDate', 'updatedDate'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ label: 'Description', multiline: true }),
        pubDate: fields.date({ label: 'Created Date', defaultValue: { kind: 'today' } }),
        updatedDate: fields.date({ label: 'Last Modified', defaultValue: { kind: 'today' } }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
          ],
          defaultValue: 'draft',
        }),
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
