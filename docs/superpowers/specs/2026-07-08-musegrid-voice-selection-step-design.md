# MuseGrid voice selection step design

## Goal

Add a `选声` step to the professional music production flow so the user can choose or summon a voice avatar before final production generates the Demo prompt.

## Flow

The production chain becomes:

```text
作词 -> 作曲 -> 编曲 -> 选声 -> 制作 -> Demo
```

`选声` sits after arrangement because the user needs melody, arrangement, mood, and genre context before deciding the lead voice. `制作` remains the final step because it should combine lyrics, composition, arrangement, selected voice, and mix direction before Demo generation.

## Voice Avatars

Voice avatars are seeded creator avatars with `capabilityDirection = "voice"`. They behave like existing avatars in selection, generation, revision, confirmation, quick mode, and contribution records.

Initial voice avatars:

- `夜色低语女声`: intimate, breathy, close-mic Chinese R&B voice.
- `清亮少年声`: bright, clean, youthful pop voice.
- `磁性低音男声`: warm low male voice for narrative and cinematic songs.
- `电子虚拟声`: synthetic vocal color for future pop and electronic work.

## Output Contract

The voice step output should include:

- `voiceType`
- `vocalRange`
- `performanceStyle`
- `pronunciation`
- `referenceMood`
- `draft`

`draft` is the editable summary shown in the workspace. The MiniMax prompt builder should add a required `Voice:` section before `Production:` so voice casting survives prompt compaction.

## UI Copy

The studio should label the step as `选声`. User-facing copy should call the collaborator a `声音分身` where the context is voice-specific, while reusing the existing creation mode and avatar-selection mechanics.

The self path means the user writes their own voice direction. The avatar path means the user summons a voice avatar and can revise the voice casting draft before confirmation.

## Out Of Scope

- Real voice cloning or uploaded voice samples.
- Voice licensing workflow.
- Audio preview generation for each voice avatar.
- Database migrations.

## Success Criteria

- New projects contain five ordered production steps.
- Existing unlock/progress logic treats `voice` as required before `production`.
- Quick mode can auto-select a voice avatar and complete the voice step.
- Final Demo prompts include the confirmed voice direction.
- Studio UI shows `选声` and contribution progress counts five steps.
