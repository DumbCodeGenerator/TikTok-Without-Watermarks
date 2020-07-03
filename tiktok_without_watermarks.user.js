// ==UserScript==
// @name         TikTok Without Watermarks
// @icon         https://www.google.com/s2/favicons?domain=tiktok.com
// @homepage     https://github.com/DumbCodeGenerator/TikTok-Without-Watermarks
// @version      0.8
// @description  Меняет видосы на сайте ТикТока на видосы без вотермарки
// @author       DumbCodeGenerator
// @run-at       document-end
// @match        *://*.tiktok.com/*
// @grant        GM_xmlhttpRequest
// @connect      tiktokcdn.com
// ==/UserScript==

(function() {
    'use strict';
    const query = [];

    const observer = new MutationObserver(function(mutations) {
        const video = document.querySelector('video.video-player.horizontal');
        if(video == null) return;
        let link = video.src;
        if(!link.includes('/aweme/v1/play') && !query.includes(link)){
            query.push(link);
            GM_xmlhttpRequest({
                method: 'GET',
                url: link,
                headers: {'Range':'bytes=0-50000'},
                onload: function (response) {
                    const regex = /vid:(.{32})/;
                    const videoId = response.responseText.match(regex)[1];
                    const noWM = `https://api2-16-h2.musical.ly/aweme/v1/play/?video_id=${videoId}&vr_type=0&is_play_url=1&source=PackSourceEnum_PUBLISH&media_type=4&ratio=default&improve_bitrate=1`;
                    video.src = noWM;
                    if(video.paused){
                        video.play();
                    }
                    removeA(query, link);
                }
            })
        }
    });

    const config = { childList: true, subtree: true, characterData: true };

    observer.observe(document.getElementById('main'), config);
})();

function removeA(arr) {
    let what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
}
