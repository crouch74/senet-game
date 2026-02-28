interface ConsoleLike {
  error: (...args: unknown[]) => void
  log: (...args: unknown[]) => void
  warn?: (...args: unknown[]) => void
}

export interface Logger {
  debug: (message: string, ...args: unknown[]) => void
  error: (message: string, ...args: unknown[]) => void
  info: (message: string, ...args: unknown[]) => void
  warn: (message: string, ...args: unknown[]) => void
}

const getWarnMethod = (consoleLike: ConsoleLike) =>
  consoleLike.warn ?? consoleLike.log

export function createLogger(
  scope: string,
  consoleLike: ConsoleLike = console,
): Logger {
  return {
    debug: (message, ...args) => {
      consoleLike.log(`🔍 [${scope}] ${message}`, ...args)
    },
    info: (message, ...args) => {
      consoleLike.log(`✅ [${scope}] ${message}`, ...args)
    },
    warn: (message, ...args) => {
      getWarnMethod(consoleLike)(`⚠️ [${scope}] ${message}`, ...args)
    },
    error: (message, ...args) => {
      consoleLike.error(`🚨 [${scope}] ${message}`, ...args)
    },
  }
}
