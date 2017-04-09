var Dep = require('./dep');

//监听者（利用setter监听view => model 的数据变化  发出通知更改model数据后再从model＝> view更新视图所有用到的地方）
var observer = function (data, vm) {
    // 遍历劫持data下面的所有的属性
    Object.keys(data).forEach((key) => {
        defineReactive(vm, key, data[key]);
    });
}
//属性劫持封装
var defineReactive = function (vm, key, val) {
    // 新建通知者
    let dep = new Dep();
    // 利用setter 和 getter 访问器来对属性的值监听
    Object.defineProperty(vm, key, {
        get: () => {
            if (Dep.target) {
                dep.addSub(Dep.target);
            }
            return val;
        },
        set: (newVal) => {
            if (val === newVal) {
                return;
            }
            val = newVal;
            vm.data[key] = val;
            dep.notify();
        }
    });
};

//监听器函数
module.exports = observer;
