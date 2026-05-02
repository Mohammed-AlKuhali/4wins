import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { TypeVariant } from '../theme/typography';

interface TextProps extends RNTextProps {
  variant?: TypeVariant;
  color?: string;
}

export function Text({ variant = 'body', color, style, allowFontScaling = true, ...rest }: TextProps) {
  const { type, colors } = useTheme();
  const preset = type[variant];

  return (
    <RNText
      allowFontScaling={allowFontScaling}
      style={[
        {
          fontFamily: preset.family,
          fontWeight: preset.weight,
          fontSize: preset.size,
          lineHeight: preset.lineHeight,
          letterSpacing: 'letterSpacing' in preset ? preset.letterSpacing : undefined,
          color: color ?? colors.text,
        },
        style,
      ]}
      {...rest}
    />
  );
}

export default Text;
