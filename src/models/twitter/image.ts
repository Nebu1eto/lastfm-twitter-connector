export interface TwitterImage {
  'media_id': bigint;
  'media_id_string': string;
  'media_key': string;
  'size': number;
  'expires_after_secs': number;
  'image': {
    'image_type': string;
    'w': number;
    'h': number;
  };
}
