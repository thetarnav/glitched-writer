export type ModifyInterface<T, R> = Omit<T, keyof R> & R
