# MuseGrid API Contracts

MuseGrid exposes client-facing HTTP contracts under `/api/v1`. The Web client is the first consumer, but these routes are shaped as the shared API surface for future App and mini-program clients.

All current `/api/v1/*` routes use the same response envelope:

```ts
type ApiSuccess<T> = {
  ok: true;
  data: T;
};

type ApiFailure = {
  ok: false;
  error: {
    code:
      | "BAD_REQUEST"
      | "UNAUTHORIZED"
      | "FORBIDDEN"
      | "NOT_FOUND"
      | "CONFLICT"
      | "PAYMENT_REQUIRED"
      | "INTERNAL_ERROR";
    message: string;
  };
};
```

Unless noted otherwise, request and response bodies are JSON.

## Auth

### `POST /api/v1/auth/register`

- Auth: Public
- Request body:

```json
{
  "name": "MuseGrid Creator",
  "email": "creator@musegrid.local",
  "password": "musegrid-pass-123"
}
```

- Success response:

```json
{
  "ok": true,
  "data": {
    "user": {
      "id": "usr_123",
      "email": "creator@musegrid.local",
      "name": "MuseGrid Creator",
      "role": "creator_user"
    }
  }
}
```

- Failure response:

```json
{
  "ok": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "请填写名称、邮箱和至少 8 位密码。"
  }
}
```

### `POST /api/v1/auth/login`

- Auth: Public
- Request body:

```json
{
  "email": "creator@musegrid.local",
  "password": "musegrid-pass-123"
}
```

- Success response: same `user` shape as register.
- Failure response example:

```json
{
  "ok": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "邮箱或密码不正确。"
  }
}
```

### `POST /api/v1/auth/logout`

- Auth: Session user recommended
- Request body: none
- Success response:

```json
{
  "ok": true,
  "data": {}
}
```

- Failure response: none currently emitted by the route.

## Projects

### `GET /api/v1/projects`

- Auth: Required
- Request body: none
- Success response:

```json
{
  "ok": true,
  "data": {
    "projects": [
      {
        "id": "prj_123",
        "title": "霓虹夜航",
        "status": "draft"
      }
    ]
  }
}
```

- Failure response example:

```json
{
  "ok": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "请先登录后再访问项目。"
  }
}
```

### `POST /api/v1/projects`

- Auth: Required
- Request body:

```json
{
  "title": "霓虹夜航",
  "initialIdea": "想写一首适合深夜开车听的中文 R&B",
  "language": "中文",
  "genre": "R&B",
  "mood": "释怀",
  "intendedUse": "个人发行"
}
```

- Success response:

```json
{
  "ok": true,
  "data": {
    "project": {
      "id": "prj_123",
      "title": "霓虹夜航",
      "status": "draft"
    }
  }
}
```

- Failure response example:

```json
{
  "ok": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "请补全项目名称、语言、曲风、情绪和用途。"
  }
}
```

### `GET /api/v1/projects/:projectId`

- Auth: Required
- Request body: none
- Success response:

```json
{
  "ok": true,
  "data": {
    "project": {
      "id": "prj_123",
      "title": "霓虹夜航",
      "status": "completed"
    },
    "generations": [
      {
        "id": "gen_123",
        "provider": "sample",
        "status": "completed",
        "model": "music-2.6-free",
        "createdAt": "2026-06-18T10:00:00.000Z",
        "audioUrl": "https://cdn.example.com/demo.mp3"
      }
    ]
  }
}
```

- Failure response example:

```json
{
  "ok": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "项目不存在或无权访问。"
  }
}
```

## Production Steps

### `POST /api/v1/projects/:projectId/steps/:stepType/avatar`

- Auth: Required
- Request body:

```json
{
  "selectedAvatarId": "avatar_lyrics_001"
}
```

- Success response:

```json
{
  "ok": true,
  "data": {
    "step": {
      "id": "step_123",
      "stepType": "lyrics",
      "selectedAvatarId": "avatar_lyrics_001",
      "status": "draft"
    }
  }
}
```

