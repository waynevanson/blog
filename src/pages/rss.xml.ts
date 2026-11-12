import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getPosts } from '../lib/posts';

export const GET: APIRoute = async (context) => {
  const posts = await getPosts();

  return rss({
    title: 'Wayne Van Son',
    description: 'Notes on software, infrastructure, and whatever else I am tinkering with.',
    site: context.site ?? 'https://blog.waynevanson.com',
    items: posts.map((post) => ({
      title: post.title,
      description: post.description,
      pubDate: post.publishedAt ? new Date(`${post.publishedAt}T00:00:00Z`) : undefined,
      link: `/posts/${post.slug}/`,
    })),
    customData: '<language>en-au</language>',
  });
};
