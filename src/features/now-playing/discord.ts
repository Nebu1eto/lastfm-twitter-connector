import { Configuration } from '../../models/config.ts';
import { Song } from '../../models/lastfm/song.ts';

import { Logger } from 'optic';

export function updateSongToDiscord(
  config: Configuration,
  logger: Logger,
  track: Song,
): Promise<void> {
  throw new Error('Method not implemented.');
}
