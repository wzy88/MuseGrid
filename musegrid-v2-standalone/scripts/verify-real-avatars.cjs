const assert = require('node:assert/strict');

(async () => {
  const state = await import('../src/app/state/mockProject.ts');
  const avatars = state.AVATARS.map(state.normalizeAvatar);
  const missingProfile = avatars.filter((avatar) =>
    !avatar.method ||
    !avatar.avoid ||
    !avatar.representativeWorks?.length ||
    Object.keys(avatar.styleWeights || {}).length < 3
  );
  assert.equal(missingProfile.length, 0, `all seeded avatars need real profile fields: ${missingProfile.map((avatar) => avatar.name).join(', ')}`);

  for (const direction of ['作词', '作曲', '编曲', '制作']) {
    assert.ok(avatars.filter((avatar) => avatar.dir === direction).length >= 2, `${direction} needs at least two real avatars`);
  }
})();
