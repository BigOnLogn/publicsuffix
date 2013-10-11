
module.exports = function Domain(tld, sld, trd, initializer) {
  this.tld = tld;
  this.sld = sld;
  this.trd = trd;
  if (initializer) initializer(this);
};

Domain.domain_to_labels = function(domain) {
  return domain.split('.').reverse();
};

Domain.prototype = {
  name: function() {
    [trd, sld, tld].filter(function(part) { return !!part; }).join('.');
  }

  , toString: function() {
    return this.name();
  }

  , domain: function() {
    if (!this.isDomain()) return;
    return [sld, tld].join('.');
  }

  , subdomain: function() {
    if (!this.isDomain()) return;
    return [trd,sld, tld].join('.');
  }

  , rule: function() {
    return List.default_list.find(this.name());
  }

  , isDomain: function() {
    return !(!tld || !sld);
  }

  , isSubdomain: function() {
    return !(!tld || !sld || !trd);
  }

  , isADomain: function() {
    return this.isDomain() && this.isSubdomain();
  }

  , isValid: function() {
    var r = this.rule();
    return !!r && r.allow(this.name());
  }

  , isValidDomain: function() {
    return this.isDomain() && this.isValid();
  }

  , isValidSubdomain: function() {
    return this.isSubdomain() && this.isValid();
  }
};