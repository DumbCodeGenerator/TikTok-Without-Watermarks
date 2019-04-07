// ==UserScript==
// @name         TikTok Without Watermarks
// @homepage     https://github.com/DumbCodeGenerator/TikTok-Without-Watermarks
// @version      0.2
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
        let videoArray = {};
        xhook.before(function (request) {
            const url = request.url;
            if(url.includes('/share/item/comment/list')){
                const id = url.slice(url.indexOf('=') + 1, url.indexOf('&'));
                const href = `<video controls autoplay loop src=${videoArray[id]} class='video-player-pc'/>`;
                $('.video-player-pc').replaceWith(href)
            }
        });
        xhook.after(function(request, response) {
            const url = request.url;
            if(url.includes('/share/item/list')) {
                const json = JSON.parse(response.data)['body']['itemListData'];
                for (let i=0; i<json.length; i++) {
                    const jsonValue = json[i];
                    const key = jsonValue['itemInfos']['id'];
                    videoArray[key] = jsonValue['itemInfos']['video']['urls'][2].replace('watermark=1', 'watermark=0')
                }
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
    $('video').trigger('pause');
    const link = window.__INIT_PROPS__['/share/video/:id']['videoData']['itemInfos']['video']['urls'][2].replace('watermark=1', 'watermark=0');
    const href = `<video controls autoplay loop src=${link} class='video-player-pc'/>`;
    $('.video-player-pc').replaceWith(href)
}

function replaceVmVideo(){
    const href = `<video controls autoplay loop src=${parseLink(document)} style="overflow: hidden; margin-left: 0; width: 100%; height: 100%;"/>`;
    $('#Video')
        .empty()
        .append(href);
}
