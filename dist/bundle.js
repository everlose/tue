/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var nodeToFragment = __webpack_require__(1);
	var observer = __webpack_require__(4);

	window.Tue = function (options) {
	    this.id = options.el;
	    this.data = options.data;
	    observer(this.data, this);
	    nodeToFragment(document.getElementById(this.id), this);
	};


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var Watcher = __webpack_require__(2);

	//判断每个节点是不是有子节点，如果有那么就返回
	const hasChildNode = (node) => {
	    return node.childNodes.length === 0 ? false : node;
	}

	//用文档片段来劫持dom结构，进行dom解析完后重新渲染
	const nodeToFragment = (node, vm) => {
	    let frag = document.createDocumentFragment();

	    let child;
	    // 遍历所有的子节点
	    while (child = node.firstChild) {
	        // 解析下数据了
	        compile(child, vm);
	        if (hasChildNode(child)) {
	            nodeToFragment(child, vm);
	        }
	        frag.appendChild(child);
	    }
	    node.appendChild(frag);
	}
	//初始化编译数据
	const compile = (node, vm) => {
	    //node为元素节点的时候
	    if (node.nodeType === 1) {
	        //获取处元素节点上所有属性主要是为了获得v-model
	        var attrs = node.attributes;
	        for (let i = 0; i < attrs.length; ++i) {
	            if (attrs[i].nodeName === 'v-model') {
	                var name = attrs[i].nodeValue;
	                if (node.nodeName === 'INPUT') {
	                    node.addEventListener('keyup', (e) => {
	                        vm[name] = e.target.value;
	                    });
	                }
	                node.value = vm[name];
	                node.removeAttribute(attrs[i].nodeName);
	            }
	        }
	    }
	    //文本节点
	    if (node.nodeType === 3) {
	        let reg = /\{\{(.*)\}\}/g;
	        let value = node.nodeValue;
	        let ret;
	        while (ret = reg.exec(value)) {
	            let name = ret[1].trim();
	            new Watcher(vm, node, name);
	        }
	    }
	}

	//渲染解析DOM的函数
	module.exports = nodeToFragment;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var Dep = __webpack_require__(3);

	//订阅者（为每个节点的数据建立watcher 队列，每次接受更改数据需求哈后，利用数据劫持执行对应的节点的数据更新操作）
	function Watcher(vm, node, name){
	    Dep.target = this;
	    this.vm = vm;
	    this.node = node;
	    this.name = name;
	    this.update();
	    Dep.target = null;
	}
	Watcher.prototype = {
	    update () {
	        this.get();
	        if (this.node.nodeName === 'INPUT') {
	            this.node.value = this.value;
	        } else {
	            this.node.nodeValue = this.value;
	        }
	    },
	    get () {
	        //这里访问了vm的属性，触发了getter，赋予了Dep.target值
	        this.value = this.vm[this.name];
	    }
	};

	module.exports = Watcher;


/***/ },
/* 3 */
/***/ function(module, exports) {

	//通知者(发布者)，为了通知订阅了data中的属性的地方其值发生了改变
	function Dep () {
	    //所与之联系的订阅者数组
	    this.subs = [];
	    //理解成全局变量，由于需要在闭包内添加watcher，所以通过Dep定义一个全局target属性，暂存watcher, 添加完移除。
	    this.target = null;
	}
	Dep.prototype = {
	    addSub (watcher) {
	        this.subs.push(watcher);
	    },
	    notify () {
	        this.subs.forEach((watcher) => {
	            watcher.update();
	        });
	    }
	};

	module.exports = Dep;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var Dep = __webpack_require__(3);

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


/***/ }
/******/ ]);