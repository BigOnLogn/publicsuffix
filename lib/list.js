var fs = require('fs')
  , createRule = require('./rule');

// property vars
var _default
  , _private_domains
  , _default_definition;

function List(initializer) {
  this.rules = [];
  this.indexes = {};
  if (initializer) initializer(this);
  this.createIndex();
}

List.default_list = function(val) {
  if (arguments.length) _default = val;
  else return _default || (_default = List.parse(List.default_definition()));
};

List.private_domains = function(val) {
  if (arguments.length) {
    _private_domains = !!val;
    return List.clear();
  }

  return _private_domains;
};

List.clear = function() {
  _default = null;
  return List;
};

List.reload = function() {
  return List.clear().default_list();
}

List.default_definition = function() {
  return _default_definition || fs.readFileSync('./definitions.txt');
};

List.parse = function(input) {
  return new List(function(list) {
    var lines = input.split('\n');
    for(var i = 0, l = lines.length; i < l; i++) {
      var line = lines[i].trim();

      if (!List.private_domains && line.indexOf('===BEGIN PRIVATE DOMAINS===') >= 0) break;

      // strip empty or commented lines
      if (line == '' || /^\/\//.test(line)) {
        continue;
      }

      list.add(createRule(line));
    }
  });
}

fs.readFile('./definitions.txt', function(data) {
  _default_definition = data;
});

List.prototype = {
  // creates a naive index for rules
  createIndex: function() {
    var rs = this.rules.map(function(r) {
      return r.labels.first;
    });

    for(var i = 0, l = rs.length; i < l; i++) {
      var elm = rs[i];
      if (this.indexes[elm]) {
        this.indexes[elm].push(i);
      } else {
        this.indexes[elm] = [i];
      }
    }
  }

  // iterate over the list
  , each: function(iterator) {
    this.rules.forEach(iterator);
  }

  // add a Rule to the list
  , add: function(rule, index) {
    this.rules.push(rule);
    if (index) this.createIndex();
    return this;
  }

  // find the most appropriate rule for domain
  , find: function(domain) {
    var rules = this.select(domain);
    return rules.filter(function(r) { return r.type === 'exception'; })[0] ||
      rules.reduce(function(t, r) { return t.length > r.length ? t : r; });
  }

  , select: function(domain) {
    if (domain === '' || domain.indexOf('://') !== -1) {
      return [];
    }

    var indexes = this.indexes[Domain.domainToLables(domain)[0]] || [];
    return this.rules.map(function(r, i) { return indexes.indexOf(i) !== -1; })
      .filter(function(r) { return r.match(domain); });
  }
};

module.exports = List;