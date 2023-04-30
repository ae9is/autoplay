// ref: https://stackoverflow.com/questions/43118692
export function filterNull<Type>(array: Type[]) {
   return array?.filter((e): e is Exclude<typeof e, null> => e !== null) || []
}
