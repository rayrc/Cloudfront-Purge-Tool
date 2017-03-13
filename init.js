/*
    Moving all existing inline js to this script
*/

  /* Track one pageview in Google Analytics every time the Chrome extension main screen is opened; and, track Events in GA when user does certain things */
  var _gaq=[['_setAccount','UA-26004955-1'],['_trackPageview']];(function(d,t){var g=d.createElement(t),s=d.getElementsByTagName(t)[0];g.src='https://ssl.google-analytics.com/ga.js';s.parentNode.insertBefore(g,s)}(document,'script'));


            function showRss() {
                var feed = new google.feeds.Feed("http://www.cdnplanet.com/blog/feed/");
                feed.load(function(result) {
                    if (!result.error) {
                        var container = document.getElementById("feed");
                        for (var i = 0; i < result.feed.entries.length; i++) {
                            var entry = result.feed.entries[i];
                            var div = document.createElement("div");
                            div.innerHTML += "<p><a target='_blank' href='" + entry.link + "'>" + entry.title + "</a></p>";
                            container.appendChild(div);
                        }
                    }
                });
            }

            function initLoader() {
                var p = document.createElement("script");
                p.src = "https://www.google.com/jsapi?key=ABQIAAAA5G2gXZmdQss3dIDbQV1KRRRE4Cjsdp205gIAOmTmnZiDinLSTxTm_ksescexqy51eJcCBjU1Vv9OFA&autoload={'modules':[{'name':'feeds','version':'1','callback':'showRss'}]}";       
                p.type = "text/javascript";
                var s = document.getElementsByTagName('script')[0];
                    s.parentNode.insertBefore(p, s);
            }
            initLoader();


function launchHelpWindow(){
  window.open('help.html','name','width=600,height=500');
}
function launchTBWindow(){
  window.open('turbobytes.html','name','width=600,height=500');
}
function launchHelpWindowLocalstorage(){
  window.open('help.html#localstorage','name','width=600,height=200');
  _gaq.push(["_trackEvent","Tools","CF Purge Tool","Save credentials boo",,!0])
}
document.getElementById("help").addEventListener("click",launchHelpWindow,false);
//document.getElementById("tb").addEventListener("click",launchTBWindow,false);
document.getElementById("ls").addEventListener("click",launchHelpWindowLocalstorage,false);

document.getElementById("signinbutton").addEventListener("click",auth,false);
document.getElementById("purgereqbtn").addEventListener("click",placepurgereq,false);
