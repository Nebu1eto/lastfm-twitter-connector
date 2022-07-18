import { Configuration } from '../../models/config.ts';
import { Song } from '../../models/lastfm/song.ts';
import { tryCatchAsync } from '../../utils/try-catch.ts';

import { Logger } from 'optic';
import { Client } from 'discord-rpc';

class DiscordClientStore {
  private static instance: DiscordClientStore;
  private client: Client | undefined = undefined;

  private constructor() {}

  static getInstance(): DiscordClientStore {
    if (!this.instance) {
      this.instance = new DiscordClientStore();
    }

    return this.instance;
  }

  getClient(): Client | undefined {
    return this.client;
  }

  setClient(client: Client): void {
    this.client = client;
  }
}

export async function updateSongToDiscord(
  config: Configuration,
  logger: Logger,
  track: Song,
): Promise<void> {
  const store = DiscordClientStore.getInstance();
  let client = store.getClient();

  if (!client) {
    // if discord client is not initialized, initialize and store it
    client = new Client({
      id: config.discord.application_id,
    });

    await client.connect();
    logger.info(`Connected to Discord: ${client.userTag}`);
    store.setClient(client);
  }

  const [activityErr] = await tryCatchAsync(client.setActivity({
    details: `🎵 Playing \n${track.name}`,
    state: `🎤 ${track.artist} | 💿 ${track.album}`,
    assets: {
      large_image: track.albumArtUrl,
      large_text: track.album,
      small_image: track.albumArtUrl,
      small_text: track.album,
    },
  }));

  if (activityErr) {
    logger.error('Failed to update Discord activity.');
    logger.error(activityErr);

    // if client connection is closed, reconnect it.
    await client.connect();
    logger.info(`Reconnected to Discord: ${client.userTag}`);
    store.setClient(client);
  }
}
