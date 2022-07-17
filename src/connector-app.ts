import { Configuration } from './models/config.ts';
import { Song } from './models/lastfm/song.ts';
import { tryCatch, tryCatchAsync } from './utils/try-catch.ts';

import { ensureFile } from 'fs';
import { ConsoleStream, Logger, nameToLevel } from 'optic';
import { TokenReplacer } from 'optic/formatters';
import { PropertyRedaction } from 'optic/transformers/propertyRedaction';
import { parse as parseToml } from 'toml';

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
      .withMinLogLevel(nameToLevel(logLevel))
      .withLogHeader(true)
      .withLogFooter(true)
      .withFormat(
        new TokenReplacer()
          .withColor()
          .withDateTimeFormat('YYYY.MM.DD hh:mm:ss:SSS'),
      );

    const logger = new Logger()
      .withMinLogLevel(nameToLevel(logLevel))
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

  run(): Promise<void> {
    this.logger.info('Starting Application.');
    if (!this.config) {
      throw new ConnectorAppError('Configuration is not initialized. Closing...');
    }

    const song: Song | undefined = undefined;

    while (true) {
      // 1. Fetch Last.fm API and Get current playing song.

      // 2. Upload Tweet to Twitter.

      // 3. Sleep for a while.
    }
  }
}
