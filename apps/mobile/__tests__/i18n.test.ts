import en from '../i18n/en.json';
import ar from '../i18n/ar.json';
import es from '../i18n/es.json';

function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null) {
      keys.push(...getAllKeys(v as Record<string, unknown>, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

describe('i18n locale files', () => {
  const enKeys = getAllKeys(en as unknown as Record<string, unknown>);
  const arKeys = getAllKeys(ar as unknown as Record<string, unknown>);
  const esKeys = getAllKeys(es as unknown as Record<string, unknown>);

  it('ar has all keys that en has', () => {
    for (const key of enKeys) {
      expect(arKeys).toContain(key);
    }
  });

  it('es has all keys that en has', () => {
    for (const key of enKeys) {
      expect(esKeys).toContain(key);
    }
  });

  it('en welcome_title is present', () => {
    expect((en as any).onboarding.welcome_title).toContain("Discipline");
  });

  it('en closed string is exactly "Closed."', () => {
    expect((en as any).home.closed).toBe('Closed.');
  });
});
