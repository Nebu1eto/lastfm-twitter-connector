import { Configuration } from './models/config.ts';
import { Song } from './models/lastfm/song.ts';
import { tryCatch, tryCatchAsync } from './utils/try-catch.ts';
import { sleep } from './utils/sleep.ts';
import { getNowPlayingTrack } from './clients/lastfm-client.ts';
import { TwitterImage } from './models/twitter/image.ts';
import { uploadImage } from './clients/twitter-client.ts';

import { ensureFile } from 'fs';
import { ConsoleStream, Level, Logger, nameToLevel } from 'optic';
import { TokenReplacer } from 'optic/formatters';
import { PropertyRedaction } from 'optic/transformers/propertyRedaction';
import { parse as parseToml } from 'toml';
import { statusUpdate } from 'tweet-update';

export class ConnectorAppError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class ConnectorApp {
  private readonly debug: boolean;
  private readonly logLevel: string;
  private readonly logger: Logger;
  private config?: Configuration;

  constructor(
    debug: boolean,
    logLevel: string,
  ) {
    this.debug = debug;
    this.logLevel = logLevel;

    const stream = new ConsoleStream()
      .withMinLogLevel(debug ? Level.Debug : nameToLevel(logLevel))
      .withLogHeader(true)
      .withLogFooter(true)
      .withFormat(
        new TokenReplacer()
          .withColor()
          .withDateTimeFormat('YYYY.MM.DD hh:mm:ss:SSS'),
      );

    const logger = new Logger()
      .withMinLogLevel(debug ? Level.Debug : nameToLevel(logLevel))
      .addStream(stream)
      .addTransformer(new PropertyRedaction('api_key'))
      .addTransformer(new PropertyRedaction('shared_secret'))
      .addTransformer(new PropertyRedaction('api_key_secret'))
      .addTransformer(new PropertyRedaction('bearer_token'))
      .addTransformer(new PropertyRedaction('access_token'))
      .addTransformer(new PropertyRedaction('access_token_secret'));

    this.logger = logger;
  }

  async initialize(configFile: string): Promise<boolean> {
    const [open_err] = await tryCatchAsync(ensureFile(configFile));
    if (open_err) {
      this.logger.error(`Failed to open config file. Check file is exists. ${open_err}`);
      return false;
    }

    const [read_err, config_txt] = await tryCatchAsync(Deno.readTextFile(configFile));
    if (read_err) {
      this.logger.error(`Failed to read config file. ${read_err}`);
      return false;
    }

    const [parse_err, config] = tryCatch(() => parseToml(config_txt));
    if (parse_err) {
      this.logger.error(`Failed to parse config file. ${parse_err}`);
      return false;
    }

    // Remove Type Signature, and Apply New Configuration Interface
    this.config = config as unknown as Configuration;
    return true;
  }

  // deno-lint-ignore no-explicit-any
  private async uploadSongToTwitter(track: Song): Promise<any> {
    const oauthInfo = {
      consumerKey: this.config!.twitter.api_key,
      consumerSecret: this.config!.twitter.api_key_secret,
      token: this.config!.twitter.access_token,
      tokenSecret: this.config!.twitter.access_token_secret,
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
        this.logger.error(`Failed to upload image to Twitter. ${imageErr}`);
      } else {
        twitterImage = imageResp;
      }
    }
    this.logger.debug(JSON.stringify(twitterImage, undefined, 2));

    const [tweetErr, response] = await tryCatchAsync(statusUpdate(oauthInfo, {
      status: tweetContent,
      media_ids: twitterImage?.media_id_string ? [twitterImage?.media_id_string] : [],
    }));

    if (tweetErr) {
      this.logger.error(`Failed to tweet. ${tweetErr}`);
    }

    return response;
  }

  async run(): Promise<void> {
    this.logger.info('Starting Application.');
    if (!this.config) {
      throw new ConnectorAppError('Configuration is not initialized. Closing...');
    }

    let song: Song | undefined = undefined;

    while (true) {
      // 0. Sleep Until Next Minutes
      const now = new Date();
      const nextMinute = new Date();
      nextMinute.setMinutes(now.getMinutes() + 1);
      nextMinute.setSeconds(0);
      nextMinute.setMilliseconds(0);
      await sleep(nextMinute.getTime() - now.getTime());

      // 1. Fetch Last.fm API and Get current playing song.
      const [fetchErr, currentTrack] = await tryCatchAsync(getNowPlayingTrack(
        this.config.last_fm.username,
        this.config.last_fm.api_key,
      ));

      if (fetchErr) {
        this.logger.error(`Failed to fetch now playing track. ${fetchErr}`);
        continue;
      }

      if (!currentTrack) {
        this.logger.info('Not Playing Music. Skip this iteration.');
        continue;
      }

      if (song?.name === currentTrack.name && song?.artist === currentTrack.artist) {
        this.logger.info('Listening Same Song. Skip this iteration.');
        continue;
      }

      song = currentTrack;

      // 2. Upload Tweet to Twitter.
      const [uploadError] = await tryCatchAsync(this.uploadSongToTwitter(song));

      if (uploadError) {
        console.error(uploadError);
        this.logger.error(`Failed to upload song to Twitter. ${uploadError}`);
        continue;
      }

      this.logger.info('Finished to upload #NowPlaying to Twitter.');
    }
  }
}
