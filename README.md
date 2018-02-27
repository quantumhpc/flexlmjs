# nodejs-flexlm
Nodejs parser for Flexlm license server

Get current license usage from Flexlm lmstat command


### Usage ### 

** Single server
```
var config = {
        "flexBinary"    :  "./lmutil",
        "flexCmd"       :  "lmstat -a -c",
        "serverURL"     :  "1999@serverURL"
}
var flexlm = require("./flexlmjs/flexjs.js")
flexlm.lmstat(config, function(err, output){})
```

>returns
```
{ 
    feature1: { 
            total: '4000',
            used: '1210',
            free: 2790,
            tokens: 
                [ 
                  { username: 'user1',
                    machine: 'machine1',
                    vendorname: 'vendor1',
                    version: 'v3000.0',
                    expiry: '03-jul-2020' },
                  { username: 'mdelucio',
                    machine: 'atila',
                    started: 'start',
                    vendorname: 'vendor1',
                    version: 'v3000.0',
                    expiry: '03-jul-2020' },
                    {...}
                ]
    },
    feature2: { 
        total: '1', 
        used: '0', free: 1, tokens: [] 
    },
    feature3: { 
        total: '1', 
        used: '0', 
        free: 1, 
        tokens: [] 
    },
    feature4: { 
        total: '1', 
        used: '0', 
        free: 1, 
        tokens: [] 
    },
    feature5: { 
        total: '4000', 
        used: '0', 
        free: 4000, 
        tokens: [] 
    } 
}
```


** Multiple servers

You can use an array to specify multiple server urls and return an array of outputs
```
var config = {
        "flexBinary"    :  "./lmutil",
        "flexCmd"       :  "lmstat -a -c",
        "serverURL"     :  ["1999@serverURL", "1055@server2"]
}
```

** Test server

You can use a file containing lmstat output to parse its content
```
var config = {
        "flexBinary"    :  "./lmutil",
        "flexCmd"       :  "lmstat -a -c",
        "serverURL"     :  [ ["test", "/path/to/file.out", "1055@server2"]
}
```

