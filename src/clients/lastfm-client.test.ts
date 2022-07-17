import { getRecentTracks, getUserInfo } from './lastfm-client.ts';
import { assert, assertEquals } from 'testing/asserts';

const LASTFM_API_KEY = Deno.env.get('LASTFM_API_KEY');

Deno.test('getUserInfo - Get user correctly.', async () => {
  // first, check api key is exists.
  assert(LASTFM_API_KEY !== undefined && LASTFM_API_KEY !== null);

  // fetch user and check it is correct.
  const user = await getUserInfo('Hazealign', LASTFM_API_KEY);
  assertEquals(user.name, 'Hazealign');
  assertEquals(user.realname, 'Haze, Lee');
  assertEquals(user.country, 'Korea, Republic of');
});

Deno.test('getRecentTracks - Get recent tracks correctly.', async () => {
  // first, check api key is exists.
  assert(LASTFM_API_KEY !== undefined && LASTFM_API_KEY !== null);

  // fetch tracks and check it is correct.
  const tracks = await getRecentTracks('Hazealign', LASTFM_API_KEY, 3);
  assertEquals(tracks.length, 3);
});
