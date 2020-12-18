export default interface SystemCommandService {
  executeCommand<T>(
    command: string,
    ...rest: any[]
  ): Thenable<T | undefined> | undefined;
}
