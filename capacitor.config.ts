import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.mymusicnotes',
  appName: 'My Music Notes',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
