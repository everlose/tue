var nodeToFragment = require('./nodeToFragment');
var observer = require('./observer');

window.Tue = function (options) {
    this.id = options.el;
    this.data = options.data;
    observer(this.data, this);
    nodeToFragment(document.getElementById(this.id), this);
};
