import { getNowPlayingTrack } from '../../clients/lastfm-client.ts';
import { Configuration } from '../../models/config.ts';
import { Song } from '../../models/lastfm/song.ts';
import { tryCatchAsync } from '../../utils/try-catch.ts';
import { uploadSongToTwitter } from './twitter.ts';

import { Logger } from 'optic';
import { updateSongToDiscord } from './discord.ts';

// Simple Singleton Based #NowPlaying Track Store
class PreviousNowPlayingStore {
  private static instance: PreviousNowPlayingStore;
  private song: Song | undefined = undefined;

  private constructor() {}

  static getInstance(): PreviousNowPlayingStore {
    if (!this.instance) {
      this.instance = new PreviousNowPlayingStore();
    }

    return this.instance;
  }

  setSong(song: Song) {
    this.song = song;
  }

  getSong(): Song | undefined {
    return this.song;
  }
}

export async function checkNowPlaying(config: Configuration, logger: Logger) {
  // 1. Fetch Last.fm API and Get current playing song.
  const [fetchErr, currentTrack] = await tryCatchAsync(getNowPlayingTrack(
    config.last_fm.username,
    config.last_fm.api_key,
  ));

  if (fetchErr) {
    logger.error(`Failed to fetch now playing track. ${fetchErr}`);
    return false;
  }

  if (!currentTrack) {
    logger.info('Not Playing Music. Skip this iteration.');
    return false;
  }

  // 2. Check if current song is different from previous song.
  const store = PreviousNowPlayingStore.getInstance();
  const previousTrack = store.getSong();
  if (previousTrack?.name === currentTrack.name && previousTrack?.artist === currentTrack.artist) {
    logger.info('Listening Same Song. Skip this iteration.');
    return false;
  }

  store.setSong(currentTrack);

  // 3. Upload Tweet to Twitter.
  if (config.config.nowplaying_update_to_twitter) {
    const [uploadError] = await tryCatchAsync(uploadSongToTwitter(config, logger, currentTrack));

    if (uploadError) {
      logger.error(`Failed to upload song to Twitter. ${uploadError}`);
      logger.error(uploadError);
      return false;
    }

    logger.info('Finished to upload #NowPlaying to Twitter.');
  }

  // 4. Set Discord Status.
  if (config.config.nowplaying_update_to_discord) {
    const [discordError] = await tryCatchAsync(updateSongToDiscord(config, logger, currentTrack));

    if (discordError) {
      logger.error(`Failed to update song to Discord. ${discordError}`);
      logger.error(discordError);
      return false;
    }

    logger.info('Finished to update current playing track to Discord.');
  }

  return true;
}
