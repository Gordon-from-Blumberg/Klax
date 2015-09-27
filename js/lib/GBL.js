/**
 * @author Gordon from Blumberg
 * @description Main library of functions for various purpose
 * @version 1.0.0
 */

define('GBL', [], function () {
    "use strict";

    var global=window,
        d=document,
        gbl;

    gbl = {
        name: 'GBL.js',
        version: '1.0.0',
        DESC_NOT_ENUMERABLE: {
            enumerable: false,
            cofigurable: true,
            writable: true
        },

        _measureDuration: function _measureDuration(func, number, name) {
            var timeStart, timeEnd, i;
            if (!gbl.isFunction(func)) console.log('This requires a function for the duration measuring!');
            i = number = number || 10;
            name = name ? ' ' + name : '';
            timeStart = new Date;
            while (i--) {
                func();
            }
            timeEnd = new Date;
            console.log('Duration of ' + number + name + ' runs is ' + (timeEnd - timeStart) + 'ms.');
        },

        _crFunForAnyArgsNumber: function _crFunForAnyArgsNumber(func, check/*,number*/) {
            check = check || function (a) {
                if (gbl.isArray(a) || gbl.isArguments(a)) return a
            };
            //number=number||0;
            return function f(a) {
                var args = arguments, i, arr, len;
                if (args.length > /*number+*/1) {
                    for (i = 0, len = args.length; i < len; i++) {
                        f.call(this, args[i])
                    }
                    return
                }
                arr = check.call(this, a);
                if (arr) {
                    for (i = 0, len = arr.length; i < len; i++) {
                        f.call(this, arr[i])
                    }
                    return
                }
                func.call(this, a)
            }
        },

        _export: function _export() {
            var i, len = arguments.length, module;
            if (typeof arguments[0] == 'object') {
                module = arguments[0];
                i = 1;
            } else {
                module = gbl;
                i = 0;
            }
            for (i; i < len; i++) {
                if (typeof global[arguments[i]] == 'undefined') {
                    global[arguments[i]] = module[arguments[i]]
                }
                else {
                    console.log('Warning! Global name "' + arguments[i] + '" has already used!')
                }
            }
        },

        _logError: function _logError(er) {
            er = typeof er == 'string' ? {message: er} : er;
            console.error('ERROR' + (typeof er.type == 'string' ? ': ' + er.type : '')
            + '!\n ' + er.message)
        },

        namespace: function namespace(ns) {
            var parts = ns.split('.'),
                parent = GBL,
                currentNS = 'GBL',
                i, len;

            if (parts[0] === currentNS) {
                parts = parts.slice(1);
            }
            for (i = 0, len = parts.length; i < len; i += 1) {
                currentNS += '.' + parts[i];
                if (typeof parent[parts[i]] === 'undefined') {
                    parent[parts[i]] = {};
                } /*else {
                    console.log('Attention! Namespace "' + currentNS + '" has already defined!')
                }*/
                parent = parent[parts[i]];
            }
            return parent;
        },

        cloneObj: function cloneObj(obj) {   //Клонирует объекты, массивы, DOM-объекты
            var clone = {};

            gbl.forOwn(obj, function (key) {
                if (gbl.isPrimitive(this[key])) {
                    clone[key] = this[key];
                    return;
                }
                if (gbl.isArray(this[key])) {
                    clone[key] = this[key].slice();
                    return;
                }
                if (this[key].tagName) {
                    clone[key] = this[key].cloneNode(true);
                    return;
                }
                clone[key] = cloneObj(obj[key]);
            });

            return clone;
        },

        forOwn: function forOwn(obj, func) {  //run func in loop for only own properties of obj
            var key;                        //func expects name of property
            for (key in obj) {              //this refers to obj
                if (obj.hasOwnProperty(key)) {
                    func.call(obj, key)
                }
            }
            return obj
        },

        keys: Object.keys || function keys(obj) {
            var arr = [];
            gbl.forOwn(obj, function (key) {
                arr.push(key)
            });
            return arr;
        },

        /* expects child obj by first argument, other arguments are parent object
         * if last argument is true child properties will be overriden
         * and will not overwise
         * returns child */
        extend: function extend(child) {
            var args = gbl.toArray(arguments),
                num,
                override;

            args.shift();
            if (args[args.length - 1] === true) {
                override = 1;
                args.pop();
            }
            num = args.length;
            while (num--) {
                gbl.forOwn(args[num], function (prop) {
                    child[prop] = gbl.isDefined(child[prop]) && !override ? child[prop] : this[prop]
                })
            }
            return child;
        },

        getType: function getType(v) {
            return (v && v.constructor) ? v.constructor.name : Object.prototype.toString.call(v).slice(8, -1)
        },
        isInteger: function isInteger(n) {  //проверяет, целое ли число
            return typeof n == 'number' && n == (n ^ 0)
        },
        isArray: function isArray(arr) {
            return gbl.getType(arr) == 'Array'
        },
        isArguments: function isArguments(args) {
            return Object.prototype.toString.call(args) == '[object Arguments]'
        },
        isFunction: function isFunction(func) {
            return typeof func == 'function'
        },
        isPrimitive: function isPrimitive(v) {
            return 'Number String Boolean Null Undefined'.hasWord(gbl.getType(v))
        },
        isDefined: function isDefined(v) {
            return typeof v !== 'undefined'
        },
        toArray: function toArray(args) {
            return Array.prototype.slice.call(args)
        },

        //Mathematical methods
        round: function round(n, a) {
            var d;
            if (!a || !gbl.isInteger(a)) return Math.round(n);
            d = Math.pow(10, a);
            return Math.round(n * d) / d
        },
        sqrt: Math.sqrt,   //возвращает квадратный корень
        sqr: function sqr(n) {
            return n * n
        },    //возвращает квадрат
        getPart: function getPart(n, p) {
            p = p || 6;
            while (n < 0) {
                n += p
            }
            return n % p
        },
        makeRange: function(from,to) {
            var t;
            from=+from;
            to=+to;
            if (isNaN(from)||isNaN(to)) {
                throw {
                    type:'Range',
                    message: 'For range making from and to must be numbers!'
                }
            }
            if (from>to) {
                t=from=to;
                to=t;
            }
            return function(n) {
                return from<=n&&n<=to
            }
        },

        //Random methods
        d: function d(max, min) {    //Дайс
            min = (min === undefined) ? 1 : min;
            if (max < min) return 0;
            return (min + (max - min + 1) * Math.random()) ^ 0;
        },
        getRandom: function getRandom(a) {    //возвращает случайный индекс массива, принимает массив относительных вероятностей (натуральные числа)
            var ints = [], i, s = 0, rand;
            for (i = 0; i < a.length; i++) {
                ints.push(s += a[i]);
            }
            rand = gbl.d(s);
            for (i = 0; i < a.length; i++) {
                if (rand <= ints[i]) return i;
            }
        },
        normDistribution: function normDistribution(o) {   //o requires any two properties of mathExpect, rangeSize, min or max
            var mathExpect, rangeSize, min,     //and scale coefficient k
                values = [], probabilities = [],   //default accuracy = 25 (it has to be odd)
                s, i, step, x;
            mathExpect = o.mathExpect || o.min + o.rangeSize || o.max - o.rangeSize || (o.min + o.max) / 2 || 0;
            rangeSize = o.rangeSize || o.mathExpect - o.min || o.max - o.mathExpect || (o.max - o.min) / 2 || 0;
            min = o.min || o.mathExpect - o.rangeSize || 2 * o.mathExpect - o.max || o.max - 2 * o.rangeSize || 0;
            o.k = o.k || 10;
            s = rangeSize / Math.log(o.k);
            o.accuracy = o.accuracy || 25;
            step = 2 * rangeSize / (o.accuracy - 1);
            for (i = 0; i < o.accuracy; i++) {
                x = min + i * step;
                values.push(x);
                probabilities.push(round(o.k * Math.exp(-gbl.sqr(x - mathExpect) / (rangeSize * s))));
            }
            return values[gbl.getRandom(probabilities)]
        }
    };

    //Extending native prototypes
    Object.create = Object.create || function () {
        function F() {
        }

        return function (proto) {
            F.prototype = proto;
            return new F
        }
    }();

    Object.defineProperty(Object.prototype,
        'defineProperties',
        gbl.extend({
            value: function (props) {
                return Object.defineProperties(this, props)
            }
        }, gbl.DESC_NOT_ENUMERABLE)
    );

    gbl._extendNative = function _extendNative(Constr, methods) {
        var props = {};
        gbl.forOwn(methods, function (m) {
            props[m] = gbl.extend({value: this[m]}, gbl.DESC_NOT_ENUMERABLE)
        });
        Constr.prototype.defineProperties(props)
    };

    gbl._extendNative(Object, {
        forOwn: function (fn) {
            return gbl.forOwn(this, fn)
        },
        extend: function () {
            var args = gbl.toArray(arguments);
            args.unshift(this);
            return gbl.extend.apply(null, args)
        }
    });

    gbl._extendNative(Function, {
        inherit: function (Parent) {
            this.prototype = Object.create(Parent.prototype);
            this.prototype.constructor = this;
            this.prototype._super = Parent;
            return this
        }
    });

    gbl._extendNative(String, {
        hasWord: function (str) {
            return this.search(new RegExp('\\b' + str + '\\b')) != -1
        },
        has: function (val) {
            if (!gbl.isDefined(val)) {
                return false
            }
            return this.indexOf(val) != -1
        }
    });

    gbl._extendNative(Array, {
        has: ''.has,
        remove: gbl._crFunForAnyArgsNumber(
            function (val) {
                var index;
                if ((index = this.indexOf(val)) != -1) {
                    this.splice(index, 1)
                }
                return this
            },
            function (a) {
                if (gbl.isArguments(a)) {
                    return a
                }
            }
        ),
        last: function () {
            return this[this.length - 1]
        }
    });

    // * Classes *
    //Class Collection
    gbl.Collection = function Collection() {  //constructor
        this.all = [];
        if (!arguments.length) return this;
        return this.push(arguments)
    };

    gbl.Collection.prototype = {    //prototype
        constructor: gbl.Collection,
        typeOfItems: 'Object',   //link to items constructor
        genArrName: 'all',
        length: 0,
        callMethods: function (a) {
            var i, j, arr = gbl.isArguments(a) ? a : arguments, len1, len2;
            for (i = 0, len1 = this[this.genArrName].length; i < len1; i++) {
                for (j = 0, len2 = arr.length; j < len2; j++) {
                    this[this.genArrName][i][arr[j]]();
                }
            }
        },
        clone: function () {
            var newCol = new this.constructor();
            this.forOwn(function (prop) {
                if (prop != this.genArrName) {
                    newCol[prop] = this[prop]
                }
            });
            newCol[this.genArrName] = this[this.genArrName].slice();
            return newCol
        },
        has: function (a) {
            return this[this.genArrName].has(a)
        },
        add: function () {
            var newCol = this.clone();
            return newCol.push(arguments)
        },
        cross: function (a) {
            var self = this,
                newCol = new this.constructor(),
                els = this[this.genArrName],
                arr = gbl.isArray(a) ? a : gbl.toArray(arguments), i, len;
            for (i = 0, len = els.length; i < len; i++) {
                if (arr.every(
                        function (el) {
                            if (gbl.getType(el) != self.constructor.name) return;
                            return el.has(els[i])
                        }
                    )
                ) {
                    newCol.push(els[i])
                }
            }
            return newCol
        },
        subtract: function (sub) {
            var newCol = new this.constructor(), arr = this[this.genArrName], i, len;
            sub = new this.constructor(sub);
            for (i = 0, len = arr.length; i < len; i++) {
                if (!sub.has(arr[i])) newCol.push(arr[i])
            }
            return newCol
        },
        /* callback is called with index and collection
        * inside this refers to element of collection
        * if callback returns false, loop breaks*/
        each: function (func) {
            var arr = this[this.genArrName],
                i, len= arr.length;
            for (i = 0; i < len; i++) {
                if (func.call(arr[i], i, this) === false) break
            }
            return this
        },
        some: function (func) {
            var arr = this[this.genArrName];
            return arr.some(function (item, i) {
                return func.call(item, i)
            })
        },
        every: function (func) {
            var arr = this[this.genArrName];
            return arr.every(function (item, i) {
                return func.call(item, i)
            })
        },
        filter: function (func) {
            var newCol = new this.constructor(), arr = this[this.genArrName], i, len;
            for (i = 0, len = arr.length; i < len; i++) {
                if (func.call(arr[i], i, this)) newCol.push(arr[i])
            }
            return newCol
        },
        isEqual: function (coll) {
            if (this==coll) {return true}
            if (!coll || coll.constructor != this.constructor || coll.length != this.length) {
                return false
            } else {
                return this.every(function () {
                    return coll.has(this)
                })
            }
        },
        remove:function(el) {
            var arr=this[this.genArrName];
            if (typeof el=='number') {
                el=arr[el]
            }
            arr.remove(el);
            this.length=arr.length;
            return this
        },
        sort:function(fn) {
            this[this.genArrName].sort(fn);
            return this
        }
    };

    gbl.Collection.prototype.push = function () {
        var push = gbl._crFunForAnyArgsNumber(
            function (a) {
                var arr = this[this.genArrName];
                if (!a || gbl.getType(a) != this.typeOfItems || arr.has(a)) return;
                if (gbl.isArray(arr)) arr.push(a);
                else arr[arr.length++] = a;
                this.length = arr.length;
            },
            function (a) {
                if (gbl.isArray(a) || gbl.isArguments(a)) return a;
                if (gbl.getType(a) == this.constructor.name) return a[this.genArrName]
            }
        );
        return function () {
            push.apply(this, arguments);
            return this
        }
    }();

    //Class Variables
    gbl.Variables = function () {  //constructor-wrap

        /* Properties in opts:
         * value: number, def: 0;
         * name: string, necessary!;
         * dependence: null for base variable and function for dependent variable;
         */
        var Variable = function Variable(opts, box) {  //Variable constructor
            var value = opts.value || 0;

            this._container = box;
            this.name = typeof opts == 'string' ? opts : opts.name;
            this.dependentList = [];
            this.urDependentList=[];

            this.get = function () {
                return value
            };

            this.isDependent = !!opts.dependence;
            this.isBase = !opts.dependence;

            if (this.isDependent) {
                this.setDependence(opts.dependence);
                this.set = function () {
                    var baseValList = [],
                        baseList = this.baseList,
                        i, len = baseList.length;
                    for (i = 0; i < len; i++) {
                        baseValList.push(box.vars[baseList[i]].get())
                    }
                    value = this.dependence.apply(null, baseValList);

                    this.dependentList.forEach(function (it) {
                        box.vars[it].set()
                    })
                }
            } else {
                this.set = function (newVal) {
                    var oldVal = value;
                    value = newVal;
                    checkValue(this, oldVal);

                    this.dependentList.forEach(function (it) {
                        box.vars[it].set()
                    });

                    function checkValue(v, old) {
                        if (typeof value != 'number') {
                            console.log('Type of ' + v.name + ' is not number!');
                            value = parseFloat(value);
                            if (isNaN(value)) {
                                console.log('And ' + v.name + ' can not be converted in number!');
                                value = old || 0;
                            }
                        }
                    }
                }
            }
        };

        Variable.prototype = {
            constructor: Variable,
            toString: function () {
                return '' + this.get()
            },
            change: function (d) {
                if (this.isDependent) {
                    console.log('Warning! Dependent variables can\'t be changed!');
                    return
                }
                this.set(this.get() + d)
            },
            setDependence: function (dep) {
                var that = this,
                    box = this._container;

                if (gbl.isFunction(this.dependence)) {
                    this.resetDependence()
                }

                try {
                    this.dependence = getDependence(dep);
                } catch (er) {
                    gbl._logError(er)
                }

                gbl.isFunction(this.set) && this.set();
                this.isBase=false;

                return this;

                function getDependence(dep) {
                    var baseListString,
                        depStr,
                        n;

                    if (gbl.isFunction(dep)) {
                        depStr = dep.toString();
                    }
                    if (typeof dep == 'string' && /^sum\(\w[\w\d$_]*(\s*,\w[\w\d$_]*)*\)(,\s*\d)?$/.test(dep)) {
                        depStr = dep;
                        n=dep.match(/,\s*(\d)$/);
                        if (n) {n=+n[1]}
                        dep = function () {
                            var sum = 0;
                            Array.prototype.forEach.call(arguments, function (it) {
                                sum += it
                            });
                            return gbl.round(sum,n);
                        }
                    }

                    if (!depStr) {
                        throw {
                            type: 'Variables',
                            message: 'Invalid dependence for ' + that.name + '!'
                        }
                    }
                    baseListString = depStr.slice(depStr.indexOf('(') + 1, depStr.indexOf(')'));
                    that.baseList = [];
                    that.urBaseList=[];
                    baseListString.split(/, ?/).forEach(function (name) {
                        var vars=box.vars;
                        if (!(name in vars)) {
                            throw {
                                type: 'Variables',
                                message: 'This variables box doesn\'t contain ' + name + '!'
                            }
                        }
                        if (that.dependentList.has(name)||that.urDependentList&&that.urDependentList.has(name)) {
                            throw {
                                type: 'Variables',
                                message: that.name + ' can\'t have a dependence on ' + name
                                + ', because ' + name + ' already depends on ' + that.name + '!'
                            }
                        }
                        if (that.name==name) {
                            throw {
                                type: 'Variables',
                                message: that.name + ' can\'t have a dependence on itself!'
                            }
                        }
                        that.baseList.push(name);
                        vars[name].dependentList.push(that.name);
                        fillUrBaseList(name);
                        vars[name].hasDependent = true;

                        function fillUrBaseList(name) {
                            vars[name].baseList&&vars[name].baseList.forEach(function(name) {
                                vars[name].urDependentList.push(that.name);
                                that.urBaseList.push(name);
                                fillUrBaseList(name);
                            });
                        }
                    });
                    return dep
                }
            },
            resetDependence: function() {
                var thisName=this.name,
                    box=this._container.vars;

                this.dependenc=null;
                this.isBase=true;

                this.baseList&&this.baseList.forEach(function(name) {
                    box[name].dependentList.remove(thisName)
                });
                this.baseList=null;

                this.urBaseList&&this.urBaseList.forEach(function(name) {
                    box[name].urDependentList.remove(thisName)
                });
                this.urBaseList=null;
                return this
            }
        };

        return function Variables() {   //expects list/array of strings or/and objects
            var args=gbl.toArray(arguments),
                vars;
            this.vars = {};
            this._Variable = Variable;

            if (args.length==1&&!('name' in (vars=args[0]))) {
                args.length=0;
                vars.forOwn(function(name) {
                    var obj={name:name};
                    if (gbl.isPrimitive(this[name])) {
                        obj.value=this[name]
                    } else {
                        obj.extend(this[name])
                    }
                    args.push(obj)
                })
            }

            this.add(args);
        }
    }();

    gbl.Variables.prototype = {
        constructor: gbl.Variables,
        length: 0,
        add: gbl._crFunForAnyArgsNumber(function (opts) {
            var vars = this.vars,
                name = typeof opts == 'string' ? opts : opts.name;

            if (gbl.isDefined(vars[name])) {
                console.log('Warning! Variable ' + name + ' has already defined!');
                return;
            }
            vars[name] = new this._Variable(opts, this);
            vars[name].set(opts.value || 0);
            this.length++
        }),
        remove: function (name) {
            var v = this.vars,
                list = v[name].baseList,
                i, len;
            if (v[name].hasDependent) {
                console.log('Warning! Variable ' + name + ' has dependent variables, because can\'t be removed!');
                return
            }
            for (i = 0, len = list.length; i < len; i++) {
                this.vars[list[i]].dependentList.remove(name);
            }
            delete v[name];
            this.length--
        }
    };

    //Class Matrix
    gbl.Matrix=function Matrix(opts) {
        var i,n;
        if (gbl.getType(opts)=='Matrix') {return opts}
        if (gbl.isArray(opts)&&gbl.isArray(opts[0])) {
            this.rows=opts.length;
            for (i=0;i<this.rows;i++) {
                this[i]=opts[i];
                this.columns=!this.columns||this.columns<opts[i].length?opts[i].length
                    :this.columns;
            }
        }
        else if (arguments.length==1&&gbl.isArray(opts)) {
            this.rows=1;
            this[0]=opts;
            this.columns=opts.length;
        }
        else if (gbl.isInteger(opts)) {
            this._createTable(opts,arguments[1]||opts);
        }
        else if (typeof opts=='string'&&/^e\d+$/i.test(opts)) {
            n=parseInt(opts.slice(1));
            this._createTable(n,n);
            this.set(function(i,j) {return i==j?1:0})
        }
        this._check();
    };
    
    gbl.Matrix.sum=function(mx1,mx2) {
        mx1=new gbl.Matrix(mx1);
        mx2=new gbl.Matrix(mx2);
        if (mx1.rows!=mx2.rows||mx1.columns!=mx2.columns) {throw new TypeError('Matrixes have to have equal dimensions for sum!')}
        return new gbl.Matrix(mx1.columns,mx1.rows)
            .set(function(i,j) {
                return mx1[i][j]+mx2[i][j]
            })
    };
    gbl.Matrix.multiply=function(mx1,mx2) {
        var k,mx;

        if (typeof mx1=='number'||typeof mx2=='number') {
            if (typeof mx1=='number') {
                k=mx1;
                mx=new gbl.Matrix(mx2)
            } else {
                k=mx2;
                mx=new gbl.Matrix(mx1)
            }
            return new gbl.Matrix(mx.columns,mx.rows).set(function(i,j) {
                return k*mx[i][j]
            })
        }

        mx1=new gbl.Matrix(mx1);
        mx2=new gbl.Matrix(mx2);

        if (mx1.columns!=mx2.rows) {
            throw new TypeError('First matrix have to have number of column the same number of rows in second one for multiply!')
        }

        return new gbl.Matrix(mx2.columns,mx1.rows).set(function(i,j) {
            var sum= 0,k;
            for (k=0;k<mx1.columns;k++) {
                sum+=mx1[i][k]*mx2[k][j]
            }
            return sum
        })
    };

    gbl.Matrix.prototype={
        constructor:gbl.Matrix,
        _createTable:function(n,m) {
            var i=0;
            this.rows=m;
            this.columns=n;
            for (;i<m;i++) {
                this[i]=new Array(n)
            }
        },
        _check:function() {
            var n=this.columns,
                i,m=this.rows;

            for (i=0;i<m;i++) {
                if (n<this[i].length) {n=this[i].length}
            }
            if (this.columns!=n) {
                this.columns=n;
                for (i=0;i<m;i++) {
                    while (this[i].length<n) {
                        this[i].push(0)
                    }
                }
            }
            if (m==n) {this.isSquare=1}
            return this.each(function(v,i,j) {
                if (!isFinite(v)) {this[i][j]=0}
            })
        },
        clone:function() {
            var mx=this,
                newMx=new gbl.Matrix(this.columns,this.rows);
            if (newMx.isSquare=this.isSquare) {newMx.det=this.det}
            return newMx.set(function(i,j) {return mx.get(i,j)},'!det')
        },
        convertRow:function(r0,r,k) {
            var row0=this[r0],
                row=this[r],
                j,len=this.columns;

            for (j=0;j<len;j++) {
                row0[j]+=k*row[j]
            }
            return this
        },
        replaceRow:function(r1,r2) {
            var row=this[r1];
            this[r1]=this[r2];
            this[r2]=row;
            return this
        },        
        _findDet:function() {
            var clone=this.clone(),
                i,rows=this.rows,
                k=1;
            if (!this.isSquare) {
                throw TypeError('To find det is possible for only a square matrix!')
            }
            if (rows==2) {
                return clone[0][0]*clone[1][1]-clone[0][1]*clone[1][0]
            }
            if (clone[0][0]==0) {
                for (i=0;i<rows;i++) {
                    if (clone[i][0]!=0) {
                        clone.replaceRow(0,i);
                        k=-1;
                        break
                    }
                }
                if (k==1) {return 0}
            }
            for (i=0;i<rows;i++) {
                if (clone[i][0]!=0) {
                    clone.convertRow(i,0,-clone[i][0]/clone[0][0])
                }
            }
            return k*clone[0][0]*(new gbl.Matrix(clone.rows-1).set(function(i,j) {
                    return clone[i+1][j+1]
                },'!det')._findDet());
        },
        //arguments for fn: this value, i, j, this refers to this matrix
        each:function(fn) {
            var m=this.rows,
                n=this.columns,
                i,j;

            for (i=0;i<m;i++) {
                for (j=0;j<n;j++) {
                    fn.call(this,this[i][j],i,j)
                }
            }
            return this
        },
        //arguments for value, if it is function: i, j, this value
        set:function(value,i,j) {
            if (isFinite(value)) {
                if (arguments.length==3) {
                    this[i][j]=value;
                } else{
                    this.each(function(v,i,j) {
                        this[i][j]=value
                    })
                }
            } else if (gbl.isFunction(value)) {
                this.each(function(v,i,j) {
                    var v=value(i,j,this[i][j]);
                    if (isFinite(v)) {this[i][j]=v}
                })
            }
            if (this.isSquare&&arguments[arguments.length-1]!='!det') {
                this.det=this._findDet();
            }
            return this
        },
        get:function(i,j) {return this[i]&&this[i][j]},
        getRow:function(i) {
            return this[i].slice()
        },
        getColumn:function(j) {
            var col=[],
                i,m=this.rows;

            for (i=0;i<m;i++) {
                col.push(this[i][j])
            }
            return col;
        },
        sum:function(mx) {
            return gbl.Matrix.sum(this,mx);
        },
        multiply:function(mx) {
            return gbl.Matrix.multiply(this,mx)
        },
        transpose:function() {
            var mx=this;
            return new gbl.Matrix(mx.rows,mx.columns).set(function(i,j) {
                return mx[j][i]
            })
        }
    };

    //Class Animation
    gbl.Animation=function() {
        var timeFunctionList = {         //standart time functions list
                linear: function (progress) {
                    return progress
                },
                quadratic: function (progress) {
                    return progress * progress
                },
                sqrt: function (progress) {
                    return Math.sqrt(progress)
                },
                circ: function (progress) {
                    return 1 - Math.sin(Math.acos(progress))
                },
                bounce: function (progress) {                 //"подпрыгивание"
                    for (var a = 0, b = 1; 1; a += b, b /= 2) {
                        if (progress >= (7 - 4 * a) / 11) {
                            return -Math.pow((11 - 6 * a - 11 * progress) / 4, 2) + Math.pow(b, 2)
                        }
                    }
                }
            },
            makers={
                pow: function (x) {
                    x = +x || 3;
                    return function (progress) {
                        return Math.pow(progress, x)
                    }
                },
                back: function (x) {   //starts with small move back
                    x = +x || 1.5;
                    return function (progress) {
                        return Math.pow(progress, 2) * ((x + 1) * progress - x)
                    }
                }
            },
            makeTimeFunction = function (val) {
                var pars = val.split(',');
                if (gbl.isFunction(makers[pars[0]])) {
                    return makers[pars[0]].apply(null, pars.slice(1));
                } else {
                    console.log('WARNING! Maker ' + pars[0] + ' is not defined!');
                }
            },
            conversion={
                easeOut:function(tf) {
                    return function(progress) {
                        return 1-tf(1-progress)
                    }
                },
                easeInOut:function(tf) {
                    return function(progress) {
                        return (progress <.5)
                            ?tf(2*progress)/2
                            :(2-tf(2*(1-progress)))/2
                    }
                },
                reverse:function(tf) {
                    return function(progress) {
                        return (progress <.5)
                            ?tf(2*progress)
                            :tf(2*(1-progress))
                    }
                }
            };

        /* Properties in opts:
         * interval: number, def: 30;
         * duration: number, def: 1000;
         * delay: number, def: 0;
         * timeFunction: string | function, def: 'linear'
         */
        return function Animation(opts) {
            var anim=this;
            this.progress=0;

            if (gbl.isFunction(opts.run)) {
                this.run=opts.run
            } else {
                throw {
                    type:'Animation',
                    message:'Animation requires function \'run\'!'
                }
            }

            if (gbl.isFunction(opts.onFinish)) {
                this.onFinish=opts.onFinish;
            }

            this.defaults.forOwn(function(key) {
                anim[key]=opts[key]||this[key]
            });

            if (typeof this.timeFunction == 'string') {
                this.timeFunction = gbl.isFunction(timeFunctionList[this.timeFunction])
                    ? timeFunctionList[this.timeFunction]
                    : gbl.isFunction(makers[this.timeFunction.slice(0,this.timeFunction.indexOf(','))])
                    ? makeTimeFunction(this.timeFunction)
                    : (
                    console.log('WARNING! timeFunction ' + this.timeFunction + ' isn\'t defined!'),
                        timeFunctionList.linear
                );
            }

            if (opts.conversion) {
                if (gbl.isFunction(conversion[opts.conversion])) {
                    this.timeFunction=conversion[opts.conversion](this.timeFunction)
                } else {
                    console.log('WARNING! conversion '+opts.conversion+' isn\'t defined!')
                }
            }

            if (!opts.notPlay) {
                return this.play()
            }
        }
    }();

    gbl.Animation.prototype={
        constructor:gbl.Animation,
        defaults: {
            interval: 30,
            duration: 1000,
            delay: 0,
            timeFunction: 'linear',
            infinite:0
        },
        play:function() {
            var anim=this,
                delay=this.paused?0:this.delay;

            if (this.running) {return this}
            this.running=1;
            this.stopped=0;

            setTimeout(function() {
                anim.start=anim.paused?new Date-anim.pauseTime+(+anim.start)
                    :new Date;
                anim.paused=0;
                anim.timer=setInterval(function() {
                    anim.progress=(new Date-anim.start)/anim.duration;
                    if (anim.progress>1) {anim.progress=1}

                    anim.run(anim.timeFunction(anim.progress));

                    if (anim.progress==1) {
                        if (gbl.isFunction(anim.onFinish)) {anim.onFinish()}

                        if (anim.infinite) {
                            anim.progress=0;
                            anim.start=new Date
                        } else {
                            anim.stop()
                        }
                    }
                },anim.interval)

            },delay);

            return this
        },
        pause:function() {
            if (this.paused||!this.running) {return this}
            clearInterval(this.timer);
            this.pauseTime=new Date;
            this.running=0;
            this.paused=1;
            return this
        },
        stop:function() {
            if (this.stopped) {return this}
            clearInterval(this.timer);
            this.running=0;
            this.paused=0;
            this.progress=0;
            this.stopped=1;
            this.pauseTime=0;
            return this
        }
    };

    //Exporting to global namespace
    gbl._export('d');

    return gbl;
});