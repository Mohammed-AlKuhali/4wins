import { palette } from '../theme/colors';
import { type as typeTokens } from '../theme/typography';
import { motion } from '../theme/motion';
import { spacing } from '../theme/spacing';
import * as fs from 'fs';
import * as path from 'path';

describe('Design tokens', () => {
  describe('palette exact values', () => {
    it('dark bg is #0E0E0C', () => expect(palette.dark.bg).toBe('#0E0E0C'));
    it('dark surface is #15140F', () => expect(palette.dark.surface).toBe('#15140F'));
    it('dark text is #FAF7F2', () => expect(palette.dark.text).toBe('#FAF7F2'));
    it('light bg is #FAF7F2', () => expect(palette.light.bg).toBe('#FAF7F2'));
    it('light text is #0E0E0C', () => expect(palette.light.text).toBe('#0E0E0C'));
    it('mental pillar color is #2E4156', () => expect(palette.pillars.mental).toBe('#2E4156'));
    it('financial pillar color is #7C5F26', () => expect(palette.pillars.financial).toBe('#7C5F26'));
    it('spiritual pillar color is #B8A47E', () => expect(palette.pillars.spiritual).toBe('#B8A47E'));
    it('physical pillar color is #A04428', () => expect(palette.pillars.physical).toBe('#A04428'));
  });

  describe('type presets', () => {
    it('display is 40px', () => expect(typeTokens.display.size).toBe(40));
    it('numericLarge is 32px', () => expect(typeTokens.numericLarge.size).toBe(32));
    it('numericLarge uses mono family', () => expect(typeTokens.numericLarge.family).toContain('Mono'));
    it('body is 17px', () => expect(typeTokens.body.size).toBe(17));
    it('caption is 13px', () => expect(typeTokens.caption.size).toBe(13));
  });

  describe('motion', () => {
    it('ritual has correct damping', () => expect(motion.ritual.damping).toBe(14));
    it('ritual has correct stiffness', () => expect(motion.ritual.stiffness).toBe(90));
    it('default has damping 18', () => expect(motion.default.damping).toBe(18));
  });

  describe('spacing', () => {
    it('lg is 16', () => expect(spacing.lg).toBe(16));
    it('xxl is 32', () => expect(spacing.xxl).toBe(32));
    it('xl is 24', () => expect(spacing.xl).toBe(24));
    it('sm is 8', () => expect(spacing.sm).toBe(8));
  });

  describe('banned tokens in theme files', () => {
    const themeDir = path.join(__dirname, '..', 'theme');
    const files = fs.readdirSync(themeDir).filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'));

    const BANNED = ['indigo', 'violet', 'fuchsia', 'Inter ', 'Geist', 'Satoshi'];

    for (const file of files) {
      it(`${file} contains no banned tokens`, () => {
        const content = fs.readFileSync(path.join(themeDir, file), 'utf-8');
        for (const banned of BANNED) {
          expect(content.toLowerCase()).not.toContain(banned.toLowerCase());
        }
      });
    }
  });
});
