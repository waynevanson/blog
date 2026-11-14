import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config';

// Keystatic's local reader always reads the filesystem. The deployed app keeps a
// checkout of the content repository outside the immutable Nix store, so point
// the reader at it explicitly.
const repoPath = process.env.BLOG_REPO_PATH ?? process.cwd();

export const reader = createReader(repoPath, keystaticConfig);
