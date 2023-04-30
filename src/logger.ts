export default class Logger {
  static log(entry: any) {
    console.log(entry)
  }

  static error(entry: any) {
    console.error(entry)
  }
}
