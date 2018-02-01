function isObjectLiteral(_obj) {
    return (Object.getPrototypeOf(Object.getPrototypeOf(_obj)) === null);
}

function isEmptyObject(obj){
    return Object.keys(obj).length===0;
}

function validateInput(obj) {
    if (!obj || !isObjectLiteral(obj)){
      throw NOT_VALID;
    }
}

module.exports = {
  isObjectLiteral : isObjectLiteral,
  isEmptyObject : isEmptyObject,
  validateInput : validateInput
}
