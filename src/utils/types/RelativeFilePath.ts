//
/**
 * For dealing with (relative) file paths in TypeScript/JavaScript {@link https://github.com/microsoft/vscode-ts-file-path-support}
 *
 * @example
 * ```tsx
 * function myFn(path: RelativeFilePath<'$dir/mySubDir'>) {
 *   // The implementation is up to you.
 * }
 * ```
 * Use $dir to reference the full directory path to the file that defines the function.
 * The first overloading of this function must have exactly one parameter which has to be of the mentioned type.
 * Now you get editor support for file paths in myFn call expressions!
 *
 * ```tsx
 * // Relative to `mySubDir` in the directory of the source file that defines `myFn`
 * myFn('myDir/myFile.txt');
 * ```
 */
export type RelativeFilePath<T extends string> = string & {baseDir?: T}
