export interface LastFmConfig {
  username: string;
  api_key: string;
}

export interface TwitterConfig {
  api_key: string;
  api_key_secret: string;
  access_token: string;
  access_token_secret: string;
}

export interface DiscordConfig {
  application_id: string;
  public_key: string;
}

// you can use {track}, {album}, {artist}, {url}, {albumArtUrl} in the template string.
// if you don't implicitly add enabled = true in the config, feature will not be enabled in default.
export interface NowPlayingConfig {
  enabled: boolean;

  // default is "*/5 * * * * *", which means every 5 seconds.
  // this program's crontab supports seconds-level precision.
  // recommended to check nowplaying at least every 10 seconds.
  fetch_crontab?: string;

  twitter?: {
    enabled: boolean;
    // if you don't input a template, default template will be used.
    template?: string;
    upload_image?: boolean; // default is true.
  };

  discord?: {
    enabled: boolean;
    // if you don't input a template, default template will be used.
    template?: {
      detail?: string;
      state?: string;
    };
  };
}

export interface AppConfig {
  // daily_update: boolean;
  // daily_update_hour: number;
  // daily_update_minute: number;

  nowplaying: NowPlayingConfig;
}

export interface Configuration {
  last_fm: LastFmConfig;
  twitter: TwitterConfig;
  discord: DiscordConfig;
  app: AppConfig;
}
