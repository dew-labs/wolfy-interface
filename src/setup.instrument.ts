import {
  addIntegration,
  browserTracingIntegration,
  consoleLoggingIntegration,
  init,
  lazyLoadIntegration,
  makeBrowserOfflineTransport,
  makeFetchTransport,
  moduleMetadataIntegration,
  thirdPartyErrorFilterIntegration,
} from '@sentry/react'

import {API_URL, APP_NAME, COMMIT_HASH, DEBUG, MODE, SENTRY_DSN} from './constants/config'

export const DEPTH = 10

// TODO: Shared Environment implementation
if (!DEBUG) {
  init({
    environment: MODE,
    debug: MODE !== 'production',
    // TODO: config release based on package.json version
    release: `${APP_NAME}-web@${COMMIT_HASH}`, // NOTE: have to follow `sentryVitePlugin`
    dsn: SENTRY_DSN,
    integrations(integrations) {
      const filteredIntegrations = integrations.filter(integration => {
        return !['LinkedErrors'].includes(integration.name) // lazyload it later
      })

      filteredIntegrations.push(
        ...[
          thirdPartyErrorFilterIntegration({
            filterKeys: [APP_NAME],
            behaviour: 'drop-error-if-contains-third-party-frames',
          }),
          browserTracingIntegration(),
          // send console.* calls as logs to Sentry: https://docs.sentry.io/platforms/javascript/guides/react/logs/
          consoleLoggingIntegration({
            levels: ['log', 'error', 'warn', 'info', 'debug', 'assert', 'trace'],
          }),
          moduleMetadataIntegration(),
        ],
      )
      return filteredIntegrations
    },
    sendClientReports: false, // TODO: Enable this?
    // Performance Monitoring
    tracesSampleRate: MODE === 'production' ? 0.25 : 1.0, //  Capture 25% of the transactions on production
    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ['localhost', RegExp(`^${window.location.origin}/api`), RegExp(`^${API_URL}`)],
    // Session Replay
    replaysSessionSampleRate: MODE === 'production' ? 0.05 : 1.0, // This sets the sample rate at 5% on production
    replaysOnErrorSampleRate: 1.0,
    profilesSampleRate: 1.0,
    profileLifecycle: 'trace',
    transport: makeBrowserOfflineTransport(makeFetchTransport),
    transportOptions: {}, // https://docs.sentry.io/platforms/javascript/guides/react/best-practices/offline-caching/
    ignoreTransactions: [], // TODO: add more ignore transactions
    ignoreErrors: [],
    normalizeDepth: DEPTH,
    // Enable logs to be sent to Sentry
    enableLogs: true,
    // Adds request headers and IP for users
    sendDefaultPii: true,
    _experiments: {enableMetrics: true},
  })
}

type LazyloadableIntegration = Parameters<typeof lazyLoadIntegration>[0]

async function loadSentryIntegration(name: LazyloadableIntegration) {
  const integration = await lazyLoadIntegration(name)
  addIntegration(integration())
}

const integrations: LazyloadableIntegration[] = [
  'dedupeIntegration',
  'linkedErrorsIntegration',
  'replayIntegration',
  'replayCanvasIntegration',
  'browserProfilingIntegration',
  'contextLinesIntegration',
  'extraErrorDataIntegration',
  'moduleMetadataIntegration',
  'reportingObserverIntegration',
  // 'graphqlClientIntegration',
  // 'httpClientIntegration', // Automatically capture all failed request
  // 'captureConsoleIntegration', // Automatically capture all console logs
  // 'debugIntegration', // Not available anymore
  // 'rewriteFramesIntegration',
  // 'feedbackIntegration',
  // 'feedbackModalIntegration',
  // 'feedbackScreenshotIntegration',
]

export function loadSentryIntegrations() {
  integrations.forEach(integration => {
    loadSentryIntegration(integration).catch(() => {
      /* do nothing, its okay to miss some integrations */
    })
  })
}
