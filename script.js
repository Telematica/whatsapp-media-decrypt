const http = require("https"); // or 'https' for https:// URLs
const fs = require("fs");
const { exec } = require("child_process");
const { url } = require("inspector");
const { argv } = require("process");

if (!argv[2]) {
  console.log("No file!");
  return;
}

const SCRIPT_DIRECTORY = __dirname;
const CURRENT_WORKING_DIRECTORY = process.cwd();
const Doc = require(`${CURRENT_WORKING_DIRECTORY}/${argv[2]}`);

// https://ali-dev.medium.com/how-to-use-promise-with-exec-in-node-js-a39c4d7bbf77

(async () => {
  const files = Doc.map((file) => {
    return {
      body: file.body,
      deprecatedMms3Url: file.deprecatedMms3Url,
      mediaKey: file.mediaKey,
      type: file.type,
      url: file.deprecatedMms3Url
        ? file.deprecatedMms3Url
            .match(/\b\/\w.*\.enc\b/)[0]
            .replace("/d/f/", "")
        : null,
    };
  });

  const downloadFile = (url) =>
    new Promise((resolve, reject) => {
      console.log(`Downloading... curl -O ${url}`);
      exec(`curl -O ${url}`, (error, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        if (error !== null) {
          console.log(`exec error: ${error}`);
        }
        resolve(stdout ? stdout : stderr);
      });
    });

  const decryptFile = (file, mediaKey, type) =>
    new Promise((resolve, reject) => {
      console.log(
        `Decrypting... python3 decrypt_customized.py ${file} "${mediaKey}" ${type}`
      );
      exec(
        `python3 ${SCRIPT_DIRECTORY}/decrypt_customized.py ${file} "${mediaKey}" ${type}`,
        (error, stdout, stderr) => {
          console.log(stdout);
          console.log(stderr);
          if (error !== null) {
            console.log(`exec error: ${error}`);
          }
          resolve(stdout ? stdout : stderr);
        }
      );
    });

  const renameFile = (file, extension) => {
    exec(`mv ./${file}.bin "${file}.${extension}"`, (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      if (error !== null) {
        console.log(`exec error: ${error}`);
      }
    });
  };

  const renameFileBulk = (extension) => {
    exec(
      `for i in ./*.bin ; do mv "\${i}" "\${i}.${extension}" ; done`,
      (error, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        if (error !== null) {
          console.log(`exec error: ${error}`);
        }
      }
    );
  };

  const extension = (type) => {
    switch (type) {
      case "audio":
        return "ogg";
      case "image":
        return "jpeg";
      case "video":
        return "mp4";
      default:
        return "jpeg";
    }
  };

  const downloadDecryptAndRenameFile = async (file) => {
    const { type } = file;
    if (type === "chat") {
      console.log(file.body);
      return;
    }
    await downloadFile(file.deprecatedMms3Url);
    await decryptFile(file.url, file.mediaKey, type);
  };

  await Promise.all(files.map((file) => downloadDecryptAndRenameFile(file)));
  files.map((file) => {
    if (file.type === "chat") {
      return;
    }
    renameFile(file.url.replace(".enc", ""), extension(file.type));
  });
})();
