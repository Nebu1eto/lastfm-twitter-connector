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

export interface AppConfig {
  daily_update: boolean;
  daily_update_hour: number;
  daily_update_minute: number;

  nowplaying_update: boolean;

  // default is "*/5 * * * * *", which means every 5 seconds.
  // this program's crontab supports seconds-level precision.
  // recommended to check nowplaying at least every 10 seconds.
  nowplaying_update_crontab?: string;

  nowplaying_update_to_twitter: boolean;
  nowplaying_update_to_discord: boolean;
}

export interface Configuration {
  last_fm: LastFmConfig;
  twitter: TwitterConfig;
  discord: DiscordConfig;
  config: AppConfig;
}
