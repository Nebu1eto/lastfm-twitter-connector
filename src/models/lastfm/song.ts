export interface Song {
  name: string;
  artist: string;
  album: string;
  albumArtUrl?: string; // I'll take xlarge only
  url: string;
  nowPlaying: boolean;
}

export function formatSongToString(song: Song, origin_str: string): string {
  return origin_str
    .replaceAll('{track}', song.name)
    .replaceAll('{artist}', song.artist)
    .replaceAll('{album}', song.album)
    .replaceAll('{url}', song.url)
    .replaceAll('{albumArtUrl}', song.albumArtUrl ?? '');
}
