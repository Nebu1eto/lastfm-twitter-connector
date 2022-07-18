# lastfm-twitter-connector

### **[한국어](https://github.com/Hazealign/lastfm-twitter-connector/blob/main/README.ko.md)**

This program checks my now playing music from [last.fm](https://last.fm) every minutes. If Music exists, it posts new tweet contains album art and music's information with #NowPlaying tag. This project uses [Deno](https://deno.land) and TypeScript.

## Usage

Write configuration file in `config.toml`, `deno run --unstable --allow-env --allow-net --allow-read --allow-write --config deno.jsonc ./src/index.ts config.toml` command will run this program. In the future, I aim to provide pre-compiled binary.

## Configuration File

Check `config.example.toml` and `src/models/config.ts`. You will know the configuration's schema.

## Development Environment

### What tools used in this project?

 - Deno
 - pre-commit

### Must to do.

When you clone the git repository, please run `pre-commit install`. This command will setup the git hooks. It'll check lint or code format is valid when you commit.

## Task List

 - [ ] Add and Improve Twitter's Auth Process
 - [ ] Implement More Test Cases
 - [ ] Implement Reports for Daily, Weekly, Monthly
 - [ ] Add More Configurations
 - [ ] Continuous Integration(Test) and Continuous Deployment(with `deno compile`)
