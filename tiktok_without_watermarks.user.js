// ==UserScript==
// @name         TikTok Without Watermarks
// @icon         https://www.google.com/s2/favicons?domain=tiktok.com
// @homepage     https://github.com/DumbCodeGenerator/TikTok-Without-Watermarks
// @version      1.0
// @description  Меняет видосы на сайте ТикТока на видосы без вотермарки
// @author       DumbCodeGenerator
// @run-at       document-end
// @match        *://*.tiktok.com/*
// @require      https://cdn.jsdelivr.net/npm/file-saver@2.0.2/dist/FileSaver.min.js
// @grant        GM_xmlhttpRequest
// @connect      tiktokcdn.com
// @connect      byteicdn.com
// @connect      musical.ly
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
                    if(video.paused && document.hasFocus()){
                        video.play();
                    }
                    const button = createButton();
                    button.onclick = function(){
                        const username = document.querySelector('.user-username').textContent;
                        setText(button, "0%");
                        GM_xmlhttpRequest({
                            method: 'GET',
                            url: noWM,
                            responseType: 'blob',
                            headers: {'User-Agent': 'Tiktok'},
                            onprogress: function(evt){
                                var percentComplete = (evt.loaded / evt.total) * 100;
                                setText(button, percentComplete.toFixed(0) + "%");
                            },
                            onload: function(res){
                                const headers = res.responseHeaders;
                                const pattern = /content-type:\s*(.*?)$/mi
                                const type = headers.match(pattern)[1];
                                saveAs(res.response, username + "_" + videoId + '.mp4');
                                setText(button, "Готово!");
                            }
                        });
                    };
                    removeA(query, link);
                }
            })
        }
    });

    const config = { childList: true, subtree: true };

    observer.observe(document.getElementById('main'), config);
})();

function createButton(){
    const downButton = `<span id="dTiktok" class="jsx-624911782 action-wrapper" style="cursor: pointer;">
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALFQAACxUBgJnYgwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAELSURBVEiJ7dSxLkRBFMbx36wVEpViE4VieyFRSHQaIqHUqbQKlSjEM6i8gldQaSVkn0JCIbYWkWAUO8W67t47dlchnOQrztz5vv8tzhwxRnXCCl4R+7SW423IqxlMFM5mc4y5gKHrH/AHACHN+dcPIUzhSG8829grXLnCPV6wH2N8Lg2qeWDnPj+uMp1VZtQApnFTEX6NyaEBCTKHu5LwR8zX+jN30TKe+sLfsJ7lzbmUIDt4T4CTXN/AKRowWcdYwm7MNAYcYDv1lzHG02xi+U8cYiO1F00sYDMdPIwSnmqxL+/296+KHwc0C30rhLA6YmarCrCVNLZqoDvOwEJ16a3ijvqt+V110P4AuCuCK2lVqeIAAAAASUVORK5CYII="
style="margin-left: 10px;padding: 6px;vertical-align: middle;"/>Скачать</span>`
    let button = document.getElementById('dTiktok');
    if(button == null){
        const div = document.querySelector('div.action-left');
        div.insertAdjacentHTML('beforeend', downButton);
        return document.getElementById('dTiktok');
    }else{
        setText(button, 'Скачать');
        return button;
    }
}

function setText(button, text){
    button.lastChild.textContent = text;
}

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
