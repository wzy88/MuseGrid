const { pathToFileURL } = require('url');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

(async () => {
  const moduleUrl = pathToFileURL(`${process.cwd()}/src/app/design/themeMode.ts`).href;
  const { getInitialThemeMode } = await import(moduleUrl);

  const makeStorage = (value) => ({
    getItem(key) {
      assert(key === 'musegrid.v2.themeMode', 'theme mode should read the existing storage key');
      return value;
    },
  });

  assert(getInitialThemeMode(makeStorage(null)) === 'deep', 'missing saved theme should default to deep');
  assert(getInitialThemeMode(makeStorage('light')) === 'light', 'saved light theme should be respected');
  assert(getInitialThemeMode(makeStorage('deep')) === 'deep', 'saved deep theme should be respected');
  assert(getInitialThemeMode(makeStorage('unexpected')) === 'deep', 'invalid saved theme should fall back to deep');
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
