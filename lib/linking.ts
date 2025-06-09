
export const linking = {
  prefixes: ['lockbox://', `${process.env.EXPO_PUBLIC_REDIRECT_URL}`],
  config: {
    screens: {
      resetPassword: 'reset-password',
    },
  },
};
