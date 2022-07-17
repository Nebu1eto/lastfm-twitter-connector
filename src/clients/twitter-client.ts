import ky from 'ky';
import { oAuth1Fetch, OAuth1Info } from 'oauth-fetch';

import { TwitterImage } from '../models/twitter/image.ts';

class TwitterClientError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export async function uploadImage(
  imageUrl: string,
  oauthConf: OAuth1Info,
) {
  const imageResponse = await ky.get(imageUrl);
  if (!imageResponse.ok) {
    throw new TwitterClientError(`Failed to get image: ${imageResponse.status}.`);
  }

  const imageName = (() => {
    const splitted = imageUrl.split('/');
    return splitted[splitted.length - 1];
  })();

  const imageBlob = await imageResponse.blob();
  const endpoint = 'https://upload.twitter.com/1.1/media/upload.json';

  const formData = new FormData();
  formData.append('Content-Type', 'application/octet-stream');
  formData.append('media', imageBlob, imageName);
  formData.append('media_category', 'tweet_image');

  const uploadImageResponse = await oAuth1Fetch(oauthConf, endpoint, {
    method: 'POST',
    body: formData,
  });

  const response = await uploadImageResponse.json();
  return response as TwitterImage;
}
