export const AppRoutes = {
  '404': '/404',
  welcome: '/welcome',
  index: '/',
  import: '/import',
  home: '/home',
  environmentVariables: '/environment-variables',
  addressBook: '/address-book',
  _offline: '/_offline',
  apps: {
    open: '/apps/open',
    index: '/apps',
    custom: '/apps/custom',
    bookmarked: '/apps/bookmarked',
  },
  balances: {
    nfts: '/balances/nfts',
    index: '/balances',
  },
  newSafe: {
    load: '/new-safe/load',
    create: '/new-safe/create',
  },
  settings: {
    spendingLimits: '/settings/spending-limits',
    setup: '/settings/setup',
    modules: '/settings/modules',
    index: '/settings',
    environmentVariables: '/settings/environment-variables',
    data: '/settings/data',
    appearance: '/settings/appearance',
    safeApps: {
      index: '/settings/safe-apps',
    },
  },
  share: {
    safeApp: '/share/safe-app',
  },
  transactions: {
    tx: '/transactions/tx',
    queue: '/transactions/queue',
    messages: '/transactions/messages',
    index: '/transactions',
    history: '/transactions/history',
  },
}
