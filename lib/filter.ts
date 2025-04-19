/**
 * filtr - MongoDB inspired array filtering
 * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
 * @see https://github.com/logicalparadox/filtr
 * MIT Licensed
 */

/*!
 * define what comparators are traversable
 */

const traversable = {
    $and: true
  , $or: true
  , $nor: true
}

/*!
 * helper function for setting defaults
 */

function _defaults (a: Record<string, unknown>, b: Record<string, unknown>) {
  if (a && b) {
    for (var key in b) {
      if ('undefined' == typeof a[key])
        a[key] = b[key];
    }
  }
  return a;
}

/*!
 * Main exports
 */

// module.exports = Filtr;
type Value = string | number | boolean | null;
type Comparator = keyof typeof Filtr.comparators;

export type Query = {
  [k in Comparator]?: k extends Extract<Comparator, keyof typeof traversable> ? Query[]: k extends Extract<Comparator, "$lt" | "$gt"> ? string | number : string | number | boolean | null
}


/**
 * # Filtr (constructor)
 *
 * Constructor for creating a new filtr.
 *
 *    var query = filtr({ $gt: 5 })
 *      , alsoq = new filtr({ $gt: 5 });
 *
 * See the README or Filtr.comparators for constructing
 * well formed queries.
 *
 * @param {Object} query
 */
export class Filtr {
    query: unknown;
    stack: unknown[];
    constructor(query: Query){
        this.query = query;      
        this.stack = parseQuery(query);
    }
    
    /**
    * ## .comparators
    *
    * Object containing all query compators.
    */

    static comparators = {
        $gt: function (a: Extract<Value, string | number>, b: Extract<Value, string | number>) {
          return a > b;
        }
      
        , $gte: function (a: Extract<Value, string | number>, b: Extract<Value, string | number>) {
          return a >= b;
        }
      
        , $lt: function (a: Extract<Value, string | number>, b: Extract<Value, string | number>) {
          return a < b;
        }
      
        , $lte: function (a: Extract<Value, string | number>, b: Extract<Value, string | number>) {
          return a <= b;
        }
      
        , $all: function (a: any, b: any) {
          for (var i = 0; i < b.length; i++) {
            if (!~a.indexOf(b[i])) return false;
          }
          return true;
        }
      
        , $exists: function (a: any, b: any) {
          return !!a == b;
        }
      
        , $mod: function (a: any, b: any) {
          return a % b[0] == b[1];
        }
      
        , $eq: function (a: Value, b: Value) {
          return a == b;
        }
      
        , $ne: function (a: Value, b: Value) {
          return a != b;
        }
      
        , $in: function (a: string, b: string) {
          return ~b.indexOf(a) ? true : false;
        }
      
        , $nin: function (a: string, b: string) {
          return ~b.indexOf(a) ? false : true;
        }
      
        , $size: function (a: any, b: any) {
          return (a.length && b) ? a.length == b : false;
        }
      
        , $or: function (a: any[]) {
          var res = false;
          for (var i = 0; i < a.length; i++) {
            var fn = a[i];
            if (fn) res = true;
          }
          return res;
        }
      
        , $nor: function (a: any) {
          var res = true;
          for (var i = 0; i < a.length; i++) {
            var fn = a[i];
            if (fn) res = false;
          }
          return res;
        }
      
        , $and: function (a: any[]) {
          var res = true;
          for (var i = 0; i < a.length; i++) {
            var fn = a[i];
            if (!fn) res = false;
          }
          return res;
        }
    };

    /**
     * # .getPathValue(path, object)
     *
     * This is a convience function offed by Filtr to allow
     * the retrieval of values in an object given a string path.
     *
     *     var obj = {
     *         prop1: {
     *             arr: ['a', 'b', 'c']
     *           , str: 'Hello'
     *         }
     *       , prop2: {
     *             arr: [ { nested: 'Universe' } ]
     *           , str: 'Hello again!'
     *         }
     *     }
     *
     * The following would be the results.
     *
     *     filtr.getPathValue('prop1.str', obj); // Hello
     *     filtr.getPathValue('prop1.att[2]', obj); // b
     *     filtr.getPathValue('prop2.arr[0].nested', obj); // Universe
     *
     * @param {String} path
     * @param {Object} object
     * @returns {Object} value or `undefined`
     */

    static getPathValue(path: string, obj: Record<string, any>) {
        var parsed = parsePath(path);
        return getPathValue(parsed, obj);
    };    


