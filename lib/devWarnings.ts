let warned = false;

export function warnAnyCastStillPresent() {
  if (process.env.NODE_ENV === 'production' || warned) return;
  // eslint-disable-next-line no-console
  console.warn('[dev] prisma.signal accessed via helper any-cast. Regenerate client and remove helper when types appear.');
  warned = true;
}