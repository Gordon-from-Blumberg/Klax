/**
 * @author Gordon from Blumberg
 * @description Common js file
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

define(['GBL'], function(gbl) {
    "use strict";

    var cg={
        name:'config.js',
        version:'1.0.0'
    };

    cg.battlefield={
        teamsCount:2,
        startAreaSize:9,
        obstacle:{
            pars:{
                density:2,
                maxSize:12,
                middleSize:4,
                height:1,
                distribution:'uniform'
            },
            probls:{
                height:[
                    [7,1,0],
                    [6,3,1],
                    [2,5,1],
                    [1,3,5],
                    [0,2,7]
                ],
                size:function(maxS,midS) {
                    var arr=[],prev=1,
                        i, pos, step=2,
                        start;
                    start=((maxS-1)/2>midS-1)?maxS-1:0;
                    for (i=0;i<maxS;i++) {
                        pos=start?maxS-1-i:i;
                        arr[pos]=prev;
                        if (pos==midS-1) {step=-2}
                        prev+=step;
                    }
                    return arr;
                },
                hex:function(distr) {
                    return {
                        center:function(hex) {
                            var d=hex.bfCur.centralHex.getDistance(hex),
                                p=25-d*3;
                            return p<1?1:p
                        },
                        peripheral:function(hex) {
                            return 3+2*hex.bfCur.centralHex.getDistance(hex)
                        },
                        uniform:function() {return 1}
                    }[distr]
                }
            }
        }
    };

    cg.unit={
        races:{
            human:{
                size:3,
                baseDexterity:6,
                baseStrength:6,
                baseCharism:6,
                baseIntelligence:8,
                modMaxHP:0
            },
            elf:{
                size:3,
                baseDexterity:7,
                baseStrength:5,
                baseCharism:6,
                baseIntelligence:8,
                modMaxHP:0
            },
            goblin:{
                size:2,
                baseDexterity:7,
                baseStrength:6,
                baseCharism:5,
                baseIntelligence:7,
                modMaxHP:0
            }
        }
    };
});

define(['GBL'],function(gbl) {
    "use strict";

    var hg={
        name: 'hexgrid.js',
        version: '1.0.0'
    };
    
    hg.Hexgrid=function Hexgrid(opts) {
        var that=this;
        this.allHexes= new hg.HexCollection('all');
        this.lastHexes=new hg.HexCollection('last');
        this.thisPublic={
            allHexes:this.allHexes,
            lastHexes:this.lastHexes,
            getHex:function(y,x) {
                return that[y]&&that[y][x]||null
            }
        };
        this.generateHexgrid(opts.template);
        this.callMethods('findNeighbors');
    };
    
    hg.Hexgrid.prototype={
        constructor: hg.Hexgrid,
        generateHexgrid: function (temp) {
            var tempSplit,
                templates= {
                    rad: function (r) {
                        var i, j;
                        r = +r || 6;
                        this.minY = -r;
                        this.maxY = r;

                        for (i = this.maxY; i >= this.minY; i--) {
                            this[i] = {
                                minX: i > 0 ? 0 : -i,
                                maxX: i < 0 ? 2 * r : 2 * r - i
                            };
                            for (j = this[i].minX; j <= this[i].maxX; j++) {
                                this[i][j] = new hg.Hex(j, i, this.thisPublic);
                            }
                        }
                        this.centralHex = this[0][r];
                        this.startHexes = new hg.HexCollection('start').push(
                            this[0][2 * r],
                            this[r][r],
                            this[r][0],
                            this[0][0],
                            this[-r][r],
                            this[-r][2 * r]
                        )
                    }
                };

            temp = temp || {};
            if (typeof temp == 'string') {
                tempSplit = temp.split('-');
                if (gbl.isFunction(templates[tempSplit[0]])) {
                    temp={
                        gridShape:tempSplit[0],
                        gridSize:tempSplit[1]
                    }
                } else {
                    console.log('Warning! Battlegrid template ' + tempSplit[0] + ' is not defined!');
                    temp = {};
                }
            }
            this.templateData={
                gridShape:temp.gridShape=temp.gridShape||'rad',
                gridSize:temp.gridSize=temp.gridSize||6
            };
            templates[temp.gridShape].call(this, temp.gridSize);
        },
        callMethods: function () {
            this.allHexes.callMethods(arguments);
            return this
        },
        each:function(func) {
            this.allHexes.each(func);
            return this
        }
    };
    
    hg.Hex=function Hex(x, y,hg) {
        this.x = x;
        this.y = y;
        (this.hgCur=hg).allHexes.push(this);
    };
    
    hg.Hex.prototype= {
        constructor: hg.Hex,
        coorShifts: [[0, 1], [1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1]],
        findNeighbors: function () {
            var hgCur = this.hgCur,
                x = this.x, y = this.y,
                csh = this.coorShifts, i;

            this.neighbors = new hg.HexCollection('neighbors');
            for (i = 0; i < 6; i++) {
                this.neighbors.push(this[i] = hgCur.getHex(y + csh[i][0], x + csh[i][1]) || (this.isLast = 1, null));
            }

            if (this.isLast) {
                hgCur.lastHexes.push(this)
            } else {
                this.isLast = 0
            }
        },
        getDistance: function (to) {
            var dx = to.x - this.x,
                dy = to.y - this.y;

            if (dx * dy > 0) {
                return Math.abs(dx + dy)
            }
            return Math.max(Math.abs(dx), Math.abs(dy))
        },
        getVector: function (to) {
            var dx = to.x - this.x,
                dy = to.y - this.y,
                cmpns = {},
                d1, d2, dd, sts;

            if (dx == 0 && dy == 0) {
                cmpns[0] = 0;
                cmpns.dirList = [0];
                return cmpns
            }
            if (dy) {
                cmpns[d1 = (dy > 0 ? 1 : 4)] = Math.abs(dy)
            }
            if (dx) {
                cmpns[d2 = (dx > 0 ? 0 : 3)] = Math.abs(dx)
            }
            if (dx * dy && (dd = Math.abs(d1 - d2)) != 1) {
                sts = Math.min(cmpns[d1], cmpns[d2]);
                cmpns[d1] -= sts;
                cmpns[d2] -= sts;
                cmpns[dd == 4 ? 5 : 2] = sts;
            }
            cmpns.dirList = [];
            cmpns.forOwn(function (dir) {
                this[dir] && !isNaN(+dir) && this.dirList.push(+dir);
            });
            return cmpns;
        },
        isStraight: function (to) {
            var dy = to.y - this.y,
                dx = to.x - this.x;
            return dy * dx === 0 || dy + dx === 0;
        },

        /*Returns polar coordinates
        * returned object contains next properties:
        * r: integer, distance,
        * fiHex: integer, polar angle in hexes,
        * fiDeg: number, polar angle in degrees*/
        getPolar: function (hex) {
            var vector = this.getVector(hex),
                polar = {r:0,fiHex:0,fiDeg:0},
                dr, dl;

            if (hex==this) {return polar}

            if (vector.dirList.length == 1) {
                dr = vector.dirList[0];
                polar.r = vector[dr];
                polar.fiHex = polar.r * dr;
                polar.fiDeg = gbl.round(polar.fiHex * 60 / polar.r,3);
            } else {
                dr = this.getRight(vector.dirList[0], vector.dirList[1]);
                dl = dr == vector.dirList[0] ? vector.dirList[1] : vector.dirList[0];
                polar.r = vector[dr] + vector[dl];
                polar.fiHex = polar.r * dr + vector[dl];
                polar.fiDeg = gbl.round(polar.fiHex * 60 / polar.r,3);
            }
            return polar;
        },
        prevDir: function (dir) {
            return !dir ? 5 : dir - 1
        },
        nextDir: function (dir) {
            return dir == 5 ? 0 : dir + 1
        },
        getRight: function (d1, d2) {
            var d = Math.abs(d1 - d2);
            switch (d) {
                case 0:
                case 3:
                    return d1;
                case 1:
                case 2:
                    return Math.min(d1, d2);
                case 4:
                case 5:
                    return Math.max(d1, d2);
            }
        },
        markLee: function (unwanted, finish) {
            var hgCur = this.hgCur,
                forbidden = new hg.HexCollection(hgCur.obstacles)
                    .push(hgCur.allHexes.filter('isBusy')),
                mark = 'lee_' + this.y + '_' + this.x,
                hcOpts = {type: 'izodist', mark: mark, prev: new hg.HexCollection(this)},
                i;

            if (unwanted) {
                forbidden.collectForbidden(hgCur, unwanted)
            }

            this[mark] = i = 0;
            this.markLeeData = {
                markName: mark,
                izodists: [hcOpts.prev],
                forbidden: forbidden
            };
            hcOpts.forbidden = forbidden;
            while (++i) {
                hcOpts.markValue = i;
                this.markLeeData.izodists.push(new hg.HexCollection(hcOpts));
                hcOpts.prev = this.markLeeData.izodists[i];
                if (!this.markLeeData.izodists[i].length || this.markLeeData.izodists[i].has(finish)) {
                    if (!this.markLeeData.izodists[i].length) {
                        this.markLeeData.izodists.pop()
                    }
                    break;
                }
            }
            return this
        },
        unmarkLee: function () {
            if (!this.markLeeData) {
                return this
            }
            this.hgCur.allHexes.deleteProperty(this.markLeeData.markName);
            delete this.markLeeData;
            return this;
        },
        getPath: function (to, unwanted) {
            var hgCur = this.hgCur,
                forbidden;
            if (!this.markLeeData) {
                this.markLee(unwanted, to)
            }
            else if (unwanted) {
                forbidden = new hg.HexCollection(hgCur.obstacles)
                    .push(hgCur.allHexes.filter('isBusy'))
                    .collectForbidden(hgCur, unwanted);
                if (!forbidden.isEqual(this.markLeeData.forbidden)) {
                    this.unmarkLee().markLee(unwanted, to)
                }
            }

            return new hg.Path(this, to)
        },

        getHidden:function(hc,maxRadius,targetHC) {
            var initHex=this,
                hidden=new hg.HexCollection({type:'hidden'}),
                hcOpts={type:'ring',centralHex:initHex},
                hids=new hg.HiddenSectors(this,hc),
                parts={l:0,r:0};

            (gbl.getType(targetHC)=='HexCollection'?targetHC
                :this.getHexesByDistance(hids.minDistance+1,maxRadius))
                .each(function() {
                    var hex=this,
                        polar=initHex.getPolar(this),
                        aw,l,r,
                        part;

                    if (!polar.r) {return}
                    aw=hids.rnd2(60/polar.r);
                    l=hids.rnd2(polar.fiDeg+aw/2);
                    r=hids.getPart(hids.rnd2(polar.fiDeg-aw/2));

                    parts.r=parts.l=0;
                    hids.each(function() {
                        if (polar.r<=this.distance) {return}
                        if (this.isInside(l)) {
                            part = hids.getPart(hids.rnd2((l - this.right) / aw));
                            if (!parts.l || parts.l < part) {
                                parts.l = part
                            }
                        }

                        if (this.isInside(r)) {
                            part = hids.getPart(hids.rnd2((this.left - r) / aw));
                            if (!parts.r || parts.r < part) {
                                parts.r = part
                            }
                        }

                        if (parts.l + parts.r > .5) {
                            hidden.push(hex);
                            return false
                        }
                    });
                });

            return hidden
        },

        getHexesByDistance:function(min,max) {
            var hex=this;
            min=min||1;
            return this.hgCur.allHexes.filter(max
                ? function () {
                    var d=hex.getDistance(this);
                    return min<=d&&d<=max
                }
                :function() {return min<=hex.getDistance(this)}
            )
        }
    };    
    
    hg.HexCollection=function HexCollection(opts) {  //Без аргументов - создается пустой объект
            this.all = [];               //переданный объект должен иметь свойства type
            if (opts == undefined) {
                this.type = 'none';
                return this;
            }
            if (gbl.getType(opts).has('Hex')) {
                if (gbl.getType(opts) == 'HexCollection' && arguments.length == 1) {
                    return opts
                }
                if (this.type) {this.type='none'}
                return this.push(arguments);
            }
            if (typeof opts == 'string') {
                opts = {type: opts}
            }
            if (gbl.isArray(opts)) {
                return HexCollection.apply(this, opts)
            }
            if (!gbl.isFunction(HexCollection.types[opts.type])&&!HexCollection.simpleTypes.has(opts.type)) {
                console.log('Warning! "' + opts.type + '" is unknown HexCollection type!');
                opts.type = 'none';
            }
            this.type = opts.type;
            return HexCollection.simpleTypes.has(this.type)
                ?this
                :HexCollection.types[this.type].call(this, opts);
        }.inherit(gbl.Collection);

    hg.HexCollection.types= {
        line: function (opts) {
            var hgCur=opts.from.hgCur,
                vector, csh = this.coorShifts,
                x, y,
                i, len;
            this.from = this.all[0] = opts.from;
            if (gbl.getType(opts.to) == 'Hex') {
                vector = this.from.getVector(opts.to);
                if (!this.from.isStraight(opts.to)) {
                    console.log('Line may not be drawn from ' + this.from.y + ',' + this.from.x + ' to ' + opts.to.y + ',' + opts.to.x + '!');
                    return this;
                } else {
                    this.to = opts.to;
                    this.direction = vector.dirList[0];
                    len = vector[this.direction] + 1;
                }
            } else {
                this.direction = opts.direction;
                len = opts.length;
            }
            for (i = 1; i < len; i++) {
                y = this.from.y + csh[this.direction][0] * i;
                x = this.from.x + csh[this.direction][1] * i;
                this.push(hgCur.getHex(y,x));
            }
            this.to = this.to || this.all[this.all.length - 1];
            return this
        },

        ring: function (opts) {
            var hgCur=opts.centralHex.hgCur,
                i, j,
                csh = this.coorShifts,
                x, y,
                filter = this.getFilter(opts.filter),
                hex;

            this.centralHex = opts.centralHex;
            this.radius = opts.radius || 1;

            for (i = 0; i < 6; i++) {
                y = this.centralHex.y + this.radius * csh[i][0];
                x = this.centralHex.x + this.radius * csh[i][1];
                (hex=hgCur.getHex(y,x)) && filter(hex) && this.push(hex);
                for (j = 0; j < this.radius - 1; j++) {
                    y += csh[(i + 2) % 6][0];
                    x += csh[(i + 2) % 6][1];
                    (hex=hgCur.getHex(y,x)) && filter(hex) && this.push(hex);
                }
            }
            return this
        },

        circle: function (opts) {
            this.all[0] = this[0] = opts.centralHex;
            this.radius = opts.radius;
            opts.type = 'ring';
            while (opts.radius) {
                this.push(this[opts.radius] = new hg.HexCollection(opts));
                opts.radius--;
            }
            return this
        },

        parallelogram: function (opts) {
            var hgCur,
                i, j = 0, that,
                vector, d1, d2,
                csh = this.coorShifts,
                x, y,
                filter = this.getFilter(opts.filter),
                hex;

            this.angle1 = opts.angle1 || opts.from;
            this.angle2 = opts.angle2 || opts.to;
            hgCur=this.angle1.hgCur;
            if (this.angle1.isStraight(this.angle2)) {
                that = new hg.HexCollection({
                    type: 'line',
                    from: this.angle1,
                    to: this.angle2
                });
                that.type = 'parallelogram';
                that.angle1 = this.angle1;
                that.angle2 = this.angle2;
                that.isDegenerate = 1;
                return that;
            }
            vector = this.angle1.getVector(this.angle2);
            d1 = vector.dirList[0];
            d2 = vector.dirList[1];
            for (i = 0; i < vector[d1] + 1; i++) {
                y = this.angle1.y + i * csh[d1][0];
                x = this.angle1.x + i * csh[d1][1];
                if (hex = hgCur.getHex(y,x)) {
                    filter(hex) && this.push(hex);
                    (i == vector[d1]) && (this.angle3 = hex);
                }
                if (d2) {
                    for (j = 0; j < vector[d2]; j++) {
                        y += csh[d2][0];
                        x += csh[d2][1];
                        if (hex = hgCur.getHex(y,x)) {
                            filter(hex) && this.push(hex);
                            (i == 0 && j == vector[d2] - 1) && (this.angle4 = hex);
                        }
                    }
                }
            }
            this.border = new hg.HexCollection({type: 'border'});
            for (i = 1; i < 3; i++) {
                for (j = 3; j < 5; j++) {
                    this.border.push(this['border' + i + j] = new hg.HexCollection({
                        type: 'line',
                        from: this['angle' + i],
                        to: this['angle' + j]
                    }));
                }
            }
            return this;
        },

        obstacle: function (opts) {
            var obst = this,
                lessHeight,
                types = {
                    line: function line(opts) {
                        var i, hex = opts.startHex,
                            length = opts.size || this.size,
                            md=opts.mainDirection||this.mainDirection;

                        for (i = 1; i < length; i++) {
                            hex = hex[md];
                            if (!checkHex(hex)) {
                                return;
                            } else {
                                this.push(hex);
                            }
                        }
                    },
                    thickLine: function (opts) {
                        var i, len, part,
                            startHex = opts.startHex,
                            hgCur=startHex.hgCur;

                        this.weight = this.size < 11 ? 2 : 3;
                        len = this.size / this.weight ^ 0;
                        part = this.size % this.weight;
                        opts.size = len + (part > 0 ? 1 : 0);
                        types.line.call(this, opts);
                        i = gbl.d(2) * 2 - 3;
                        if (part > 0) {
                            opts.size--;
                        }
                        this.push(opts.startHex = getStartHex.call(this, i));
                        if (opts.startHex) {
                            types.line.call(this, opts)
                        }
                        if (this.weight == 3) {
                            opts.size = part == 2 ? len + 1 : len;
                            if (part != 1) {
                                i *= 2
                            }
                            this.push(opts.startHex = getStartHex.call(this, -i));
                            if (opts.startHex) {
                                types.line.call(this, opts)
                            }
                            this.border = this.getBorder().setProperty('isBorderObstacle', 1);
                        }

                        function getStartHex(d) {
                            var csh = this.coorShifts,
                                y, x;
                            d = gbl.getPart(this.mainDirection + d);
                            y = startHex.y + csh[d][0];
                            x = startHex.x + csh[d][1];
                            while (!checkHex(hgCur.getHex(y,x))) {
                                y += csh[this.mainDirection][0];
                                x += csh[this.mainDirection][1];
                                if (!--opts.size) {
                                    return null
                                }
                            }
                            return hgCur.getHex(y,x);
                        }
                    },
                    bracket: function (opts) {
                        var size=opts.size,
                            md=this.mainDirection,
                            minSize=(size+3)/4^ 0,
                            moreLong=(size+3)% 4,
                            d=gbl.d(2)==1?'prev':'next',
                            i,lineOpts={},len;

                        for (i=0;i<4;i++) {
                            lineOpts.startHex=this.all.last();
                            lineOpts.size=function() {
                                if (gbl.d(4-i)>moreLong) {
                                    return minSize
                                }
                                moreLong--;
                                return minSize+1;
                            }();
                            lineOpts.mainDirection=md;
                            md=this[d+'Dir'](md);
                            len=this.length;
                            types.line.call(this,lineOpts);
                            if (this.length==len) {return}
                        }
                    },
                    massive: function (opts) {
                        var hc=this,
                            startHex=opts.startHex,
                            hgCur=startHex.hgCur,
                            size=this.size,
                            i= 0,
                            csh=this.coorShifts,
                            len,border,
                            md=this.mainDirection;

                        while (this.length<size) {
                            len=this.length;
                            addForMD(++i);
                            addRelated(++i);
                            if (len==this.length) {break}
                        }
                        border=this.getBorder();
                        if (border.length<this.length) {
                            this.border=border.setProperty('isBorderObstacle',1)
                        }

                        function addForMD(i) {
                            var y=startHex.y+i*csh[md][0],
                                x=startHex.x+i*csh[md][1],
                                hex=hgCur.getHex(y,x);

                            checkHex(hex)&&hc.push(hex);
                            f(-2);
                            f(2);

                            function f(d) {
                                if (hc.length<size) {
                                    hex=hgCur.getHex(y+csh[gbl.getPart(md+d)][0],
                                        x+csh[gbl.getPart(md+d)][1]);
                                    checkHex(hex)&&hc.push(hex);
                                }
                            }
                        }
                        function addRelated(i) {
                            var rel=hc.getRelated()
                                    .filter(function () {return checkHex(this)}),
                                hex=hgCur.getHex(startHex.y+i*csh[md][0],
                                    startHex.x+i*csh[md][1]),
                                tempHC=new hg.HexCollection(hex),
                                push;
                            if (!tempHC.length) {return}
                            if (rel.length<=size-hc.length) {return hc.push(rel)}
                            while (hc.length+tempHC.length<size) {
                                tempHC.push(push=tempHC.getRelated().cross(rel));
                                if (!push.length) {break}
                            }
                            hc.push(tempHC);
                        }
                    },
                    curve: function (opts) {
                        var md=this.mainDirection,
                            size=this.size,
                            dDir=[-2,-1,1,2],
                            d= 0,len,
                            lineOpts={};

                        while(this.length<size) {
                            lineOpts.size=gbl.d(2)+1;
                            lineOpts.startHex=this.all.last();
                            lineOpts.mainDirection=getNewDir();
                            len=this.length;
                            types.line.call(this,lineOpts);
                            if (this.length==len) {break}
                        }

                        function getNewDir() {
                            var x=Math.abs(d),
                                arr=[
                                    x<2?1:0,
                                    x?3-x:2,
                                    x?4:2,
                                    x?3:1
                                ];
                            if (d>0) {arr.reverse()}
                            d+=dDir[gbl.getRandom(arr)];
                            return gbl.getPart(md+d)
                        }
                    },
                    random: function (opts) {
                        var size=this.size,
                            t=['line','thickLine','bracket','massive','curve'],
                            probls=[
                                3-Math.abs(size-4),
                                size-4,
                                3-Math.abs(size-7),
                                (size-3)*1.5^0,
                                (6-Math.abs(size-8))*1.5^0
                            ];
                        probls.forEach(function(it,i) {
                            if (it<0) {probls[i]=0}
                        });

                        this.obstacleType=t[gbl.getRandom(probls)];
                        types[this.obstacleType].call(this,opts)
                    },
                    hexes: function (opts) {
                        var type=gbl.getType(opts.hexes);
                        switch(type) {
                            case 'Undefined':
                                return;
                            case 'HexCollection':
                                this.push(opts.hexes);
                                break
                        }
                    }
                },
                checkHex = function (hex) {
                    return hex && !hex.isObstacle && !hex.isStart && !hex.isRelatedObstacle
                };


            this.obstacleType = opts.obstacleType || 'random';
            this.size = opts.size || 1;
            this.height = opts.height || 1;
            this.mainDirection = gbl.isDefined(opts.mainDirection)
                ? opts.mainDirection
                : gbl.d(6) - 1;
            this.push(opts.startHex);
            if (typeof types[this.obstacleType] != 'function') {
                console.log('Warning! ' + this.obstacleType + ' is unknown obstacle type!');
                this.obstacleType = 'random';
            }

            if (this.size > 1) {
                types[this.obstacleType].call(this, opts)
            }

            this.size=this.length;
            this.setProperty({isObstacle: 1, obstacle: this});
            this.relatedObstacle = this.getRelated().setProperty('isRelatedObstacle', 1);
            this.corners = this.relatedObstacle.findCorners();
            lessHeight = !this.border || gbl.d(3) == 3 ? 0 : 1;
            return this.each(function () {
                this.height = !this.isBorderObstacle ? obst.height : obst.height - lessHeight;
            });
        },

        izodist: function(opts) {
            var hc=this;
            opts.prev.each(function() {
                this.neighbors.each(function() {
                    if (gbl.isDefined(this[opts.mark])||opts.forbidden.has(this)) {return}
                    this[opts.mark]=opts.markValue;
                    hc.push(this)
                })
            });
            return this;
        }
    };
    hg.HexCollection.simpleTypes=['none', 'all', 'neighbors', 'last', 'border',
        'start', 'related','group','path','hidden'];

    hg.HexCollection.prototype.extend({
        typeOfItems: 'Hex',
        coorShifts: hg.Hex.prototype.coorShifts,
        filter: function (filter) {
            var func = gbl.isFunction(filter) ? filter
                : (typeof filter == 'string')
                ? (filter.has('!')
                ? function () {
                return !this[filter.slice(1)]
            }
                : function () {
                return this[filter]
            })
                : function () {
                return true
            };

            return gbl.Collection.prototype.filter.call(this, func);
        },
        getFilter:function(filter) {
            return gbl.isFunction(filter)
                ? filter
                : typeof filter == 'string'
                ? (filter.has('!')
                ? function (hex) {
                return !hex[filter.slice(1)]
            }
                : function (hex) {
                return hex[filter]
            })
                : function () {
                return true
            };
        },
        getBorder: function () {
            var that = this,
                border = new hg.HexCollection({type: 'border'});
            this.each(function () {
                var hex = this;
                this.neighbors.each(function () {
                    if (!that.has(this)) {
                        border.push(hex);
                        return false;
                    }
                })
            });
            return border;
        },
        getRelated: function () {
            var that = this,
                related = new hg.HexCollection({type: 'related'});
            this.each(function () {
                this.neighbors.each(function () {
                    if (!that.has(this)) {
                        related.push(this)
                    }
                })
            });
            return related;
        },
        setProperty: function (prop, value) {
            var props;
            if (typeof prop == 'object') {
                props = prop
            }
            else {
                props = {};
                props[prop] = value;
            }
            return this.each(function () {
                var hex = this;
                props.forOwn(function (prop) {
                    hex[prop] = this[prop];
                })
            })
        },
        deleteProperty: function () {
            var props = gbl.toArray(arguments);
            return this.each(function () {
                var i = props.length;
                while (i--) {
                    delete this[props[i]]
                }
            })
        },
        findCorners: function () {
            var hgCur=this.all[0].hgCur,
                c = {};
            this.each(function () {
                c.minX = c.minX == undefined || c.minX > this.x ? this.x : c.minX;
                c.maxX = c.maxX == undefined || c.maxX < this.x ? this.x : c.maxX;
                c.minY = c.minY == undefined || c.minY > this.y ? this.y : c.minY;
                c.maxY = c.maxY == undefined || c.maxY < this.y ? this.y : c.maxY;
                c.minXY = c.minXY == undefined || c.minXY > (this.x + this.y) ? this.x + this.y : c.minXY;
                c.maxXY = c.maxXY == undefined || c.maxXY < (this.x + this.y) ? this.x + this.y : c.maxXY;
            });
            return {
                0: hgCur.getHex(c.maxXY - c.maxX,c.maxX),
                1: hgCur.getHex(c.maxY,c.maxXY - c.maxY),
                2: hgCur.getHex(c.maxY,c.minX),
                3: hgCur.getHex(c.minXY - c.minX,c.minX),
                4: hgCur.getHex(c.minY,c.minXY - c.minY),
                5: hgCur.getHex(c.minY,c.maxX)
            }
        },
        getGroups:function() {
            var hc=this,
                groups=[],
                group,
                garbage;
            while (hc.length) {
                select(hc.all[0]);
                groups.push(group=new hg.HexCollection('group'));
                garbage=new hg.HexCollection();
                hc.each(function() {
                    if (this._gr) {group.push(this)}
                    else {garbage.push(this)}
                });
                group.deleteProperty('_gr');
                hc=garbage;
            }
            return groups;

            function select(hex) {
                hex._gr=1;
                hex.neighbors.each(function() {
                    if (!this._gr&&hc.has(this)) {select(this)}
                })
            }
        },
        collectForbidden:function(hgCur,unwanted) {
            var i,len;
            if (gbl.getType(unwanted).has('Hex')
                || gbl.isArray(unwanted)
                && unwanted.every(function (it) {
                    return gbl.getType(it).has('Hex')
                })
            ) {
                this.push(unwanted)
            } else if (typeof unwanted == 'string') {
                this.push(hgCur.allHexes.filter(unwanted))
            } else if (gbl.isArray(unwanted)
                && unwanted.every(function (it) {
                    return typeof it == 'string'
                })
            ) {
                for (i = 0, len = unwanted.length; i < len; i++) {
                    this.push(hgCur.allHexes.filter(unwanted[i]))
                }
            }
        },
        prevDir:hg.Hex.prototype.prevDir,
        nextDir:hg.Hex.prototype.nextDir,
        getRight:hg.Hex.prototype.getRight,
        getRandomHex:function() {
            return this.all[gbl.d(this.length)-1]
        },
        sortByDistance:function(hex) {
            return this.sort(function(a,b) {
                return hex.getDistance(a)-hex.getDistance(b)
            })
        },
        filterByVisibility:function(hex,hidSectors) {
            if (gbl.getType(hidSectors)=='HexCollection') {
                hidSectors=new hg.HiddenSectors(hex,hidSectors);
            }
            return this.filter(function() {
                return !hidSectors.has(this)
            })
        }
    }, true);

    hg.Path = function Path(from, to) {
        var mark=from.markLeeData.markName,
            hex=to,
            i=to[mark],
            nh;

        this.from=from;
        this.to=to;
        this.hexes=new hg.HexCollection('path').push(to);
        this.steps=[];

        while (i--) {
            nh=this.getNextHex(mark,hex);
            this.steps.unshift({
                from:nh.hex,
                to:hex,
                direction:nh.direction
            });
            this.hexes.push(hex=nh.hex);
        }
    };
    
    hg.Path.prototype = {
        getNextHex:function(mark,hex) {
            var m=hex[mark]-1,i;
            for (i=0;i<6;i++) {
                if (hex[i]&&hex[i][mark]==m) {
                    return {
                        hex:hex[i],
                        direction:gbl.getPart(i+3)
                    }
                }
            }
        }
    };

    hg.HiddenSector=function HiddenSector(r,l,d) {
        this.right=r;
        this.left=l;
        this.distance=d;
    };

    hg.HiddenSector.prototype={
        constructor:hg.HiddenSector,
        isInside:function(n) {
            return this.full?true
                :gbl.getPart(this.left-this.right,360)>=gbl.getPart(n- this.right,360)
        },
        setSide:function(side,n) {this[side]=n},
        round:function(n) {return gbl.getPart(gbl.round(n,2),360)},
        getParts:function(parts,hexPars) {
            var part;
            if (hexPars.d<=this.distance) {return}
            if (this.isInside(hexPars.l)) {
                part = this.round((hexPars.l - this.right) / hexPars.aw);
                if (!parts.l || parts.l < part) {
                    parts.l = part
                }
            }

            if (this.isInside(hexPars.r)) {
                part = this.round((this.left - hexPars.r) / hexPars.aw);
                if (!parts.r || parts.r < part) {
                    parts.r = part
                }
            }
        }
    };

    hg.HiddenSectors=function HiddenSectors(hex,hc) {
        var ha=this;
        this.all=[];
        this.hex=hex;
        this.hc=new hg.HexCollection();
        hc.sortByDistance(hex).each(function() {
            ha.pushIn(this)
        });
    }.inherit(gbl.Collection);

    hg.HiddenSectors.prototype.extend({
        typeOfItems:'HiddenSector',
        minDistance:Infinity,
        rnd2:function(n) {return gbl.round(n,2)},
        getPart:function(n) {return gbl.getPart(n,360)},
        pushIn:function(hex) {
            var ha=this,
                polar=this.hex.getPolar(hex),
                left=this.rnd2(polar.fiDeg+30/polar.r),
                right=this.rnd2(polar.fiDeg-30/polar.r),
                upd,
                side={'1':'left','2':'right'};

            if (this.hc.has(hex)||!polar.r) {return this}
            this.hc.push(hex);
            right=this.getPart(right);

            this.each(function() {
                var x=0;
                if (this.isInside(left)) {
                    x+=1;
                }
                if (this.isInside(right)) {
                    x+=2;
                }

                if (x==3) {
                    if (this.distance==polar.r) {
                        this.full=1;
                    }
                    upd=1;
                    return false;
                }

                if (x==0) {return}
                if (this.distance==polar.r) {
                    if (upd) {
                        upd[side[x]]=this[side[x]];
                        ha.remove(this);
                        return
                    }
                    upd=this;
                    this.setSide(side[3-x],x==1?right:left);
                }
            });

            if (!upd) {
                if (this.minDistance>polar.r) {this.minDistance=polar.r}
                this.push(new hg.HiddenSector(right,left,polar.r))
            }
        },
        clone:function() {
            var newHS=new hg.HiddenSectors(this.hex,this.hc.clone());
            newHS.all=this.all.slice();
            return newHS
        },
        add:function(hc) {
            return new this.constructor(this.hex,this.hc.add(hc))
        },
        has:function(hex) {
            var parts={l:0,r:0},
                polar=this.hex.getPolar(hex),
                hexPars={},
                result=false;

            if (!polar.r) {return}
            hexPars.d=polar.r;
            hexPars.aw=this.rnd2(60/polar.r);
            hexPars.l=this.rnd2(polar.fiDeg+hexPars.aw/2);
            hexPars.r=this.getPart(this.rnd2(polar.fiDeg-hexPars.aw/2));

            this.each(function() {
                this.getParts(parts,hexPars);
                if (parts.l+parts.r>.5) {
                    result=true;
                    return false
                }
            });
            return result
        },
        each:function(fn) {
            var arr = this[this.genArrName],
                i, len= arr.length;
            for (i = 0; i < arr.length; i++) {
                if (fn.call(arr[i], i, this) === false) break;
                if (len!=arr.length) {
                    i--;
                    len=arr.length;
                }
            }
            return this
        }
    },true);

    return hg;
});