    /**
     * # .setPathValue(path, value, object)
     *
     * This is a convience function offered by Filtr to allow
     * the defining of a value in an object at a given string path.
     *
     *     var obj = {
     *         prop1: {
     *             arr: ['a', 'b', 'c']
     *           , str: 'Hello'
     *         }
     *       , prop2: {
     *             arr: [ { nested: 'Universe' } ]
     *           , str: 'Hello again!'
     *         }
     *     }
     *
     * The following would be acceptable.
     *
     *     filtr.setPathValue('prop1.str', 'Hello Universe!', obj);
     *     filtr.setPathValue('prop1.arr[2]', 'B', obj);
     *     filtr.setPathValue('prop2.arr[0].nested.value', { hello: 'universe' }, obj);
     *
     * @param {String} path
     * @param {*} value
     * @param {Object} object
     * @api public
     */

    static setPathValue(path: string, val: any, obj: Record<string, any>) {
        var parsed = parsePath(path);
        setPathValue(parsed, val, obj);
    };


    /**
     * # .test(data, [options]);
     *
     * The primary testing mechanism for `Filtr` can be
     * configured to return any number of possible formats.
     *
     * ### Options
     *
     * * *type*: input modifier
     * * * `set`: (default) assert that the data provided is an array. test each item.
     * * * `single`: assert that the data provided is a single item. return boolean.
     * * *spec*: output modifer
     * * * `subset`: (default) return an array containing a subset of matched items
     * * * `boolean`: return an array of the original length with each item being a boolean when object passed or failed.
     * * * `index`: return an array of numbers matching the index of passed object in the original array
     *
     * @param {Array|Object} data to test. must be an array unless option `type: 'single'`.
     * @param {Object} options (optional)
     * @returns {Array|Boolean} result based on options
     */

    test(data: Record<string, any>[] | Record<string, any>, opts: Record<string, any>) {
        let defaults = {
          type: 'set', // set || single
          spec: 'subset' // subset || boolean || index
        }
        , options = _defaults(opts || {}, defaults)
        , res = (options.type == 'single') ? false : [] as any[]
        let dataList: Record<string, any>[] = options.type == 'single' ? [data] : data as Record<string, any>[];
        // if (options.type == 'single') dataList = [ data ];
        // if (options.type == 'single') data = [ data ];
        for (var di = 0, dl = dataList.length; di < dl; di++) {
          var datum = dataList[di]
            , pass = testFilter(datum, this.stack);
          if (options.type == 'single') {
            res = pass;
          } else {
            res = res  as any[]
            switch (options.spec) {
            case 'boolean':
                res.push(pass);
                break;
            case 'index':
                if (pass) res.push(di);
                break;
            default:
                if (pass) res.push(datum);
                break;
            }
          }
        }
        return res;
    };    
  
}

/*!
 * Version number
 */

// Filtr.version = '0.3.0';


/*!
 * ## parsePath(path)
 *
 * Helper function used to parse string object
 * paths. Use in conjunction with `getPathValue`.
 *
 *      var parsed = parsePath('myobject.property.subprop');
 *
 * ### Paths:
 *
 * * Can be as near infinitely deep and nested
 * * Arrays are also valid using the formal `myobject.document[3].property`.
 *
 * @param {String} path
 * @returns {Object} parsed
 */

