const NOT_VALID = "provide a valid input";

export function isObjectLiteral<T extends object = {}>(_obj: T) {
    return (Object.getPrototypeOf(Object.getPrototypeOf(_obj)) === null);
}

export function isEmptyObject<T extends object = {}>(obj: T){
    return Object.keys(obj).length===0;
}

export function validateInput<T extends object = {}>(obj: T): Error | void {
    if (!obj || !isObjectLiteral(obj)){
      throw new Error(NOT_VALID);
    }
}