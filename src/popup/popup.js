//------------------------------------- Initialisation --------------------------------------//
//
"use strict";

//require("chrome-extension-async");
var m = require("mithril");
var token = null;

// interface definition
var display = {
    view: function() {
        var nodes = [];

        if (token !== null) {
            nodes.push(
                m("div.outline", [
                    m("div.token", token),
                    m("div.copy", {
                        onclick: function() {
                            copyToClipboard(token);
                        }
                    })
                ])
            );
        } else {
            nodes.push(m("div.info", "No token available"));
        }

        return nodes;
    }
};

// attach to popup
m.mount(document.body, display);

// attach key handler
document.addEventListener("keydown", e => {
    e.preventDefault();
    if (e.code == "KeyC" && e.ctrlKey && token !== null) {
        copyToClipboard(token);
    }
});

// dispatch initial token request
dispatchRequest();

//----------------------------------- Function definitions ----------------------------------//
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

    // flash container
    document.querySelector(".outline").classList.add("copied");
    setTimeout(function() {
        document.querySelector(".outline").classList.remove("copied");
    }, 200);
}

/**
 * Dispatch background token request
 *
 * @since 3.0.0
 *
 * @return void
 */
function dispatchRequest() {
    // get active tab
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        var request = {
            action: "getToken",
            tabID: tabs[0].id,
            host: new URL(tabs[0].url).hostname
        };
        // request new token
        chrome.runtime.sendMessage(request, response => {
            updateToken(response.token);
            if (response.hasOwnProperty("refresh")) {
                setTimeout(dispatchRequest, response.refresh * 1000);
            }
        });

        return true;
    });
}

/**
 * Update the displayed token
 *
 * @param string newToken New token data
 * @since 3.0.0
 */
function updateToken(newToken, period = null) {
    token = newToken;
    m.redraw();
}
