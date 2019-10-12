//------------------------------------- Initialisation --------------------------------------//

"use strict";

require("chrome-extension-async");
const hash = require("hash.js");
const Authenticator = require("otplib").authenticator.Authenticator;

const validSenders = [
    "naepdomgkenhinolocfifgehidddafch",
    "pjmbgaakjkbhpopmakjoedenlfdmcdgm",
    "klfoddkbhleoaabpmiigbmpbjfljimgb",
    "browserpass@maximbaz.com"
];

// instance registry
var registry = {};

// Main entry point, invoked from browserpass. No response is expected.
chrome.runtime.onMessageExternal.addListener(function(request, sender) {
    // reject invalid senders
    if (!validSenders.includes(sender.id)) {
        return;
    }

    // hydrate request
    if (!request.hasOwnProperty("version")) {
        // REMOVE this block once browserpass-extension-3.1 is fully deployed in prod.
        request.version = "3.0.12";
        request.action = "noop";
    }
    request.version = (version => {
        var [major, minor, patch] = version.split(".");
        return parseInt(major) * 1000000 + parseInt(minor) * 1000 + parseInt(patch);
    })(request.version);

    // parse OTP object
    if (request.otp.key === null) {
        // this is an OTP URI, so extract the pieces
        try {
            let url = new URL(request.otp.data.toLowerCase());
            let parts = url.pathname.split("/").filter(s => s.trim());
            var otp = {
                type: parts[0],
                secret: url.searchParams.get("secret").toUpperCase(),
                algorithm: url.searchParams.get("algorithm") || "sha1",
                digits: parseInt(url.searchParams.get("digits") || "6"),
                period: parseInt(url.searchParams.get("period") || "30")
            };
        } catch (e) {
            console.log(`Unable to parse uri: ${request.otp.data}`, e);
            return;
        }
    } else {
        var otp = {
            type: request.otp.key.toLowerCase(),
            secret: request.otp.data.toUpperCase(),
            algorithm: "sha1",
            digits: 6,
            period: 30
        };
    }

    // fix default type
    if (otp.type === "otp") {
        otp.type = "totp";
    }

    // set handler
    if (otp.type === "totp") {
        otp.generate = makeTOTP.bind(otp);
    } else {
        console.log(`Unsupported OTP type: ${otp.type}`);
    }

    // update registry
    registry[request.settings.tab.id] = {
        otp: otp,
        origin: request.settings.origin,
        host: request.settings.host
    };

    // copy to clipboard
    // TODO only do this automatically when option is enabled
    if (!request.action.match(/^copy[A-Z]*/)) {
        copyToClipboard(otp.generate());
    }
});

// popup entry point
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case "getToken":
            if (
                registry.hasOwnProperty(request.tabID) &&
                (registry[request.tabID].origin
                    ? registry[request.tabID].origin === request.origin
                    : registry[request.tabID].host === request.host)
            ) {
                let otp = registry[request.tabID].otp;
                let response = { token: otp.generate() };
                if (otp.type == "totp") {
                    // refresh after this many seconds
                    response.refresh = otp.period - (Math.floor(Date.now() / 1000) % otp.period);
                    response.period = otp.period;
                }
                sendResponse(response);
            } else {
                sendResponse({ token: null });
            }
            break;
        default:
            throw new Error(`Unknown action: ${request.action}`);
    }
});

// clean up stale registry entries
chrome.tabs.onRemoved.addListener(tabID => {
    delete registry[tabID];
});

//----------------------------------- Function definitions ----------------------------------//

/**
 * Generate a TOTP code
 *
 * @since 3.0.0
 *
 * @return string Generated code
 */
function makeTOTP() {
    switch (this.algorithm) {
        case "sha1":
        case "sha256":
        case "sha512":
            break;
        default:
            throw new Error(`Unsupported TOTP algorithm: ${this.algorithm}`);
    }

    var generator = new Authenticator();
    generator.options = {
        crypto: {
            createHmac: (a, k) => hash.hmac(hash[a], k)
        },
        algorithm: this.algorithm,
        digits: this.digits,
        step: this.period
    };

    return generator.generate(this.secret);
}

/**
 * Copy text to clipboard
 *
 * @since 3.0.0
 *
 * @param string text Text to copy
 * @return void
 */
function copyToClipboard(text) {
    document.addEventListener(
        "copy",
        function(e) {
            e.clipboardData.setData("text/plain", text);
            e.preventDefault();
        },
        { once: true }
    );
    document.execCommand("copy");
}
