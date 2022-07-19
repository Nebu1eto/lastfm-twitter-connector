# lastfm-twitter-connector

매 분마다 [last.fm](https://last.fm)에서 내가 지금 재생 중인 음악을 가져와 Twitter에 곡 정보와 앨범 아트를 #NowPlaying 해시 태그와 함께 업로드하는 프로그램입니다. 이 프로젝트는 [Deno](https://deno.land) 와 TypeScript를 이용해 만든 프로젝트입니다.

## 사용법

설정 파일을 `config.toml`에 작성한 뒤, `deno run --unstable --allow-env --allow-net --allow-read --allow-write --config deno.jsonc ./src/index.ts config.toml` 커맨드를 입력해서 실행할 수 있습니다. 추후엔 컴파일된 바이너리를 제공하는걸 목표로 하고 있습니다.

## 설정 파일

`config.example.toml`과 `src/models/config.ts`를 참고해주세요.

## 개발 환경 구성

### 개발 환경에 사용한 도구들

 - Deno
 - pre-commit

### 꼭 해야할 것

Git 저장소를 복제한 후, `pre-commit install`을 통해 Git Hook이 제대로 설정되도록 해주세요. 커밋할 때 린트나 포맷을 체크하는 중요한 역할을 합니다.

## 해야할 일

 - [ ] 트위터 인증 프로세스 추가 및 개선
 - [ ] 더 많은 경우에 대한 테스트 케이스 추가
 - [ ] 일간, 주간, 월간 등 주기적 리포트 추가
 - [ ] 더 많은 설정 제공
 - [x] CI를 통해 테스트 및 `deno compile`을 통한 배포 자동화
