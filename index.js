var FD = function () {
    //Regular expresion
    FD.prototype.regExps = {
      expVideo : /\.mp4\?|\.mp4$|\.flv\?|\.flv$|googlevideo\.com\/videoplayback\?|googlevideo\.com\/videoplayback$|\.3gp\?|\.3gp$|\.mov\?|\.mov$|\.avi\?|\.avi$|\.wmv\?|\.wmv$|\.webm\?|\.webm$|www(.*)uptobox\.com\/stream|content\-na\.drive\.amazonaws\.com\/cdproxy\/templink/,
      expSub : /\.srt\?|\.srt$|\.vtt\?|\.vtt$|zate\.tv\/files\/srt_encode\.php/
    };
    
    //urls
    FD.prototype.urls = {
      urlVideos : {},
      urlSub : {},
      urlCustom : {}
    };
    
    //get parameter querystring
    FD.prototype.getQuerystringVariable = function (variable, query) {
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] == variable) { 
              return pair[1];
            }
        }
        return (false);
    };

    //filter validate urls
    FD.prototype.validarUrl = function (details, regexp, type) {
        if(details.url.match(regexp)) {
            var u = details.url.split('?');
            if (u[0].match(regexp) && details.type != 'xmlhttprequest') {
                return details.url;
            }
        }
        return false;
    };
    
    //create popup url
    FD.prototype.createPopupUrl = function (tabid) {
      var url = 'popup.html?init=1';
      if (FD.prototype.urls.urlVideos[tabid] !== undefined) {
          url += '&urlsvideo=' + FD.prototype.urls.urlVideos[tabid];
      }
      if (FD.prototype.urls.urlSub[tabid] !== undefined) {
          url += '&urlssub=' + FD.prototype.urls.urlSub[tabid];
      }
      if (FD.prototype.urls.urlCustom[tabid] !== undefined) {
          url += '&urlcustom=' + FD.prototype.urls.urlCustom[tabid];
      }
      return url;
    };
    
    //create badge
    FD.prototype.createBadge = function(tabid){
      var cantBadgeSub = 0;
      var cantBadgeVideos = 0;
      var cantBadgeCustom = 0;
      var totalBadge = 0;
      var badge = {};
      if (FD.prototype.urls.urlVideos[tabid] !== undefined) {
          cantBadgeVideos += FD.prototype.urls.urlVideos[tabid].length;
      }
      if (FD.prototype.urls.urlSub[tabid] !== undefined) {
          cantBadgeSub += FD.prototype.urls.urlSub[tabid].length;
      }
      if (FD.prototype.urls.urlCustom[tabid] !== undefined) {
          cantBadgeCustom += FD.prototype.urls.urlCustom[tabid].length;
      }
      
      totalBadge = cantBadgeSub + cantBadgeVideos + cantBadgeCustom;
      if (totalBadge === 0) {
          badge.text = '';
      } else {
          badge.text = totalBadge.toString();
      }    
      badge.tabId = tabid;
      chrome.browserAction.setBadgeText(badge);
    };
    
    //web request listener
    FD.prototype.addWebRequestListener = function(){
      chrome.webRequest.onHeadersReceived.addListener(
        function (details) {
            var url = false;
            if (details.tabId > 0) {
              var popup = {};
              //is video
              if (false !== FD.prototype.validarUrl(details, FD.prototype.regExps.expVideo, 'video')) {
                  url = FD.prototype.validarUrl(details, FD.prototype.regExps.expVideo, 'video');
                  console.log(details);
                  if (!FD.prototype.urls.urlVideos.hasOwnProperty(details.tabId)) {
                      //urls array
                      FD.prototype.urls.urlVideos[details.tabId] = [];
                  }
                  //if dont exist
                  if (FD.prototype.urls.urlVideos[details.tabId].indexOf(encodeURIComponent(url)) == -1) {
                      //add url to array
                      FD.prototype.urls.urlVideos[details.tabId].push(encodeURIComponent(url));
                  }
                //object popup
                popup = {};
                popup.tabId = details.tabId;
                popup.popup = FD.prototype.createPopupUrl(details.tabId);
                FD.prototype.createBadge(details.tabId);
                chrome.browserAction.setPopup(popup);
                  
    
              }
              //is sub
              if (false !== FD.prototype.validarUrl(details, FD.prototype.regExps.expSub, 'sub')) {
                  url = FD.prototype.validarUrl(details, FD.prototype.regExps.expSub, 'sub');
                  if (!FD.prototype.urls.urlSub.hasOwnProperty(details.tabId)) {
                      //urls array
                      FD.prototype.urls.urlSub[details.tabId] = [];
                  }
                  //if dont exist
                  if (FD.prototype.urls.urlSub[details.tabId].indexOf(encodeURIComponent(url)) == -1) {
                      //add url to array
                      FD.prototype.urls.urlSub[details.tabId].push(encodeURIComponent(url));
                  }
                //object popup
                popup = {};
                popup.tabId = details.tabId;
                popup.popup = FD.prototype.createPopupUrl(details.tabId);
                FD.prototype.createBadge(details.tabId);
                chrome.browserAction.setPopup(popup);
              }
              //is custom
              chrome.storage.sync.get({
                  codeRegExp: ''
              }, function (items) {
                  if (items.codigo !== '') {
                      var customRegExp = new RegExp(items.codeRegExp, "i");
                    if (customRegExp !== undefined) {
                        if (false !== FD.prototype.validarUrl(details, customRegExp, 'custom')) {
                            if (!FD.prototype.urls.urlCustom.hasOwnProperty(details.tabId)) {
                                //urls array
                                FD.prototype.urls.urlCustom[details.tabId] = [];
                            }
                            //if dont exist
                            if (FD.prototype.urls.urlCustom[details.tabId].indexOf(encodeURIComponent(url)) == -1) {
                                //add url to array
                                FD.prototype.urls.urlCustom[details.tabId].push(encodeURIComponent(url));
                            }
                            //object popup
                            var popup = {};
                            popup.tabId = details.tabId;
                            popup.popup = FD.prototype.createPopupUrl(details.tabId);
                            FD.prototype.createBadge(details.tabId);
                            chrome.browserAction.setPopup(popup);
                        }
                    }
                  }
              });          
            }      
        },
        {urls: ["<all_urls>"]
      });
    };
    
    //add tab update listener
    FD.prototype.addTabUpdatedListener = function(){
      //reset urls
      chrome.tabs.onUpdated.addListener(function (tabid, changeinfo, tab) {
          FD.prototype.urls.urlSub[tabid] = [];
          FD.prototype.urls.urlVideos[tabid] = [];
          FD.prototype.createBadge(tabid);
      });
    };
};

var fd = new FD();
fd.addWebRequestListener();
fd.addTabUpdatedListener();



