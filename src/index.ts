import { Command, EnumType } from 'cliffy/command';
import { dedent } from 'dedent';

import { ConnectorApp } from './connector-app.ts';

async function main() {
  const { options, args } = await new Command()
    .name('lastfm-twitter-connector')
    .version('development-stage')
    .description(
      dedent(`
        [Last.fm ↔  Twitter Connector]\n
        Connect Last.fm and Twitter. Upload Periodic Scrobble Status and #NowPlaying Tweets.
      `),
    )
    .type('log-level', new EnumType(['Trace', 'Debug', 'Info', 'Warn', 'Error', 'Critical']))
    .option('-d, --debug', 'Enable debug output.', { default: false as const })
    .option('-l, --log-level <level:log-level>', 'Set log level.', {
      default: 'Info' as const,
    })
    .arguments('<config-file:string>')
    .parse(Deno.args);

  console.log(options);
  console.log(args);

  const application = new ConnectorApp(options.debug, options.logLevel);
  const result = await application.initialize(args[0]);

  if (!result) {
    Deno.exit(1);
  }

  await application.run();
}

if (import.meta.main) {
  main();
}
