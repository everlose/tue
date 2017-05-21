// var nodeToFragment = require('./nodeToFragment');
// var observer = require('./observer');

// 指令函数11
function Directive (name, el, vm, exp, attr) {
    this.name = name; // 指令名称
    this.el = el; // 指令对应的dom
    this.vm = vm;  // 指令对应的vue实例
    this.exp = exp;  // 指令对应的表达式
    this.attr = attr;  // 绑定的属性值
    //记录上一次的nodeValue值，只为了nodeValue而存在
    this.lastValue = this.attr === 'nodeValue' ? `{{${exp}}}` : null;
    this.update(); // 第一次绑定时调用
};
Directive.prototype.update = function () {
    if (this.attr === 'nodeValue') {
        let value = this.vm.$get(this.vm.$data, this.exp);
        let nodeValue = this.el.nodeValue;
        //为什么用replace，是为了避免`{{test}}, {{test2}}`这样一个文本节点里多个绑定属性的干扰。
        this.el.nodeValue = nodeValue.replace(this.lastValue, value);
        this.lastValue = value;
    } else {
        this.el[this.attr] = this.vm.$get(this.vm.$data, this.exp);
    }
    //this.el[this.attr] = this.$get(this.vm.$data, this.exp);
};

window.Tue = function (options) {
    this._init(options);
    // this.id = options.el;
    // this.data = options.data;
    // observer(this.data, this);
    // nodeToFragment(document.getElementById(this.id), this);
};

Tue.prototype._init = function (options) {
    this.$options = options;
    this.$el = document.querySelector(options.el);
    this.$data = options.data;
    this.$methods = options.methods;

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

/* 遍历data中的属性，给每个属性都定一个指令集，并存在_binding中。
目的很简单：就是为了后面有更新操作的时候，可以直接遍历指令集执行里面的update方法。
据data对应属性的值的类型来做了一个判断，如果是值本事还是对象的话就直接递归一次。
如果不是就直接调用convert劫持属性了。
obj: 当前正在遍历的对象，从Tue.$data开始逐级深入。
keyPath: 遍历到的层级名称，字符串。
*/

Tue.prototype._observer = function(obj, keyPath){
    var OBJECT = 0, DATA = 1;
    var value;
    var keyPath = keyPath || '';
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            // 加入某属性与其对应的指令
            this._binding[keyPath + key] = {
                _directives: []
            };
            value = obj[key];
            if (typeof value === 'object') {
                this.convert(obj, key, value, keyPath + key, OBJECT);
                this._observer(value, keyPath + key + '.');
            } else {
                this.convert(obj, key, value, keyPath + key, DATA);
            }
        }
    }
};

/* 劫持具体属性
obj: 劫持的对象
key: 要劫持的对象的属性名
value: 要劫持的对象的属性值
originPath: 要劫持的属性在其对象中的具体路径
type: 为0代表obj[key]是对象，为1则代表具体数据
*/
Tue.prototype.convert = function (obj, key, value, originPath, type) {
    let binding = this._binding[originPath];
    // 当前属性的值是具体原始值的话则直接劫持并触发指令更新
    if (type === 1) {
        Object.defineProperty(obj, key, {
            get: function(){
                return value;
            },
            // 新值改变会触发对应的指令集合执行对应的更新，这里遍历了整个指令集合重新渲染。
            set: function(newVal){
                if (value !== newVal) {
                    value = newVal;
                    // 遍历执行指令集合。
                    binding._directives.forEach(function (item) {
                        item.update();
                    });
                }
            }
        });
    } else {
        // 当前属性的值是对象的话则还需进一步判断新值
        let subObj = obj[key] || {};
        Object.defineProperty(obj, key, {
            get: function(){
                return value;
            },
            set: function(newVal){
                if (typeof newVal === 'object') {
                    for(var subKey in newVal){
                        subObj[subKey] = newVal[subKey];
                    }
                } else {
                    subObj = newVal;
                    binding._directives.forEach(function(item){
                        item.update();
                    });
                }
            }
        });
    }
};

//用文档片段来劫持dom结构，进行dom解析完后重新渲染
Tue.prototype._compileAllNodes = function (node) {
    let frag = document.createDocumentFragment();

    let child;
    // 遍历所有的子节点
    while (child = node.firstChild) {
        // 解析下数据了
        this._compile(child);
        if (child.childNodes.length > 0) {
            this._compileAllNodes(child);
        }
        frag.appendChild(child);
    }
    node.appendChild(frag);
}

Tue.prototype._compile = function (node) {
    var self = this;
    //node为元素节点的时候
    if (node.nodeType === 1) {
        // 绑定的v-model,如果是input或者textarea的标签
        if (node.hasAttribute('v-model') && (node.tagName == 'INPUT' || node.tagName == 'TEXTAREA')) {
            var attrValue = node.getAttribute('v-model');
            self._binding[attrValue]._directives.push(new Directive (
                "input",
                node,
                self,
                attrValue,
                'value'
            ));
            node.addEventListener('keyup', function (e) {
                self.$set(self.$data, attrValue, e.target.value);
            });
            node.removeAttribute('v-model');
        }
        //  绑定的点击事件指令
        if (node.hasAttribute('v-click')) {
            let attrValue = node.getAttribute('v-click');
            let methodName = attrValue; //初始化设置方法名
            /*
             *  /\(.*\)/.exec("num('adf','sdf')");
             *  ["('adf','sdf')"]
             */
            let args = /\(.*\)/.exec(attrValue);
            if (args) {
                let arg = args[0];
                //如果有参数存在的话，需要处理一下得到真正的方法名。
                methodName = attrValue.replace(args, '');
                //处理参数的过程，目前只区分字符串和数字作为参数
                args = arg.replace(/[\(\)]/g, '').split(',');
                args = args.map(function (v) {
                    if (/\'\"/.test(v)) {
                        v = v.toString();
                    } else {
                        v = +v;
                    }
                    return v;
                });
            } else {
                args = [];
            }
            node.addEventListener('click', function () {
                self.$methods[methodName].apply(self.$data, args);
            });
            node.removeAttribute('v-click');
        }
        //手动绑定的方式。就是innerText操作
        if (node.hasAttribute('v-bind')) {
            var attrValue = node.getAttribute('v-bind');
            // 将innerText更新的指令加进去
            self._binding[attrValue]._directives.push(new Directive(
                'text',
                node,
                self,
                attrValue,
                'innerText'
            ));
            node.removeAttribute('v-bind');
        }

    }

    //文本节点
    if (node.nodeType === 3) {
        //(.+?)是非贪婪模式匹配双括号里的结果，以防{{test1}},{{test2}}两个连着的情况出现。
        let reg = /\{\{(.+?)\}\}/g;
        let value = node.nodeValue;
        let ret;
        while (ret = reg.exec(value)) {
            let attrValue = ret[1].trim();
            self._binding[attrValue]._directives.push(new Directive (
                'text',
                node,
                self,
                attrValue,
                'nodeValue'
            ));
        }
    }

};
