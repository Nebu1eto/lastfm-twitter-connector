import { uploadImage } from '../../clients/twitter-client.ts';
import { Configuration } from '../../models/config.ts';
import { formatSongToString, Song } from '../../models/lastfm/song.ts';
import { TwitterImage } from '../../models/twitter/image.ts';
import { tryCatchAsync } from '../../utils/try-catch.ts';

import { Logger } from 'optic';
import { statusUpdate } from 'tweet-update';

export async function uploadSongToTwitter(
  config: Configuration,
  logger: Logger,
  track: Song,
): Promise<void> {
  const oauthInfo = {
    consumerKey: config.twitter.api_key,
    consumerSecret: config.twitter.api_key_secret,
    token: config.twitter.access_token,
    tokenSecret: config.twitter.access_token_secret,
  };

  const tweetContent = formatSongToString(
    track,
    config.app.nowplaying.twitter?.template ??
      '#NowPlaying from last.fm\n\n🎵 {track}\n🎤 {artist}\n💿 {album}\n\n{url}',
  );

  const doUploadImage = config.app.nowplaying.twitter?.upload_image ?? true;

  let twitterImage: TwitterImage | undefined = undefined;
  if (doUploadImage && track.albumArtUrl !== undefined) {
    const [imageErr, imageResp] = await tryCatchAsync(uploadImage(track.albumArtUrl, oauthInfo));

    if (imageErr) {
      console.error(imageErr);
      logger.error(`Failed to upload image to Twitter. ${imageErr}`);
    } else {
      twitterImage = imageResp;
    }
  }

  logger.debug(JSON.stringify(twitterImage, undefined, 2));

  const [tweetErr] = await tryCatchAsync(statusUpdate(oauthInfo, {
    status: tweetContent,
    media_ids: (
      twitterImage?.media_id_string !== undefined ? [twitterImage?.media_id_string] : []
    ),
  }));

  if (tweetErr) {
    logger.error(`Failed to tweet. ${tweetErr}`);
  }
}
