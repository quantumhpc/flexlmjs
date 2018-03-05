/*
 * The MIT License (MIT)
 * 
 * Copyright (C) 2016 Quantum HPC
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of 
 * this software and associated documentation files (the “Software”), to deal in the 
 * Software without restriction, including without limitation the rights to use, copy, 
 * modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the 
 * following conditions:

 * The above copyright notice and this permission notice shall be included in all 
 * copies or substantial portions of the Software.

 * The Software is provided “as is”, without warranty of any kind, express or implied, 
 * including but not limited to the warranties of merchantability, fitness for a particular 
 * purpose and noninfringement. In no event shall the authors or copyright holders be 
 * liable for any claim, damages or other liability, whether in an action of contract, 
 * tort or otherwise, arising from, out of or in connection with the software or the use 
 * or other dealings in the Software.
*/
var cproc = require('child_process');
var spawn = cproc.spawnSync;
var fs = require('fs');
var path = require('path');

// Regex for lmstat output
var featureRegEx=/^Users of ([^:]*):[^0-9:]*([0-9]+)[^0-9]*([0-9]+)[^0-9]*([\)]+)/;
var errorRegEx=/^Users of ([^:]*):[^0-9]*(Error)[^0-9]*([0-9]+)[^0-9]*,([^:]*)([\)]+)/;
var versionTokenRegEx=/\s*([^\s]*)\s+([^\s,]*),\s+([^\s]*)\s+([^\s,]*),\s+([^\s]*)\s+([^\s,]*)/;
var userTokenRegEx=/\s*([^\s]*)\s+([^\s]*)\s+([^\s]*)\s+([^\s]*){0,1}\s*\(([^\s]*)\)\s+\(([^\)]*)\),\s+([^\s]*)\s(.*)/;

function lmstat(flexConfig, callback){
  var result = {};
  var tokenFeature;
  var vendorInfo;
  var flexCmd = flexConfig.cmd.trim().split(/\s/g);
  
  // Create Stream
  var output = [];
  if (flexConfig.serverURL[0] === 'test'){
    var outputFile = fs.readFileSync(flexConfig.serverURL[1],'utf8');
    output.stdout = outputFile;
  }else{
    flexCmd.push(flexConfig.serverURL);
    output = spawn(path.resolve(flexConfig.binary + (/^win/.test(process.platform) ? (!flexConfig.binary.endsWith(".exe") ? '.exe' : '') : '')), flexCmd, { encoding : 'utf8' });
  }
  
  // Invalid lmutil binary
  if (output.error){
      return callback(new Error(output.error));
  }
  // Transmit the error if any
  if (output.stderr){
      return callback(new Error(output.stderr.replace(/\n/g,"")));
  }
  // Treat output
  output = output.stdout.split('\n');
  
  for (var i=0; i<output.length; i++){
    // Line by line
    var line = output[i];
    var m,n,u,e;
    // Feature line
    m = line.match(featureRegEx);
    if (m) {
      //Assuming token line is given right after feature line, we save it for the next lines
      tokenFeature = m[1];
      // Push the feature
      result[tokenFeature] = {
        "total":m[2],
        "used":m[3],
        "free":m[2]-m[3],
        "tokens":[]
      };
    }else{
      // Token line with vendor
      n = line.match(versionTokenRegEx);
      if (n) {
        // Save the vendor information temporarly
        vendorInfo = {
          "name" : n[4],
          "version" : n[2],
          "expiry" : n[6]
        };
      }else{
        // Token line with username and machine
        u = line.match(userTokenRegEx);
        if (u) {
          // Need the previous lines to know which licence
          result[tokenFeature].tokens.push({
            "username" : u[1],
            "machine" : u[2],
            "started" : u[7],
            "vendorname" : vendorInfo.name,
            "version" : vendorInfo.version,
            "expiry" : vendorInfo.expiry
          });
        }else{
          // Error lines
          e = line.match(errorRegEx);
          if (e) {
            result[e[1]] = {
              "total" : e[3],
              "error" : e[4]
            };
          }
        }
      }
    }
  }
  
  // Return result table
  return callback(null, result);
}

module.exports = {
    lmstat  : lmstat
};