function parsePath (path: string) {
  var str = path.replace(/\[/g, '.[')
    , parts = str.match(/(\\\.|[^.]+?)+/g);
  return (parts || []).map(function (value) {
    var re = /\[(\d+)\]$/
      , mArr = re.exec(value)
    if (mArr) return { i: parseFloat(mArr[1]) };
    else return { p: value };
  });
};

/**
 * ## getPathValue(parsed, obj)
 *
 * Helper companion function for `.parsePath` that returns
 * the value located at the parsed address.
 *
 *      var value = getPathValue(parsed, obj);
 *
 * @param {Object} parsed definition from `parsePath`.
 * @param {Object} object to search against
 * @returns {Object|Undefined} value
 */

function getPathValue (parsed: Record<string, any>[], obj: Record<string, any>) {
  var tmp = obj
    , res;
  for (var i = 0, l = parsed.length; i < l; i++) {
    var part = parsed[i];
    if (tmp) {
      if ('undefined' !== typeof part.p)
        tmp = tmp[part.p];
      else if ('undefined' !== typeof part.i)
        tmp = tmp[part.i];
      if (i == (l - 1)) res = tmp;
    } else {
      res = undefined;
    }
  }
  return res;
};

/**
 * ## setPathValue (parsed, value, obj)
 *
 * Helper companion function for `parsePath` that sets
 * the value located at a parsed address.
 *
 *      setPathValue(parsed, 'value', obj);
 *
 * @param {Object} parsed definition from `parsePath`
 * @param {*} value to use upon set
 * @param {Object} object to search and define on
 * @api private
 */

function setPathValue (parsed: Record<string, any>, val: any, obj: Record<string, any>) {
  var tmp = obj;
  for (var i = 0, l = parsed.length; i < l; i++) {
    var part = parsed[i];
    if ('undefined' !== typeof tmp) {
      if (i == (l - 1)) {
        if ('undefined' !== typeof part.p)
          tmp[part.p] = val;
        else if ('undefined' !== typeof part.i)
          tmp[part.i] = val;
      } else {
        if ('undefined' !== typeof part.p && tmp[part.p])
          tmp = tmp[part.p];
        else if ('undefined' !== typeof part.i && tmp[part.i])
          tmp = tmp[part.i];
        else {
          var next = parsed[i + 1];
          if ('undefined' !== typeof part.p) {
            tmp[part.p] = {};
            tmp = tmp[part.p];
          } else if ('undefined' !== typeof part.i) {
            tmp[part.i] = [];
            tmp = tmp[part.i]
          }
        }
      }
    } else {
      if (i == (l - 1)) tmp = val;
      else if ('undefined' !== typeof part.p)
        tmp = {};
      else if ('undefined' !== typeof part.i)
        tmp = [];
    }
  }
};

/*!
 * ## parseQuery(query)
 *
 * Given the query input, create a reusable definition
 * for how to test data again the query.
 *
 * @param {Object} query
 * @returns {Array} stack to be used with `Filtr.prototype.test`
 */

function parseQuery(query: Query) {
  let stack = [];

  for (let c in query) {
    const cmd = c as Comparator;
    let qry = {} as {
      test: any,
      path: any
    }
    var params = query[cmd];
    if (cmd[0] == '$') {
      qry.test = parseFilter(query);
    } else {
      if ('string' == typeof params
      || 'number' == typeof params
      || 'boolean' == typeof params) {
        qry.test = parseFilter({ $eq: params });
        qry.path = parsePath(cmd);
      } else {
        qry.test = parseFilter(params as Query);
        qry.path = parsePath(cmd);
      }
    }
    stack.push(qry);
  }
  return stack;
};

/*!
 * ## parseFilter (query)
 *
 * Given that the root object passed is a comparator definition,
 * return a consumable test definition.
 *
 * @param {Object} query
 * @returns {Array} stack for use as input with `testFilter`
 */

type Test<T> = keyof T;
const a = Filtr.comparators;
type keys = Test<typeof a>

function parseFilter(query: Query) {
  var stack = [];
  for (let t in query) {
    const test = t as Comparator
    const tt = test;
    // if(test in Object.keys(Filtr.comparators)){
    //     Filtr.comparators[test];
    // }
    
    var fn = Filtr.comparators[tt]
      , params = query[test] as Query[]
      , traverse = false;
    let st = [];
    let nq;
    if (traversable[test as keyof typeof traversable]) {
      traverse = true;
      for (var i = 0; i < params.length; i++) {
        nq = undefined;
        var p = params[i];
        if ('string' == typeof p
        ||  'number' == typeof p
        ||  'boolean' == typeof p) {
          traverse = false
        } else {
          nq = parseQuery(p);
        }
        st.push(nq);
      }
    }
    stack.push({
        fn: fn
      , params: traverse ? st : params
      , traverse: traverse
    });
  }
  return stack;
};

/*!
 * ## testFilter(value, stack)
 *
 * Given a well-formed stack from `parseFilter`, test
 * a given value again the stack.
 *
 * As the value is passed to a comparator, if that comparator
 * can interpret the value, false will be return. IE $gt: 'hello'
 *
 * @param {Object} value for consumption by comparator test
 * @param {Array} stack from `parseFilter`
 * @returns {Boolean} result
 * @api private
 */

function testFilter (val: any, stack: any) {
  var pass = true;
  for (var si = 0, sl = stack.length; si < sl; si++) {
    var filter = stack[si]
      , el = (filter.path) ? getPathValue(filter.path, val) : val;
    if (!_testFilter(el, filter.test)) pass = false;
  }
  return pass;
};

function _testFilter (val: any, stack: any[]) {
  var res = true;
  for (var i = 0; i < stack.length; i++) {
    var test = stack[i]
      , params = test.params;
    if (test.traverse) {
      var p = [];
      for (var ii = 0; ii < params.length; ii++)
        p.push(testFilter(val, params[ii]));
      params = p;
    }
    if (test.fn.length == 1) {
      if (!test.fn(params)) res = false;
    } else {
      if (!test.fn(val, params)) res = false;
    }
  }
  return res;
};

export function filter(query: Query){
  return new Filtr(query);
}