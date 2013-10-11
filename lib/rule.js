var util = require('util');

module.exports.createRule = function(name) {
  switch (name[0]) {
    case '*':
      return new Wildcard(name);

    case '!':
      return new Exception(name);

    default:
      return new Normal(name);
  }
}

function odiff(one, two) {
  var ii = 0;
  while (ii < one.length && one[ii] == two[ii]) {
    ii++;
  }
  return one.slice(ii);
}

function Rule(name, value, type) {
  this.name = name;
  this.value = value;
  this.type = type;
  this.labels = Domain.domain_to_labels(this.value);
}

Rule.prototype = {
  match: function(domain) {
    var l1 = this.labels
      , l2 = Domain.domain_to_labels(domain);

    return odiff(l1, l2).length === 0;
  }

  , allow: function(domain) {
    var d = this.decompose(domain);
    return !d[d.length - 1];
  }
};

function Normal(name) {
  Rule.call(this, name, name, 'normal');
}
Normal.prototype = {
  parts: function() {
    return this.parts || (this.parts = this.value.split('.'));
  }

  , decompose: function(domain) {
    var m = new RegExp('^(.*)\.(' + this.parts.join('.') + ')$').match(chomp(domain));
    return m ? [m[1], m[2]] : [];
  }
};
util.inherits(Normal, Rule);

function Wildcard(name) {
  Normal.call(name, name.slice(2, -1), 'wildcard');
}
Wildcard.prototype = {
  parts: function() {
    return this.parts || (this.parts = this.value.split('.'));
  }

  , decompose: function(domain) {
    var m = new RegExp('^(.*)\.(.*?\.' + this.parts.join('.') + ')$').match(chomp(domain, '.'));
    return m ? [m[1], m[2]] : [];
  }
};
util.inherits(Wildcard, Rule);

function Exception(name) {
  Rule.call(this, name, name.slice(1, -1));
}
Exception.prototype = {
  parts: function() {
    return this.parts || (this.parts = this.value.split('.').slice(1,  -1));
  }

  , decompose: function(domain) {
    var m = new RegExp('^(.*)\.(' + this.parts.join('.') + ')$').match(chomp(domain, '.'));
    return m ? [m[1], m[2]] : [];
  }
};
util.inherits(Exception, Rule);

function chomp(str, suffix) {
  if (endsWith(str, suffix)) {
    return str.slice(0, str.length - suffix.length);
  }
  return str;
}

function endsWith(str, suffix) {
  var l = str.length  - suffix.length;
  return l >= 0 && str.indexOf(suffix, l) === l;
}