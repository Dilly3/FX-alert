export function sum<T extends number | string>(a: T, b: T){
  if (typeof a === "string" && typeof b === "string") {
    return (a + b) as T;
  }
  if (typeof a === "number" && typeof b === "number") {
    return (a + b) as T;
  }

}
    