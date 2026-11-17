import Markdoc, { type Config, type Node } from '@markdoc/markdoc';
import { reader } from './cms';

type RawPost = NonNullable<Awaited<ReturnType<typeof reader.collections.posts.read>>>;

// `content` is only a function until the entry is read with
// `resolveLinkedFiles: true`, at which point it becomes the parsed Markdoc node.
export type Post = Omit<RawPost, 'content'> & { content: { node: Node } };
export type PostSummary = Pick<Post, 'title' | 'description' | 'publishedAt'> & {
  slug: string;
  seriesName: string | null;
};

export type PostSeries = {
  slug: string;
  name: string;
  description: string | null;
  posts: PostSummary[];
  /** 1-based position of the current post within the series. */
  position: number;
};

export async function getPosts(): Promise<PostSummary[]> {
  const [entries, seriesEntries] = await Promise.all([
    reader.collections.posts.all(),
    reader.collections.series.all(),
  ]);
  // A series lists its own posts, so membership flows from series to post.
  const seriesNames = new Map<string, string>();
  for (const { entry } of seriesEntries) {
    for (const postSlug of entry.posts) {
      if (typeof postSlug === 'string' && !seriesNames.has(postSlug)) {
        seriesNames.set(postSlug, entry.name);
      }
    }
  }

  return entries
    .filter(({ entry }) => !entry.draft)
    .map(({ slug, entry }) => ({
      slug,
      title: entry.title,
      description: entry.description,
      publishedAt: entry.publishedAt,
      seriesName: seriesNames.get(slug) ?? null,
    }))
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
}

/**
 * Returns the series that lists `currentSlug`, with its published posts in the
 * order set on the series, plus the current post's position.
 */
export async function getSeriesForPost(currentSlug: string): Promise<PostSeries | null> {
  const [allPosts, seriesEntries] = await Promise.all([
    getPosts(),
    reader.collections.series.all(),
  ]);
  const series = seriesEntries.find(({ entry }) =>
    entry.posts.some((postSlug) => postSlug === currentSlug),
  );

  if (!series) {
    return null;
  }

  const postsBySlug = new Map(allPosts.map((post) => [post.slug, post]));
  const posts = series.entry.posts
    .filter((postSlug): postSlug is string => typeof postSlug === 'string')
    .map((postSlug) => postsBySlug.get(postSlug))
    .filter((post): post is PostSummary => post !== undefined);

  if (posts.length === 0) {
    return null;
  }

  const index = posts.findIndex((post) => post.slug === currentSlug);

  return {
    slug: series.slug,
    name: series.entry.name,
    description: series.entry.description,
    posts,
    position: index === -1 ? 0 : index + 1,
  };
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
