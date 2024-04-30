const {
  unescapePlaceholders,
} = require("../../../fr-config-common/src/utils.js");

const BASE64_PRE_ENCODED_PREFIX = "BASE64:";

function replaceEnvSpecificValues(content, base64Encode = false) {
  let newContent = content;

  const placeholders = content.match(/\\*?\${.*?}/g);

  if (!placeholders) {
    return newContent;
  }

  for (const placeholder of placeholders) {
    if (placeholder.startsWith("\\\\")) {
      continue;
    }
    let placeholderName = placeholder.replace(/\${(.*)}/, "$1");

    if (placeholderName.startsWith(BASE64_PRE_ENCODED_PREFIX)) {
      base64Encode = false;
      placeholderName = placeholderName.substring(
        BASE64_PRE_ENCODED_PREFIX.length
      );
    }

    let value = process.env[placeholderName];
    if (!value) {
      console.error("ERROR: no environment variable for", placeholderName);
      process.exit(1);
    }

    if (base64Encode) {
      value = Buffer.from(value).toString("base64");
    }

    newContent = newContent.replaceAll(placeholder, value);
  }

  return unescapePlaceholders(newContent);
}

function removeProperty(obj, propertyName) {
  for (prop in obj) {
    if (prop === propertyName) {
      delete obj[prop];
    } else if (typeof obj[prop] === "object") {
      removeProperty(obj[prop], propertyName);
    }
  }
}

function clearOperationalAttributes(obj) {
  delete obj._id;
  delete obj._rev;
  delete obj._pushApiVersion;
  delete obj.createdBy;
  delete obj.creationDate;
  delete obj.lastModifiedBy;
  delete obj.lastModifiedDate;
}

module.exports.replaceEnvSpecificValues = replaceEnvSpecificValues;
module.exports.removeProperty = removeProperty;
module.exports.clearOperationalAttributes = clearOperationalAttributes;
