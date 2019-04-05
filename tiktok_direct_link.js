// ==UserScript==
// @name         TikTok Direct Link
// @homepage    https://github.com/DumbCodeGenerator/TikTok_Direct_Link
// @version      0.1
// @description  Получает ссылку на видос без вотермарки
// @author       DumbCodeGenerator
// @match        *://*.tiktok.com/*
// @match        *://*.muscdn.com/*
// @require      http://code.jquery.com/jquery-latest.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const loc = location.href;
    if(loc.includes('muscdn.com')){
        loopVideo()
    }else if(loc.includes('/share/video/')){
        getLink(false)
    }else if(loc.includes('m.tiktok.com/v/')){
        getLink(true)
    }else if(loc.includes('/share/user/')){
        const pushState = history.pushState;
        history.pushState = function () {
            pushState.apply(history, arguments);
            if(location.href.includes('/share/video/')){
                getLink(false)
            }
        };
    }
})();

function stopVideo(){
    $("video").trigger("pause")
}

function loopVideo(){
    $("video").prop("loop", true)
}

function parseLink(document){
    const result = document.evaluate('/html/body/script[2]', document, null, XPathResult.STRING_TYPE, null);
    const script = result.stringValue;

    const startIndex = script.indexOf("play_addr");
    const length = (script.lastIndexOf("},\"cover\"") + 1) - startIndex;
    const play_addr = script.substr(startIndex, length);

    const uriStart = play_addr.lastIndexOf("\"uri\":\"") + 7;
    const uriLength = play_addr.lastIndexOf("\"}") - uriStart;
    const uri = play_addr.substr(uriStart, uriLength);

    return `http://api2.musical.ly/aweme/v1/play/?video_id=${uri}&ratio=720p`;
}

function getLink(isVm){
    if(!isVm){
        const url = location.href;
        const id = url.substr(url.lastIndexOf('/') + 1, 19);
        $.ajax({ url: `https://m.tiktok.com/v/${id}.html`, success: function(data) {
                const doc = new DOMParser().parseFromString(data, 'text/html');
                const href = `<a class="count" style="color: #009ec8; cursor: pointer; text-decoration: underline;" href=${parseLink(doc)} target="_blank">Без вотермарки</a>`;
                $("div.count").after(href);
                $("a.count").on('click', function() {
                    stopVideo()
                })
            } });
    }else{
        const href = `<a id="caption" style="color: #009ec8; cursor: pointer; text-decoration: underline;" href=${parseLink(document)} target="_blank">Без вотермарки</a>`;
        $("p#caption").after(href);
        $("a#caption").on('click', function() {
            stopVideo()
        })
    }
}