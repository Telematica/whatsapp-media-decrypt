const Doc = require("./2021-08-27.json");
const http = require('https'); // or 'https' for https:// URLs
const fs = require('fs');
const { exec } = require('child_process');


(async () => {
    await (async () => { Doc.forEach(async (item) => {
        const type = item.type;
        if (type === "chat") {
            console.log(item.body);
            return;
        }
        const encFile = item.deprecatedMms3Url.match(/\b\/\w.*\.enc\b/)[0].replace('/d/f/', '');
        console.log(encFile, item.mediaKey, `python3 decrypt.py ${encFile} "${item.mediaKey}"`);
        
        exec(`curl -O ${item.deprecatedMms3Url}`,
        (error, stdout, stderr) => {
            console.log(stdout);
            console.log(stderr);
            if (error !== null) {
                console.log(`exec error: ${error}`);
            }
        });

        exec(`python ./decrypt.py ${encFile} "${item.mediaKey}"`,
            (error, stdout, stderr) => {
                console.log(stdout);
                console.log(stderr);
                if (error !== null) {
                    console.log(`exec error: ${error}`);
                }
        });
        });
    })();

    exec(`for i in ./*.bin ; do mv "\${i}" "\${i}.jpeg" ; done`,
    (error, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        if (error !== null) {
            console.log(`exec error: ${error}`);
        }
    });
})();