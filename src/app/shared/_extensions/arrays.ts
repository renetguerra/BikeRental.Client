export function arrayEqual(arr1: any, arr2: any) {
    return JSON.stringify(arr1.sort()) === JSON.stringify(arr2.sort())
}