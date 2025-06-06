# Obsidian Task Sync

## Main feature

- Google Tasks에서 변경된 Task 상태를 Obsidian 문서에 반영
- Obsidian에서 Task를 수정하면 Google Tasks에도 자동 반영
- 마크다운 문서 내 Task(`- [ ] [Task Title](gtask:taskId:tasklistId)`)를 Google Tasks와 양방향 동기화
- 명령어(Command Palette)를 통한 Task 동기화/생성 지원
- Google OAuth2 인증 지원

## Installation

1. 플러그인 설치

- 이 저장소를 클론하거나 다운로드하여 Obsidian 플러그인 폴더(`.obsidian/plugins/`)에 복사합니다.
- `npm install` 후 `npm run dev`로 개발 모드에서 빌드할 수 있습니다.

2. **Google API 인증 정보 생성**

- Google Cloud Project를 생성합니다. [link](https://developers.google.com/workspace/guides/create-project)
- 사용자 인증 정보에서 OAuth 클라이언트 ID 만듭니다.
- 애플리케이션 유형을 Web Application으로 선택합니다.
- 승인된 자바 스크립트 원본에 `http://127.0.0.1:42813`을 등록합니다.
- 승인된 리디렉션 URI에 `http://127.0.0.1:42813/callback`을 등록합니다.
- 최종적으로 OAuth 클라이언트 ID를 만들 떄 아래 사진처럼 나옵니다. ![GCP proejct 사진](docs/images/create-oauth-client.png)

3. 본인의 gmail을 GCP에 등록하기

- 이후 등록할 Google Task 에 사용할 Google 계정을 GCP에서 등록해야 합니다.(계정은 여러개 등록 가능합니다.)
- `OAuth 동의화면` -> `대상`에서 본인의 gmail을 입력합니다.
  - gmail을 입력하는 대신 `앱 게시` 버튼을 통해 프로덕션 상태로 수정할 순 있지만 그런 경우, 로그인시 경고문구가 뜨게 됩니다.
- 최종 입력상태는 아래와 같습니다.![add email on gcp](docs/images/gcp-test-user-register.png)

4. Google Tasks API 사용 설정

- Google cloud project에서 아래 그림과 같이 Google Task API를 사용으로 바꿉니다.![Google Task API](docs/images/gtask-api-turnon.png)

5. Google API 인증 정보 입력

- 이 그림처럼 oauth에서 아래와 같은 설정 값을 복사합니다.![alt text](docs/images/client-id.png)
  - plugin 설정창에서 클라이언트 ID을 복사해 Google API Client ID에 입력합니다.
  - plugin 설정창에서 클라이언트 비밀번호를 복사해 Google API Secret에 입력합니다.
- 이후 로그인 버튼을 눌러서 본인이 3번 단계에서 설정한 google 계정으로 로그인하면 됩니다. 로그인이 정상적으로 되면 설정이 끝납니다.

## Feature Details

- Task 등록 (Obsidian -> Google Task)
  - Google Task로 관리하고 싶은 작업을 드래그합니다.
  - Command Palette에서 "Turn into Google Task" 명령을 실행합니다.
  - 마크다운 문서 내 Task가 Google Tasks에 등록되고 동기화 관리 대상이 됩니다.
- Task 동기화 (Obsidian -> Google Task)
  - 등록한 Task를 obsidian에서 수정하면(name update, status update) 주기적으로 이를 감지하고 Google Tasks에 반영
- Task 동기화 (Google Task -> Obsidian)

  - 등록한 Task를 Google Task에서 업데이트하고 이를 obsidian에 있는 버튼을 누르면 Google Tasks -> Obsidian으로 업데이트 반영

  ![Task 동기화 예시](docs/images/gtask-to-obsidian-sync.png)

  - 추후 해당 버튼 없어도 동기화되도록 수정

## 마크다운 Task 포맷

```markdown
- [ ] [Task 제목](gtask:taskId:taskListId)
- [x] [완료된 Task](gtask:taskId:taskListId)
```

- `[ ]` : 미완료, `[x]` : 완료
- `gtask:task-list-id:task-id`는 Google Task의 고유 ID입니다.

## 기여 및 문의

- 외부기여를 환영합니다.
- 자세한 API 문서는 [Obsidian API 문서](https://github.com/obsidianmd/obsidian-api)를 참고하세요.
- TBD : Contributing.md 작성하기
