/*
 * preprocess
 * https://github.com/onehealth/grunt-preprocess
 *
 * Copyright (c) 2012 OneHealth Solutions, Inc.
 * Written by Jarrod Overson - http://jarrodoverson.com/
 * Licensed under the Apache 2.0 license.
 */
/*jshint node:true*/

'use strict';

var path = require('path');

module.exports = init;

var preprocess = require('preprocess');

var defaultEnv = {};

function init(grunt) {
  var _ = grunt.util._;

  grunt.registerMultiTask('preprocess', 'Preprocess files based off environment configuration', function() {

    var options = this.options();
    var context = _.extend({}, defaultEnv,process.env, options.context || {});

    context.NODE_ENV = context.NODE_ENV || 'development';

    this.files.forEach(function(fileObj){
      if (!fileObj.dest) {
        if (!options.inline) {
          grunt.log.error('WARNING : POTENTIAL CODE LOSS.'.yellow);
          grunt.log.error('You must specify "inline : true" when using the "files" configuration.');
          grunt.log.errorlns(
            'This WILL REWRITE FILES WITHOUT MAKING BACKUPS. Make sure your ' +
              'code is checked in or you are configured to operate on a copied directory.'
          );
          return;
        }
        fileObj.src.forEach(function(src) {
          var srcText = grunt.file.read(src);
          context.src = src;
          context.srcDir = path.dirname(src);
          var processed = preprocess.preprocess(srcText, context, getExtension(src));
          grunt.file.write(src, processed);
        });
      } else {
        var files;

        var process = function(src, dst) {
          var dest = grunt.template.process(fileObj.dest);
          var cwd = fileObj.cwd || './';

          var srcText = grunt.file.read(path.join(cwd, src));
          context.src = src;
          context.srcDir = path.dirname(src);
          var processed = preprocess.preprocess(srcText, context, getExtension(src));

          grunt.file.write(path.join(dest, dst || src), processed);
        }

        if (fileObj.src) {
          files = fileObj.src;
          files.forEach(function(src) {
            process(src, files[src]);
          });
        } else {
          files = fileObj.files;
          Object.keys(files).forEach(function(src) {
            process(src, files[src]);
          });
        }
      }
    });
  });
}

function getExtension(filename) {
  var ext = path.extname(filename||'').split('.');
  return ext[ext.length - 1];
}
