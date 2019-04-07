// ==UserScript==
// @name         TikTok Without Watermarks
// @homepage     https://github.com/DumbCodeGenerator/TikTok-Without-Watermarks
// @version      0.4
// @description  Меняет видосы на сайте ТикТока на видосы без вотермарки
// @author       DumbCodeGenerator
// @run-at       document-start
// @match        *://*.tiktok.com/*
// @require      http://code.jquery.com/jquery-latest.js
// @require      https://jpillora.com/xhook/dist/xhook.min.js
// @grant        none
// ==/UserScript==

let contextMenuIsHidden = true;

(function() {
    'use strict';
    const loc = location.href;

    $(window).on('click blur keyup mousewheel mousemove', function (e) {
        if(!contextMenuIsHidden && e.type !== 'keyup' && e.type !== 'mousemove' || e.type === 'keyup' && (e.key === 'Escape' || e.which === 70 || e.keyCode === 70)) {
            contextMenuIsHidden = true;
        }
    });

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
        // создаём экземпляр MutationObserver
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if(mutation.addedNodes.length > 0) {
                    if(mutation.addedNodes[0].classList.contains('video-box') || mutation.addedNodes[0].classList.contains('ReactModal__Overlay')) {
                        $('.video-player-pc-video-proxy').remove();
                        $('.loading').css('pointer-events', 'none');
                        $('video').on('click contextmenu', function (e) {
                            if(e.type === 'click' && contextMenuIsHidden) {
                                e.target.paused ? e.target.play() : e.target.pause();
                            }else if(e.type === 'contextmenu'){
                                contextMenuIsHidden = false
                            }
                        });
                    }else if(mutation.addedNodes[0].classList.contains('paly-btn')){
                        $('.paly-btn').css('pointer-events', 'none')
                    }
                }
            });
        });

        // конфигурация нашего observer:
        const config = { childList: true, subtree: true };

        $(function () {
            // передаём в качестве аргументов целевой элемент и его конфигурацию
            observer.observe($('.ReactModalPortal').get(0), config);
        });

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
    $('.video-player-pc-video-proxy').remove();
    $('.loading').css('pointer-events', 'none');
    $('video').attr('src', link).on('click contextmenu', function (e) {
        if(e.type === 'click' && contextMenuIsHidden) {
            e.target.paused ? e.target.play() : e.target.pause();
        }else {
            contextMenuIsHidden = false
        }
    });
}

function replaceVmVideo(){
    const href = `<video controls autoplay loop src=${parseLink(document)} style="overflow: hidden; margin-left: 0; width: 100%; height: 100%;"/>`;
    $('#Video')
        .empty()
        .append(href);
}