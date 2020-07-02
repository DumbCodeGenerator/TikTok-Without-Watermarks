// ==UserScript==
// @name         TikTok Without Watermarks
// @homepage     https://github.com/DumbCodeGenerator/TikTok-Without-Watermarks
// @version      0.7
// @description  Меняет видосы на сайте ТикТока на видосы без вотермарки
// @author       DumbCodeGenerator
// @run-at       document-end
// @match        *://*.tiktok.com/*
// @require      https://code.jquery.com/jquery-3.5.1.slim.min.js
// @grant        GM_xmlhttpRequest
// @connect      tiktokcdn.com
// ==/UserScript==

(function() {
    'use strict';
    const loc = location.href;
    const query = [];

    const observer = new MutationObserver(function(mutations) {
        const video = $('video.video-player.horizontal');
        if(video.length === 0) return;
        let link = video.attr('src');
        if(!link.includes('/aweme/v1/play') && !query.includes(link)){
            query.push(link);
            GM_xmlhttpRequest({
                method: 'GET',
                url: link,
                headers: {'Range':'bytes=12000-18000'},
                onload: function (response) {
                    const regex = /vid:(.{32})/;
                    const videoId = response.responseText.match(regex)[1];
                    const noWM = `https://api2-16-h2.musical.ly/aweme/v1/play/?video_id=${videoId}&vr_type=0&is_play_url=1&source=PackSourceEnum_PUBLISH&media_type=4&ratio=default&improve_bitrate=1`;
                    video.attr('src', noWM);
                    video.get(0).play();
                    removeA(query, link);
                }
            })
        }
    });

    const config = { childList: true, subtree: true };

    observer.observe($('#main').get(0), config);
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
