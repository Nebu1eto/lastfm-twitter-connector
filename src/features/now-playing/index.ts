import { getNowPlayingTrack } from '../../clients/lastfm-client.ts';
import { Configuration } from '../../models/config.ts';
import { Song } from '../../models/lastfm/song.ts';
import { tryCatchAsync } from '../../utils/try-catch.ts';
import { TwitterImage } from '../../models/twitter/image.ts';
import { uploadImage } from '../../clients/twitter-client.ts';

import { Logger } from 'optic';
import { statusUpdate } from 'tweet-update';

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

async function uploadSongToTwitter(
  config: Configuration,
  logger: Logger,
  track: Song,
  // deno-lint-ignore no-explicit-any
): Promise<any> {
  const oauthInfo = {
    consumerKey: config.twitter.api_key,
    consumerSecret: config.twitter.api_key_secret,
    token: config.twitter.access_token,
    tokenSecret: config.twitter.access_token_secret,
  };

  const tweetContent = '#NowPlaying from last.fm\n\n' +
    `🎵 ${track.name}\n` +
    `🎤 ${track.artist}\n` +
    `💿 ${track.album}\n\n` +
    track.url;

  let twitterImage: TwitterImage | undefined = undefined;
  if (track.albumArtUrl) {
    const [imageErr, imageResp] = await tryCatchAsync(uploadImage(track.albumArtUrl, oauthInfo));

    if (imageErr) {
      console.error(imageErr);
      logger.error(`Failed to upload image to Twitter. ${imageErr}`);
    } else {
      twitterImage = imageResp;
    }
  }
  logger.debug(JSON.stringify(twitterImage, undefined, 2));

  const [tweetErr, response] = await tryCatchAsync(statusUpdate(oauthInfo, {
    status: tweetContent,
    media_ids: twitterImage?.media_id_string ? [twitterImage?.media_id_string] : [],
  }));

  if (tweetErr) {
    logger.error(`Failed to tweet. ${tweetErr}`);
  }

  return response;
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
  const [uploadError] = await tryCatchAsync(uploadSongToTwitter(config, logger, currentTrack));

  if (uploadError) {
    logger.error(`Failed to upload song to Twitter. ${uploadError}`);
    logger.error(uploadError);
    return false;
  }

  logger.info('Finished to upload #NowPlaying to Twitter.');
  return true;
}
