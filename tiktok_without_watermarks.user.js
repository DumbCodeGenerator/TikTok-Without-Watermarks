// ==UserScript==
// @name         TikTok Without Watermarks
// @homepage     https://github.com/DumbCodeGenerator/TikTok-Without-Watermarks
// @version      0.3
// @description  Меняет видосы на сайте ТикТока на видосы без вотермарки
// @author       DumbCodeGenerator
// @run-at       document-start
// @match        *://*.tiktok.com/*
// @require      http://code.jquery.com/jquery-latest.js
// @require      https://jpillora.com/xhook/dist/xhook.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const loc = location.href;
    if(loc.includes('/share/video/')){
        $(function () {
            replaceShareVideo()
        })
    }else if(loc.includes('m.tiktok.com/v/')){
        $(function () {
            jQuery.noConflict(true);
            replaceVmVideo()
        })
    }else{
        xhook.after(function(request, response) {
            if(request.url.includes('/share/item/list')) {
                const regexp = /"urls":\[(.*?)]/g;
                let text = response.text;
                let match;
                while ((match = regexp.exec(text)) !== null) {
                    const urls = match[1];
                    const split = urls.split(',');
                    text = text.replace(urls, split[2].replace('watermark=1', 'watermark=0'));
                }
                response.text = text;
            }
        });
    }
})();

function parseLink(document){
    const docText = $(document).text();

    const startIndex = docText.indexOf("play_addr") + 11;
    const length = (docText.lastIndexOf("},\"cover\"") + 1) - startIndex;
    const play_addr = docText.substr(startIndex, length);

    return JSON.parse(play_addr)['url_list'][2];
}

function replaceShareVideo() {
    const link = window.__INIT_PROPS__['/share/video/:id']['videoData']['itemInfos']['video']['urls'][2].replace('watermark=1', 'watermark=0');
    $('video').attr('src', link)
}

function replaceVmVideo(){
    const href = `<video controls autoplay loop src=${parseLink(document)} style="overflow: hidden; margin-left: 0; width: 100%; height: 100%;"/>`;
    $('#Video')
        .empty()
        .append(href);
}