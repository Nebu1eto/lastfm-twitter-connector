import { Command, EnumType } from 'cliffy/command';
import { dedent } from 'dedent';

async function main() {
  return await new Command()
    .name('lastfm-twitter-connector')
    .version('development-stage')
    .description(
      dedent(`
        [Last.fm ↔  Twitter Connector]\n
        Connect Last.fm and Twitter. Upload Periodic Scrobble Status and #NowPlaying Tweets.
      `),
    )
    .type('log-level', new EnumType(['debug', 'info', 'warn', 'error']))
    .option('-d, --debug', 'Enable debug output.', { default: false as const })
    .option('-l, --log-level <level:log-level>', 'Set log level.', {
      default: 'info' as const,
    })
    .arguments('<config-file:string>')
    .action((options, ...args) => {})
    .parse(Deno.args);
}

if (import.meta.main) {
  main();
}