- Failure response example:

```json
{
  "ok": false,
  "error": {
    "code": "CONFLICT",
    "message": "请先完成并确认前一步，再选择当前步骤的创作人分身。"
  }
}
```

### `POST /api/v1/projects/:projectId/steps/:stepType/generate`

- Auth: Required
- Request body: none
- Success response:

```json
{
  "ok": true,
  "data": {
    "step": {
      "id": "step_123",
      "stepType": "lyrics",
      "status": "ready",
      "outputPayload": {
        "theme": "夜间城市",
        "hookOptions": ["..."],
        "fullLyricDraft": "[Chorus] ..."
      }
    }
  }
}
```

- Failure response example:

```json
{
  "ok": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "请先选择创作人。"
  }
}
```

### `POST /api/v1/projects/:projectId/steps/:stepType/confirm`

- Auth: Required
- Request body: none
- Success response:

```json
{
  "ok": true,
  "data": {
    "step": {
      "id": "step_123",
      "stepType": "lyrics",
      "status": "completed"
    },
    "contribution": {
      "id": "ctr_123",
      "projectId": "prj_123",
      "stepType": "lyrics",
      "avatarId": "avatar_lyrics_001",
      "contributionWeight": 25
    }
  }
}
```

- Failure response example:

```json
{
  "ok": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "请先生成步骤内容。"
  }
}
```

## Demo Generation

### `POST /api/v1/projects/:projectId/generate-demo`

- Auth: Required
- Request body: none
- Success response:

```json
{
  "ok": true,
  "data": {
    "generation": {
      "id": "gen_123",
      "status": "completed",
      "provider": "sample",
      "model": "music-2.6-free",
      "createdAt": "2026-06-18T10:00:00.000Z"
    },
    "audioAsset": {
      "id": "aud_123",
      "storageUrl": "https://cdn.example.com/demo.mp3",
      "duration": 61000,
      "format": "mp3"
    }
  }
}
```

- Failure response examples:

```json
{
  "ok": false,
  "error": {
    "code": "CONFLICT",
    "message": "请先确认制作步骤，再生成可播放 Demo。"
  }
}
```

```json
{
  "ok": false,
  "error": {
    "code": "PAYMENT_REQUIRED",
    "message": "可用生成次数不足，请稍后再试。"
  }
}
```

## Works

MuseGrid currently has a Works product surface, but no dedicated `/api/v1/works` route yet.

- Current implementation:
  - Web pages load works through server-side repository calls in `apps/web/app/works/**`.
  - Project detail data for playable outputs is available through `GET /api/v1/projects/:projectId`.
- Contract implication:
  - App and mini-program clients should treat `GET /api/v1/projects/:projectId` as the stable remote contract that already exposes generation history.
  - A future `/api/v1/works` route should reuse the same envelope and derived project/generation shapes rather than inventing a different response style.

## Creator Applications

### `POST /api/v1/creator-applications`

- Auth: Required
- Request body:

```json
{
  "capabilityDirection": "lyrics",
  "profileData": {
    "displayName": "夜航作词人",
    "tagline": "城市夜色叙事",
    "styleTags": "R&B, City Pop",
    "experience": "10 年作词经历",
    "caseDescription": "擅长都市感中文歌词。"
  },
  "workSamples": [
    {
      "title": "样例作品",
      "description": "都市感中文歌词。"
    }
  ],
  "questionnaireAnswers": {
    "creativeApproach": "先定情绪与画面",
    "correctionMethod": "逐段纠偏",
    "boundaries": "不模仿具体歌手"
  }
}
```

- Success response:

```json
{
  "ok": true,
  "data": {
    "applicationId": "app_123",
    "avatarId": "avatar_123",
    "dashboardUrl": "/avatar-dashboard"
  }
}
```

- Failure response example:

```json
{
  "ok": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "请补全创作人档案信息。"
  }
}
```
