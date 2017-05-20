var Dep = require('./dep');

//监听者（利用setter监听view => model 的数据变化  发出通知更改model数据后再从model＝> view更新视图所有用到的地方）
var observer = function (data, vm) {
    // 遍历劫持data下面的所有的属性
    walk(data, vm);
    // Object.keys(data).forEach((key) => {
    //     defineReactive(vm, key, data[key]);
    // });
}

// 监听者（利用setter监听view => model 的数据变化  发出通知更改model数据后再从model＝> view更新视图所有用到的地方）
// var Observer = function (data, vm) {
//     this.data = data;
//     this.vm = vm;
//     //遍历劫持data下面的所有的属性，并逐个劫持
//     this.walk(data);
// }

// //遍历对象上的所有属性
// Observer.prototype.walk = function(obj){
//     for (var key in obj) {
//         // 这里用hasOwnProperty是因为要过滤非该对象的属性
//         if (obj.hasOwnProperty(key)) {
//             let val = obj[key];
//             if (typeof val === 'object') {
//                 new Observer(val, this.vm);
//             } else {
//                 defineReactive(this.vm, key, val);
//             }
//         }
//     }
// }

var walk = function(obj, vm){
    for (var key in obj) {
        // 这里用hasOwnProperty是因为要过滤非该对象的属性
        if (obj.hasOwnProperty(key)) {
            let val = obj[key];
            if (typeof val === 'object') {
                walk(val, vm);
            } else {
                defineReactive(vm, key, val);
            }
        }
    }
};
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
