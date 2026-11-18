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
              'Drag to set the reading order. Adding a post here puts it in this series.',
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
    recipes: collection({
      label: 'Recipes',
      slugField: 'title',
      path: 'content/recipes/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'publishedAt'],
      schema: {
        title: fields.slug({
          name: { label: 'Title' },
          slug: {
            label: 'Slug',
            description: 'The URL segment for this recipe.',
          },
        }),
        description: fields.text({
          label: 'Description',
          description: 'Shown on the recipes page and above the recipe.',
          multiline: true,
        }),
        publishedAt: fields.date({
          label: 'Published at',
          defaultValue: { kind: 'today' },
        }),
        draft: fields.checkbox({
          label: 'Draft',
          description: 'Drafts are hidden from the site.',
          defaultValue: false,
        }),
        servings: fields.text({
          label: 'Servings',
          description: 'Optional. For example, "4 people".',
        }),
        prepTime: fields.text({
          label: 'Prep time',
          description: 'Optional. For example, "20 minutes".',
        }),
        cookTime: fields.text({
          label: 'Cook time',
          description: 'Optional. For example, "45 minutes".',
        }),
        ingredients: fields.array(
          fields.object({
            component: fields.text({
              label: 'Component',
              description:
                'Optional. Groups these ingredients under a subrecipe, such as "Roux".',
            }),
            items: fields.array(
              fields.text({
                label: 'Ingredient',
                validation: { isRequired: true },
              }),
              {
                label: 'Ingredients',
                itemLabel: (props) => props.value || 'Ingredient',
              },
            ),
          }),
          {
            label: 'Ingredients',
            description:
              'Group ingredients by subrecipe, or leave the component blank for a single list.',
            itemLabel: (props) => props.fields.component.value || 'Ingredients',
          },
        ),
        content: fields.markdoc({
          label: 'Method',
          description: 'The steps and any notes.',
          extension: 'mdoc',
        }),
      },
    }),
  },
});
