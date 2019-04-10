// ==UserScript==
// @name         TikTok Without Watermarks
// @homepage     https://github.com/DumbCodeGenerator/TikTok-Without-Watermarks
// @version      0.6
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
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if(mutation.addedNodes.length > 0) {
                    if(mutation.addedNodes[0].classList.contains('video-box') || mutation.addedNodes[0].classList.contains('ReactModal__Overlay')) {
                        $('.video-player-pc-video-proxy').remove();
                        $('.loading').remove();
                        $('div.info').css('width', '295px');
                        $('video').prop('controls', true)
                    }else if(mutation.addedNodes[0].classList.contains('paly-btn')){
                        $('.paly-btn').css('pointer-events', 'none')
                    }
                }
            });
        });

        const config = { childList: true, subtree: true };

        $(function () {
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
                    if(split.length < 3){
                        continue;
                    }
                    text = text.replace(urls, split[2].replace('watermark=1', 'watermark=0'));
                }
                response.text = text;
            }
        });
    }
})();

function parseLink(document){
    const docText = $(document).text();

    const regexp = /"play_addr":{"url_list":\[(.*?)},/;
    const result = docText.match(regexp)[1].split(',')[2];
    return decodeURIComponent(result);
}

function replaceShareVideo() {
    const link = window['__INIT_PROPS__']['/share/video/:id']['videoData']['itemInfos']['video']['urls'][2].replace('watermark=1', 'watermark=0');
    $('.video-player-pc-video-proxy').remove();
    $('.loading').remove();
    $('video').attr('src', link).prop('controls', true);
}

function replaceVmVideo(){
    const href = `<video controls autoplay loop src=${parseLink(document)} style="overflow: hidden; margin-left: 0; width: 100%; height: 100%;"/>`;
    $('#Video')
        .empty()
        .append(href);
}