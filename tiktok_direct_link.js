// ==UserScript==
// @name         TikTok Direct Link
// @homepage     https://github.com/DumbCodeGenerator/TikTok_Direct_Link
// @version      0.1
// @description  Меняет видосы на сайте ТикТока на видосы без вотермарки
// @author       DumbCodeGenerator
// @match        *://*.tiktok.com/*
// @require      http://code.jquery.com/jquery-latest.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const loc = location.href;
    if(loc.includes('/share/video/')){
        getShareLink()
    }else if(loc.includes('m.tiktok.com/v/')){
        jQuery.noConflict(true);
        getLink(true)
    }else{
        let observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if(mutation.addedNodes.length > 0 && location.href.includes('/share/video/')){
                    getLink(false)
                }
            });
        });

        // configuration of the observer:
        let config = { attributes: false, childList: true, characterData: false };

        // pass in the target node, as well as the observer options
        observer.observe(document.body, config);
    }
})();

function parseLink(document){
    const docText = $(document).text();

    const startIndex = docText.indexOf("play_addr") + 11;
    const length = (docText.lastIndexOf("},\"cover\"") + 1) - startIndex;
    const play_addr = docText.substr(startIndex, length);

    return JSON.parse(play_addr)['url_list'][2];
}

function getShareLink() {
    $('video').trigger('pause');
    const link = window.__INIT_PROPS__['/share/video/:id']['videoData']['itemInfos']['video']['urls'][2].replace('watermark=1', 'watermark=0');
    const href = `<video controls autoplay loop src=${link} class='video-player-pc'/>`;
    $('.video-player-pc').replaceWith(href)
}

function getLink(isVm){
    if(!isVm){
        $('video').trigger('pause');
        const url = location.href;
        const id = url.substr(url.lastIndexOf('/') + 1, 19);
        $.get(`https://m.tiktok.com/v/${id}.html`, function(data) {
            const href = `<video controls autoplay loop src=${parseLink(data)} class='video-player-pc'/>`;
            $('.video-player-pc').replaceWith(href)
        });
    }else{
        const href = `<video controls autoplay loop src=${parseLink(document)} style="overflow: hidden; margin-left: 0; width: 100%; height: 100%;"/>`;
        $('#Video')
            .empty()
            .append(href);
    }
}