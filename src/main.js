var observer = require('./observer');
var compile = require('./compile');


window.Tue = function (opts) {
    this._init(opts);
};

Tue.prototype._init = function (opts) {
    this.$opts = opts;
    this.$el = typeof opts.el === 'string' ? document.querySelector(opts.el) : opts.el;
    this.$data = opts.data;
    this.$methods = opts.methods;

    if (Object.prototype.toString.call(opts.data) === '[object Function]') {
        this.$data = opts.data();
    }

    // 对象深沉次属性的取值和修改,同时这两个方法可以这么使用this.$get(this.vm.$data, xxx)
    this.$get = function (obj, keyPath) {
        var getter = new Function('return this.' + keyPath);
        return getter.call(obj);
    };

    this.$set = function (obj, keyPath, val) {
        var setter = new Function('newVal', 'this.' + keyPath + ' = newVal');
        setter.call(obj, val);
    };

    // 用于存储与dom绑定的数据属性
    // 就是用来保存使用了某个属性的所有的指令或者订阅的对象数组
    this._binding = {};

    // 劫持所有的属性
    this._observer(this.$data);
    // 解析模版将解析出来的指令和绑定的数据集合存在上面的binding对象中去。
    this._compileAllNodes(this.$el);
};


Tue.prototype._observer = observer;

Tue.prototype._compileAllNodes = compile;

