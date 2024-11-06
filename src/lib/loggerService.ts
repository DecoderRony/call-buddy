// TODO: Add a way for logs in production

class Logger {
  error(...args: any[]) {
    if (process.env.NODE_ENV !== "production") {
      console.error(...args);
    }
  }

  warn(...args: any[]) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(...args);
    }
  }

  info(...args: any[]) {
    if (process.env.NODE_ENV !== "production") {
      console.info(...args);
    }
  }

  debug(...args: any[]) {
    if (process.env.NODE_ENV !== "production") {
      console.log(...args);
    }
  }
}

export default new Logger();
