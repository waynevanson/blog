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
    series: collection({
      label: 'Series',
      slugField: 'name',
      path: 'content/series/*',
      format: { data: 'yaml' },
      columns: ['name'],
      schema: {
        name: fields.slug({
          name: { label: 'Name' },
          slug: {
            label: 'Slug',
            description: 'Used to link posts to this series.',
          },
        }),
        description: fields.text({
          label: 'Description',
          description: 'Optional. Shown alongside the series on a post.',
          multiline: true,
        }),
        posts: fields.array(
          fields.relationship({
            label: 'Post',
            collection: 'posts',
          }),
          {
            label: 'Posts',
            description:
              'Drag to set the reading order. A post is only ordered here if it also selects this series in its Series field.',
            itemLabel: (props) => props.value ?? 'Post',
          },
        ),
      },
    }),
    posts: collection({
      label: 'Posts',
      slugField: 'title',
      path: 'content/posts/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'publishedAt', 'series'],
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
        series: fields.relationship({
          label: 'Series',
          collection: 'series',
          description:
            'Optional. Groups this post with the other parts of a series. The reading order is set on the series itself.',
        }),
        content: fields.markdoc({
          label: 'Content',
          extension: 'mdoc',
        }),
      },
    }),
  },
});