define(['GBL', 'hexgrid', 'config'], function (gbl, hg, cg) {
    "use strict";

    var bf = {
        name: 'battlefield.js',
        version: '1.0.0'
    };

    hg.HexCollection.types.startArea = function (opts) {
        var size = opts.size || 9,
            r = 1, obj;
        this.push(this.startHex = opts.startHex);
        obj = {
            type: 'ring',
            centralHex: this.startHex
        };
        while (this.length < size) {
            obj.radius = r++;
            this.push(new hg.HexCollection(obj));
        }
        return this.setProperty('isStart', 1)
    };

    /* Battlefield expects next properties in opts:
     * template: string | object {
     *  gridShape: string ['rad'], default: 'rad',
     *  gridSize: int [>=4], default: 6,
     * };
     * teamsCount: int [2-6], default: 2;
     * startAreaSize: int [>=1], means minimum, default: 9;
     * obstacles: string | object {
     *  density: int [1-4], def: 2,
     *  maxSize: int [>=1], def: 12,
     *  middleSize: int [1-maxSize], def: 4,
     *  height: int [0-4], def: 1,
     *  distribution: str ['uniform' | 'center' | 'peripheral'], def: 'uniform'
     * }
     */
    bf.Battlefield = function Battlefield(opts, battle) {  //template
        var bfCur = this,
            _start=new Date,
            st1,st2;

        this._super(opts);
        console.log('Parent constructor worked '+(new Date-_start)+'ms.');
        this.battle=battle;

        this.setStartAreas(opts.teamsCount || cg.teamsCount,
            opts.startAreaSize||cg.startAreaSize);

        st1=new Date;
        this.generateObstacles(opts.obstacles);
        console.log('Obstacles generated for '+(new Date-st1)+'ms.');

        st2=new Date;
        this.findVisibleHexes();
        console.log('Visible hexes found for '+(new Date-st2)+'ms.');

        console.log('Battlefield created for '+(new Date-_start)+'ms.');
    }.inherit(hg.Hexgrid);

    bf.Battlefield.prototype.extend({
        setStartAreas: function (number, size) {
            var opts = {type: 'startArea', size: size, startHex: this.startHexes.all[3]},
                i = number;
            this.startAreas = [new hg.HexCollection(opts)];
            while (--i) {
                opts.startHex = this.startHexes.all[gbl.getPart(3 + 6 * i / number)];
                this.startAreas.push(new hg.HexCollection(opts));
            }
            return this
        },

        generateObstacles:function(opts) {
            var bfCur=this,
                templates={
                    none:function() {
                        bfCur.templateData.obstacles.template='none'
                    },
                    arena:function() {}
                },
                splitArr,
                pars=cg.obstacle.pars,
                probls=cg.obstacle.probls,
                properties=['density', 'maxSize', 'middleSize', 'height', 'distribution'],
                hexProbls=new Array(this.allHexes.length),
                sizeProbls,
                heightProbls,
                maxNumber,
                hcOpts={type:'obstacle', obstacleType:'random'},
                all=this.allHexes.all;

            this.obstacles=this.thisPublic.obstacles=[];
            this.templateData.obstacles={};
            opts=opts||{};

            if (typeof opts=='string') {
                if (gbl.isFunction(templates[opts])) {
                    return templates[opts]()
                }
                if ((splitArr=opts.split('-')).length!=4) {
                    console.log('Warning! '+opts+' is unknown obstacles template!');
                    opts={};
                } else {
                    opts={};
                    splitArr.forEach(function(it,i) {
                        opts[properties[i]]=it
                    })
                }
            }

            if (opts.maxSize&&!opts.middleSize) {
                opts.middleSize=opts.maxSize/2^0
            }
            if (!opts.maxSize&&opts.middleSize) {
                opts.maxSize=opts.middleSize*1.6^0
            }
            properties.forEach(function(it) {
                if (!gbl.isDefined(opts[it])) {opts[it]=pars[it]}
                bfCur.templateData.obstacles[it]=opts[it]
            });

            maxNumber=gbl.round(this.allHexes.length*opts.density/20);
            sizeProbls=probls.size(opts.maxSize,opts.middleSize);
            heightProbls=probls.height[opts.height];

            while (number()<maxNumber) {
                setHexProbls();
                hcOpts.startHex=all[gbl.getRandom(hexProbls)];
                hcOpts.size=gbl.getRandom(sizeProbls)+1;

                hcOpts.height=gbl.getRandom(heightProbls)+1;
                this.obstacles.push(new hg.HexCollection(hcOpts));
            }

            return this;

            function number() {
                var sum=0;
                bfCur.obstacles.forEach(function(it) {
                    sum+=it.length
                });
                return sum
            }
            function setHexProbls() {
                bfCur.each(function(i) {
                    hexProbls[i]=this.isObstacle||this.isStart||this.isRelatedObstacle
                        ?0:probls.hex(opts.distribution)(this)
                });
            }
        },

        findVisibleHexes:function() {
            var obstacles=new hg.HexCollection(this.obstacles).filter(function() {
                return this.height>=2
            }),
                all=this.allHexes.filter('!isObstacle');
            all.each(function() {
                var that=this;
                setTimeout(function() {
                    that.visibleHexes=all.filterByVisibility(that,obstacles);
                },0)
            });
            return this
        }
    },true);

    return bf;
});

