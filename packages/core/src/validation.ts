export function assertValidInitialIdea(input: string): void {
  if (input.trim().length < 6) {
    throw new Error("请输入至少 6 个字的歌曲灵感");
  }
}
