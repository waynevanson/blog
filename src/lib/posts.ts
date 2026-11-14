import Markdoc, { type Config, type Node } from '@markdoc/markdoc';
import { reader } from './cms';

type RawPost = NonNullable<Awaited<ReturnType<typeof reader.collections.posts.read>>>;

// `content` is only a function until the entry is read with
// `resolveLinkedFiles: true`, at which point it becomes the parsed Markdoc node.
export type Post = Omit<RawPost, 'content'> & { content: { node: Node } };
export type PostSummary = Pick<Post, 'title' | 'description' | 'publishedAt'> & { slug: string };

export async function getPosts(): Promise<PostSummary[]> {
  const entries = await reader.collections.posts.all();

  return entries
    .filter(({ entry }) => !entry.draft)
    .map(({ slug, entry }) => ({
      slug,
      title: entry.title,
      description: entry.description,
      publishedAt: entry.publishedAt,
    }))
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
}

export async function getPost(slug: string): Promise<Post | null> {
  const post = (await reader.collections.posts.read(slug, {
    resolveLinkedFiles: true,
  })) as Post | null;

  if (!post || post.draft) {
    return null;
  }

  return post;
}

function nodeText(node: Node): string {
  if (node.type === 'text') {
    return String(node.attributes.content ?? '');
  }

  return node.children.map(nodeText).join('');
}

const markdocConfig: Config = {
  nodes: {
    ...Markdoc.nodes,
    fence: {
      ...Markdoc.nodes.fence,
      transform(node, config) {
        const language = node.attributes.language;
        const children = node.transformChildren(config);

        return new Markdoc.Tag(
          'pre',
          {},
          [
            new Markdoc.Tag(
              'code',
              language ? { class: `language-${language}` } : {},
              children,
            ),
          ],
        );
      },
    },
    heading: {
      ...Markdoc.nodes.heading,
      transform(node, config) {
        const children = node.transformChildren(config);
        const level = node.attributes.level;
        const id = nodeText(node)
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-');

        return new Markdoc.Tag(`h${level}`, { id }, children);
      },
    },
  },
};

export function renderMarkdoc(node: Node): string {
  return Markdoc.renderers.html(Markdoc.transform(node, markdocConfig));
}

export function formatDate(date: string | null): string {
  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat('en-AU', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}
