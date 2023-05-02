// Utility functions
import _ from 'lodash'

// ref: https://stackoverflow.com/questions/43118692
export function filterNull<Type>(array: Type[]) {
   return array?.filter((e): e is Exclude<typeof e, null> => e !== null) || []
}

// Note no support for customising object equality for Set yet (ref: https://stackoverflow.com/a/29759699/639687).
// lodash _.isEqual deeply compares key/values in objects.
export function filterDups<Type>(array: Type[]) {
   return _.uniqWith(array, _.isEqual)
}