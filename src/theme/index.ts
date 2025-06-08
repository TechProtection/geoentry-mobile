export * from './colors';
export * from './typography';
export * from './spacing';
export const theme = {
    COLORS: {
        background: '#070A0F',
        textPrimary: '#FAFAFA',
        accent: '#36BFFA',
        secondary: '#27292C',
        statusGreen: '#3EB775',
        statusRed: '#D9534F',
        destructive: '#801E1E',
    },
    TYPOGRAPHY: {
        title: 24,
        subtitle: 18,
        body: 14,
    },
};
export type ThemeType = typeof theme;