define(['GBL', 'battlefield'], function (gbl, bf) {
    "use strict";

    var templates = {},
        bf_proto = bf.Battlefield.prototype;
    templates.name = 'templates.js';
    templates.version = '1.0.0';

    // - - Configuration - -
    bf_proto.hexQuarter = 20;
    bf_proto.hexWidth = 70;
    bf_proto.focus = 800;

    templates.run = function (temp) {
        temp = temp || {};
        if (gbl.getType(temp) == 'String') {
            if (this[temp]) return this[temp]();
            else temp = {};
        }
        temp.gridShape = temp.gridShape || 'rad';
        temp.gridSize = temp.gridSize || 6;
        temp.gridSrc = temp.gridShape + '-' + temp.gridSize + '.png';
        temp.obstaclesDensity = temp.obstaclesDensity || 2;
        temp.landscape = temp.landscape || 'random';

        this[temp.gridShape](temp.gridSize);
    };
    templates.rad = function (r) {
        var i, j, bfCur = this.bfCur;
        bfCur.minY = -r;
        bfCur.maxY = r;
        bfCur.coordsOfStart = {
            x: 0,
            y: 3 * bfCur.hexQuarter * r
        };
        bfCur.gridRadius = (2 * r + 1) * bfCur.hexWidth / 2;
        bfCur.gridWidth = (2 * r + 1) * bfCur.hexWidth;
        bfCur.gridHeight = (6 * r + 4) * bfCur.hexQuarter;
        for (i = r; i >= -r; i--) {
            bfCur[i] = {
                minX: i > 0 ? 0 : -i,
                maxX: i < 0 ? 2 * r : 2 * r - i
            };
            for (j = bfCur[i].minX; j <= bfCur[i].maxX; j++) {
                bfCur[i][j] = new bf.Hex(j, i);
            }
        }
        bfCur.centralHex = bfCur[0][r];

    };
    templates.rect = function (s) {
        var i, j, bfCur = this.bfCur, w, h, _x, _y;
        s = s.split('*');
        w = +s[0];
        h = +s[1];
        bfCur.minY = 0;
        bfCur.maxY = h - 1;
        bfCur.coordsOfStart = {
            x: 0,
            y: 3 * bfCur.hexQuarter * (h - 1)
        };
        //bf.gridRadius=(2*r+1)*bf.hexWidth/2;    <-- think about this!!!
        bfCur.gridWidth = (w + .5) * bfCur.hexWidth;
        bfCur.gridHeight = (3 * h + 1) * bfCur.hexQuarter;
        for (i = 0; i < h; i++) {
            bfCur[i] = {
                minX: -(i / 2 ^ 0),
                maxX: h - 1 - (i / 2 ^ 0)
            };
            for (j = bfCur[i].minX; j <= bfCur[i].maxX; j++) {
                bfCur[i][j] = new bf.Hex(j, i);
            }
        }
        _y = (h - 1) / 2 ^ 0;
        _x = (w - 1) / 2 ^ 0;
        bfCur.centralHex = bfCur[_y][_x + bfCur[_y].minX];
    };
    templates.createWall = function (src) {
        var bf = this.bfCur,
            r = bf.gridRadius,
            pi = Math.PI,
            c = Math.ceil(2 * pi * r / 180),
            wall = mGB(), i,
            dx = bf.gridWidth / 2,
            dy = bf.gridHeight / 2;
        wall.width = gbl.round(2 * r * Math.tan(pi / c));
        wall.src = src;
        for (i = 0; i < c; i++) {
            wall.push(
                cE('div', {
                    style: {backgroundPosition: (i * wall.width) + 'px 0'},
                    angle: 360 * i / c,
                    x: round(Math.cos(2 * pi * i / c) * r + dx),
                    y: round(-Math.sin(2 * pi * i / c) * r + dy),
                    className: 'bf-wall'
                })[0]
            );
        }
        return wall.insertTo('.battlefield')
    };
    templates.grass = function (temp) {
        var n = getRandom([3, 3, 1]) + 1;
        temp.groundSrc = 'grass' + (n < 10 ? '0' + n : n);
        this.createEnvSprites('tree');
    };
    templates.random = function (temp) {

    };
    templates.createEnvSprites = function (type) {

    };

    gbl._downloadReport(templates);
}(GBL, mGB, createElement, GBL.game.battlefield));