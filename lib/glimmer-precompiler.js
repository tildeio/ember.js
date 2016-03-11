'use strict';

/*jshint node: true */

var Filter = require('broccoli-persistent-filter');
var compile = require('glimmer-engine-precompiler');

GlimmerTemplatePrecompiler.prototype = Object.create(Filter.prototype);

function GlimmerTemplatePrecompiler (inputTree, options) {
  if (!(this instanceof GlimmerTemplatePrecompiler)) {
    return new GlimmerTemplatePrecompiler(inputTree, options);
  }

  options = options || {};
  Filter.call(this, inputTree, options);

  this.inputTree = inputTree;
}

GlimmerTemplatePrecompiler.prototype.extensions = ['ghbs'];
GlimmerTemplatePrecompiler.prototype.targetExtension = 'js';

GlimmerTemplatePrecompiler.prototype.baseDir = function() {
  return __dirname;
};

GlimmerTemplatePrecompiler.prototype.processString = function(content) {
  var compiledSpec = compile(content);
  var template = 'import template from "ember-glimmer/ember-template-compiler/system/template";\n';
  template += 'export default template(' + compiledSpec + ');';

  return template;
};

module.exports = GlimmerTemplatePrecompiler;
