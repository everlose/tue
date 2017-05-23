/* 劫持具体属性
obj: 劫持的对象
key: 要劫持的对象的属性名
value: 要劫持的对象的属性值
originPath: 要劫持的属性在其对象中的具体路径
type: 为0代表obj[key]是对象，为1则代表具体数据
*/
var convert = function (vm, obj, key, value, originPath, type) {
    let binding = vm._binding[originPath];
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

/* 遍历data中的属性，给每个属性都定一个指令集，并存在_binding中。
目的很简单：就是为了后面有更新操作的时候，可以直接遍历指令集执行里面的update方法。
据data对应属性的值的类型来做了一个判断，如果是值本事还是对象的话就直接递归一次。
如果不是就直接调用convert劫持属性了。
obj: 当前正在遍历的对象，从Tue.$data开始逐级深入。
keyPath: 遍历到的层级名称，字符串。
*/

var observer = function (obj, keyPath) {
    var vm = this;
    var OBJECT = 0, DATA = 1;
    var value;
    var keyPath = keyPath || '';
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            // 加入某属性与其对应的指令
            vm._binding[keyPath + key] = {
                _directives: []
            };
            value = obj[key];
            if (typeof value === 'object') {
                convert(vm, obj, key, value, keyPath + key, OBJECT);
                vm._observer(value, keyPath + key + '.');
            } else {
                convert(vm, obj, key, value, keyPath + key, DATA);
            }
        }
    }
};

module.exports = observer;
