import { collection, config, fields } from '@keystatic/core';

export default config({
  storage: {
    kind: 'github',
    repo: 'waynevanson/blog',
  },
  collections: {
    posts: collection({
      label: 'Posts',
      slugField: 'title',
      path: 'content/posts/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'publishedAt'],
      schema: {
        title: fields.slug({
          name: { label: 'Title' },
          slug: {
            label: 'Slug',
            description: 'The URL segment for this post.',
          },
        }),
        description: fields.text({
          label: 'Description',
          description: 'Shown on the home page and in feeds.',
          multiline: true,
        }),
        publishedAt: fields.date({
          label: 'Published at',
          defaultValue: { kind: 'today' },
        }),
        draft: fields.checkbox({
          label: 'Draft',
          description: 'Drafts are hidden from the site and feeds.',
          defaultValue: false,
        }),
        content: fields.markdoc({
          label: 'Content',
          extension: 'mdoc',
        }),
      },
    }),
  },
});
