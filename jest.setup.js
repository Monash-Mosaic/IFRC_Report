import '@testing-library/jest-dom';
import { loadEnvConfig } from '@next/env';

jest.mock('@next/third-parties/google', () => ({
  __esModule: true,
  GoogleAnalytics: () => null,
  GoogleTagManager: () => null,
  YouTubeEmbed: () => null,
  sendGAEvent: jest.fn(),
  sendGTMEvent: jest.fn(),
}));

// Mock fetch for testing environment
global.fetch = jest.fn();

// Mock window.alert
global.alert = jest.fn();

// ref: https://nextjs.org/docs/app/guides/environment-variables#test-environment-variables
// eslint-disable-next-line import/no-anonymous-default-export
export default async () => {
  const projectDir = process.cwd()
  loadEnvConfig(projectDir)
}
