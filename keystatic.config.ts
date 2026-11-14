import { collection, config, fields, singleton } from '@keystatic/core';

export default config({
  storage: {
    kind: 'github',
    repo: 'waynevanson/blog',
  },
  singletons: {
    home: singleton({
      label: 'Home page',
      path: 'content/home',
      format: { data: 'yaml' },
      schema: {
        heading: fields.text({
          label: 'Heading',
          defaultValue: 'Wayne Van Son',
          validation: { isRequired: true },
        }),
        intro: fields.text({
          label: 'Intro',
          description: 'Shown under the heading on the home page.',
          multiline: true,
          validation: { isRequired: true },
        }),
        socials: fields.array(
          fields.object({
            label: fields.text({
              label: 'Label',
              validation: { isRequired: true },
            }),
            url: fields.url({
              label: 'URL',
              validation: { isRequired: true },
            }),
          }),
          {
            label: 'Social links',
            description: 'Links shown on the home page.',
            itemLabel: (props) => props.fields.label.value || 'Social link',
          },
        ),
      },
    }),
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
