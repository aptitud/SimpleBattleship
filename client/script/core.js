Array.prototype.each = function(callback) {
    for (var i = 0; i < this.length; i++) {
        callback(this[i], i);
    }
};

Array.prototype.removeAll = function(predicate) {
    var removed = [];

    for (var i = 0; i < this.length; i++) {
        if (predicate(this[i], i)) {
            removed.push(this[i]);
            this.splice(i--, 1);
        }
    }

    return removed;
};