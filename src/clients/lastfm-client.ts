import { Song } from '../models/lastfm/song.ts';
import { User } from '../models/lastfm/user.ts';

import ky from 'ky';

export class LastFmClientError extends Error {
  constructor(message: string) {
    super(message);
  }
}

const BASE_ENDPOINT = 'https://ws.audioscrobbler.com/2.0/';

// get last.fm user information
export async function getUserInfo(
  username: string,
  apiKey: string,
): Promise<User> {
  const response = await ky.get(BASE_ENDPOINT, {
    searchParams: {
      method: 'user.getinfo',
      api_key: apiKey,
      user: username,
      format: 'json',
    },
  });

  if (!response.ok) {
    throw new LastFmClientError(`Failed to get user info: ${response.status}.`);
  }

  // deno-lint-ignore no-explicit-any
  const data: Record<string, any> = await response.json();
  if (data.error || !data.user) {
    throw new LastFmClientError(`Failed to get user info: ${JSON.stringify(data)}.`);
  }

  // check xlarge image is exists
  const imageUrlItem = data.user.image.find((item: Record<string, string>) => item.size == 'xlarge');

  return {
    country: data.user.country,
    age: parseInt(data.user.age),
    playcount: parseInt(data.user.playcount),
    subscriber: parseInt(data.user.subscriber),
    realname: data.user.realname,
    playlists: parseInt(data.user.playlists),
    bootstrap: parseInt(data.user.bootstrap),
    imageUrl: imageUrlItem?.text,
    registeredAt: new Date(data.user.registered.unixtime * 1000),
    url: data.user.url,
    gender: data.user.gender,
    name: data.user.name,
  };
}

// get recent scrobbled track from last.fm
// it contains nowplaying track
export async function getRecentTracks(
  username: string,
  apiKey: string,
  limit: number,
): Promise<Song[]> {
  const response = await ky.get(BASE_ENDPOINT, {
    searchParams: {
      method: 'user.getrecenttracks',
      api_key: apiKey,
      user: username,
      format: 'json',
      limit: limit,
    },
  });

  if (!response.ok) {
    throw new LastFmClientError(`Failed to get recent tracks: ${response.status}.`);
  }

  // deno-lint-ignore no-explicit-any
  const data: Record<string, any> = await response.json();
  if (data.error || !data?.recenttracks?.track || data.recenttracks.track.length == 0) {
    throw new LastFmClientError(`Failed to get recent tracks: Maybe error or recent tracks are empty.`);
  }

  const result: Song[] = [];
  for (const item of data.recenttracks.track) {
    const name = item.name;
    const artist = item.artist['#text'];
    const album = item.album['#text'];
    const albumArtUrlItem = item.image.find((item: Record<string, string>) => item.size == 'xlarge');
    const albumArtUrl = albumArtUrlItem?.text;
    const url = item.url;
    const playedAt = new Date(parseInt(item.date.uts) * 1000);
    const nowPlaying = item['@attr'] && item['@attr']['nowplaying'];

    result.push({
      name,
      artist,
      album,
      albumArtUrl,
      url,
      playedAt,
      nowPlaying,
    });
  }

  return result;
}

// get now playing track from last.fm
export async function getNowPlayingTrack(
  username: string,
  apiKey: string,
): Promise<Song | undefined> {
  const candidates = await getRecentTracks(username, apiKey, 1);

  if (candidates.length == 0) {
    return undefined;
  }

  if (!candidates[0].nowPlaying) {
    return undefined;
  }

  return candidates[0];
}
