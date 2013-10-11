var List = require('./lib/list')
  , Domain require('./lib/domain');

// parse a domain with the given list (if no list is given, the default list will be used).
module.exports.parse = function(domain, list) {
  list = list || List.default_list();

  var rule = list.find(domain);

  if (!rule) {
    throw new Error(domain + " is not a valid domain");
  }
  if (!rule.allow(domain)) {
    throw new Error(domain + " is not allowed according to the registry policy");
  }

  var d = rule.decompose(domain)
    , left = d[0]
    , right = d[1];

  var parts = left.split('.')
    , tld = right
    , sld = parts.length ? parts.pop() : null
    , trd = parts.length ? parts.join('.') : null;

  return new Domain(tld, sld, trd);
};

// check if the given domain is valid.
module.exports.valid = function(domain) {
  var rule = List.default_list.find(domain);
  return rule && rule.allow(domain);
};