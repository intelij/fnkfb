;(function() {

    if(!window.__MicrosoftAdvertising)
        __MicrosoftAdvertising = {};
            
    if(!__MicrosoftAdvertising.loadScript) {
        __MicrosoftAdvertising.loadScript = function(url, callback) {
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.src = url;
            
            if (script.readyState) {
                script.onreadystatechange = function () {
                    if (script.readyState == "loaded" || script.readyState == "complete") {
                        script.onreadystatechange = null;
                        callback();
                    }
                };
            } else {
                script.onload = function () {
                    callback();
                };
            }
            document.getElementsByTagName("head")[0].appendChild(script);
        };
    }


    if(!__MicrosoftAdvertising.browser) {
        __MicrosoftAdvertising.browser = {
            currentUserAgent: window.navigator.userAgent,
            getType: function() {
                var userAgent = this.currentUserAgent;

                function isAolBrowser() {
                        var matches = userAgent.match(/ AOLBuild /);
                        return matches != null;
                }

                function isAvantBrowser() {
                        var matches = userAgent.match(/ Avant Browser /);
                        return matches != null;
                }

                function isLiveMessenger() {
                        var matches = userAgent.match(/ Windows Live Messenger /);
                        return matches != null;
                }

                function isFirefox() {
                    var matches = userAgent.match(/ Firefox\//i);
                    return matches != null;
                }
    
                function isSafari() {
                    if(isChrome())
                        return false;
                    var matches = userAgent.match(/ Safari\//i);
                    return matches != null;
                }

                function isChrome() {
                    var matches = userAgent.match(/ Chrome\//i);
                    return matches != null;
                }

                function isInternetExplorer() {
                    var matches = userAgent.match(/(MSIE|Microsoft Internet Explorer)[ \/]/i);
                    if(matches == null)
                        return false;
                    if(isAolBrowser() || isAvantBrowser() || isLiveMessenger())
                        return false;
                    return true;
                }
                
                if(isAolBrowser())
                    return this.types.aol;
                if(isAvantBrowser())
                    return this.types.avant;
                if(isLiveMessenger())
                    return this.types.liveMessenger;
                if(isFirefox())
                    return this.types.firefox;
                if(isSafari())
                    return this.types.safari;
                if(isChrome())
                    return this.types.chrome;
                if(isInternetExplorer())
                    return this.types.ie;
                return this.types.unknown;
            },
            types: {
                aol: {},
                avant: {},
                liveMessenger: {},
                firefox: {},
                safari: {},
                chrome: {},
                ie: {
                    getVersion: function() {
                        var matches = __MicrosoftAdvertising.browser.currentUserAgent.match(/.*(MSIE|Microsoft Internet Explorer)[ \/]([0-9]+)\.([0-9]+)/i);
                        return new Number(matches[2] + "." + matches[3]);
                    }
                },
                unknown: {}
            }

        };
    }



    if(!__MicrosoftAdvertising.Ad) {

        __MicrosoftAdvertising.Ad = function(properties,pluginDirectory) {
		    this.element = this.element.cloneNode(true);

			if(!properties) properties = {};
			
			if(properties.creativeElement)
				this.setCreativeElement(properties.creativeElement);
			__MicrosoftAdvertising.Ad.instances.push(this);

			this.placementId = properties.placementId;

            this.pluginDirectory = pluginDirectory;
			this.plugins = [];
        }
		__MicrosoftAdvertising.Ad.prototype.element = (function() {     
            var wrapNode = document.createElement('span');
            wrapNode.style.display = "inline-block";
            wrapNode.style.position = "relative";
            wrapNode.className = "**MicrosoftAdvertising_AdWrap**";
            return wrapNode;
        })();
        __MicrosoftAdvertising.Ad.prototype.plugins;
        __MicrosoftAdvertising.Ad.prototype.creative;
        __MicrosoftAdvertising.Ad.prototype.rootElement;
		__MicrosoftAdvertising.Ad.prototype.getElement = function() {
			return this.element;
		}
		__MicrosoftAdvertising.Ad.prototype.setCreativeElement = function(creativeElement) {
		    if(creativeElement.tagName.toLowerCase() == "a") {
                this.creative = new __MicrosoftAdvertising.Ad.ImageCreative(creativeElement);
            } else if(creativeElement.tagName.toLowerCase() == "object") {
                this.creative = new __MicrosoftAdvertising.Ad.FlashCreative(creativeElement);
            }
			this.wrapCreative();
		}
		__MicrosoftAdvertising.Ad.prototype.isLoaded = function() {
			return this.creativeElement && this.creativeElement.isLoaded();
		}
        __MicrosoftAdvertising.Ad.prototype.wrapCreative = function()
        {
            if(this.creative && this.browserIsSupported()) {
				if(this.creative.getElement().parentNode) {
					this.creative.getElement().parentNode.insertBefore(this.element,this.creative.getElement());
				}
                this.element.appendChild(this.creative.getElement());
            }
        }
		__MicrosoftAdvertising.Ad.prototype.getProperties = function() {
			var result = {
				rootElement: this.getElement(),
				placementId: this.placementId
			};
			if(this.creative) {
				result.rootCreativeElement = this.creative.getElement();
				result.activeCreativeElement = this.creative.getActiveElement();
			}
			return result;
		}
        __MicrosoftAdvertising.Ad.prototype.isLoaded = function()
        {        
            return true;
        }
        
        __MicrosoftAdvertising.Ad.prototype.browserIsSupported = function() {
            var browser = __MicrosoftAdvertising.browser.getType();
            var types = __MicrosoftAdvertising.browser.types;
            if((browser == types.ie && browser.getVersion() >= 7) || browser == types.firefox || browser == types.chrome || browser == types.safari) {
                return true;
            }
            return false;
        }
        __MicrosoftAdvertising.Ad.prototype.loadPlugin = function(pluginName) {

			this.plugins[pluginName] = {};

            if(this.browserIsSupported()) {

                var rootPath = this.pluginDirectory;
                var ad = this;

                function createInstance() {
					if(ad.plugins[pluginName] && __MicrosoftAdvertising.Ad.plugins[pluginName])
						ad.plugins[pluginName] = new __MicrosoftAdvertising.Ad.plugins[pluginName](ad,rootPath);
                }

                if(__MicrosoftAdvertising.Ad.plugins[pluginName]) {
                    createInstance();
                } else {
                    __MicrosoftAdvertising.loadScript(
                        this.pluginDirectory + pluginName + ".js",
                        createInstance
                    );
                }
            }

        }
		__MicrosoftAdvertising.Ad.prototype.removePlugin = function(pluginName) {
			if(this.plugins[pluginName] && this.plugins[pluginName].remove)
				this.plugins[pluginName].remove();
			delete this.plugins[pluginName];
		}




        __MicrosoftAdvertising.Ad.plugins = {};

		__MicrosoftAdvertising.Ad.instances = [];

		__MicrosoftAdvertising.Ad.get = function(creativeElement) {
			for(var i=0; i<this.instances.length; i++) {
				if(this.instances[i].rootCreativeElement == creativeElement)
					return this.instances[i];
			}
			return null;
		}

		__MicrosoftAdvertising.Ad.getByPlacementId = function(placementId) {
			for(var i=0; i<this.instances.length; i++) {
				var ad = this.instances[i];
				if(ad.getProperties().placementId == placementId) {
					return ad;
				}
			}
			return null;
		}





        __MicrosoftAdvertising.Ad.ImageCreative = function(anchorElement) {
            this.rootElement = anchorElement;
            this.creativeElement = anchorElement.getElementsByTagName("img")[0];
        }
        __MicrosoftAdvertising.Ad.ImageCreative.prototype.isLoaded = function() {
            return this.creativeElement.complete;
        }
		__MicrosoftAdvertising.Ad.ImageCreative.prototype.getElement = function() {
			return this.rootElement;
		}
		__MicrosoftAdvertising.Ad.ImageCreative.prototype.getActiveElement = function() {
			return this.creativeElement;
		}




        __MicrosoftAdvertising.Ad.FlashCreative = function(objectElement) {
            this.rootElement = objectElement;
            var embed;
            try {
                embed = objectElement.getElementsByTagName("embed")[0];
            } catch(e) {}
            var usingEmbed = false;
            if(embed) {
                try {
                    objectElement.PercentLoaded();
                } catch(e) {
                    usingEmbed = true;
                }
            }
            this.creativeElement = usingEmbed ? embed : objectElement;
        }
        __MicrosoftAdvertising.Ad.FlashCreative.prototype.ready = true;
        __MicrosoftAdvertising.Ad.FlashCreative.prototype.rebindFlashApi = function() {
            var parentNode = this.creativeElement.parentNode;
            if(parentNode) {
                this.ready = false;
                parentNode.removeChild(this.creativeElement);
                var flashCreative = this;
                window.setTimeout(
                    function() {
                        parentNode.appendChild(flashCreative.creativeElement);
                        flashAd.ready = true;
                    },
                    0
                );
            }
        }
        __MicrosoftAdvertising.Ad.FlashCreative.prototype.isLoaded = function() {
            if(this.ready) {
                try {                
                    if(this.creativeElement.PercentLoaded() >= 100)
					    return true;
                } catch(e) {
                    this.rebindFlashApi();
                }
            }
            return false;
        }
		__MicrosoftAdvertising.Ad.FlashCreative.prototype.getElement = function() {
			return this.rootElement;
		}
		__MicrosoftAdvertising.Ad.FlashCreative.prototype.getActiveElement = function() {
			return this.creativeElement;
		}




    }





 
})();
﻿;(function() {

    if(!window.__MicrosoftAdvertising)
        __MicrosoftAdvertising = {};

    if(!__MicrosoftAdvertising.Ad)
        __MicrosoftAdvertising.Ad = {
            plugins: {}
        };

    if(__MicrosoftAdvertising.Ad.plugins.AdChoices)
        return;

    function FullDisplayElement(rootPath) {
        var element = document.createElement('a');
        element.style.display = "block";
        element.style.height = this.constructor.pxHeight + "px";
        element.style.width = this.constructor.pxWidth + "px";
        element.target = "_blank";
        element.href = "http://g.msn.com/AIPRIV/EN-US?adchc=1";

        var img = document.createElement('img');
        img.style.borderWidth = 0;
        img.style.display = "block";
        img.src = rootPath + "AdChoices/CollisionAdMarker.png";
        element.appendChild(img);

        return element;
    }
    FullDisplayElement.pxHeight = 15;
    FullDisplayElement.pxWidth = 77;

    function LogoOnlyElement(rootPath) {
        var element = document.createElement('a');
        element.style.display = "block";
        element.style.height = this.constructor.pxHeight + "px";
        element.style.width = this.constructor.pxWidth + "px";
        element.target = "_blank";
        element.href = "http://g.msn.com/AIPRIV/EN-US?adchc=1";

        var img = document.createElement('img');
        img.style.borderWidth = 0;
        img.style.display = "block";
        img.src = rootPath + "AdChoices/IconOnlyCollisionMarker.png";
        element.appendChild(img);

        return element;
    }
    LogoOnlyElement.pxHeight = 15;
    LogoOnlyElement.pxWidth = 19;


    function AdChoicesPlugin(ad,rootPath) {
		this.ad = ad;
		this.element = this.element.cloneNode(true);
		ad.getElement().appendChild(this.element);

        var interval;

        var constructor = this.constructor;

		var adChoicesPlugin = this;

        function displayPlugin() {
            if(ad.isLoaded()) {
                clearInterval(interval);
                var adArea = ad.getElement().offsetHeight * ad.getElement().offsetWidth;
				var element;
                if(adArea >= constructor.minLargeAdArea)
                    element = new FullDisplayElement(rootPath);
                else if(adArea >= constructor.minAdArea)
                    element = new LogoOnlyElement(rootPath);
                if(element)
                    adChoicesPlugin.element.appendChild(element);
                else {
                    window.setTimeout(
                        displayPlugin,
                        1000
                    );
                }
            }
        }

        interval = setInterval(
            displayPlugin,
            100
        );

        displayPlugin();
    }

	AdChoicesPlugin.prototype.element = (function() {
		var element = document.createElement('span');
		element.className = '**MicrosoftAdvertising_AdChoicesPlugin**';
        element.style.position = "absolute";
        element.style.top = 0;
        element.style.right = 0;
        element.style.zIndex = 2147483647;
		return element;
	})();
    
	AdChoicesPlugin.prototype.remove = function() {
		if(this.element && this.element.parentNode)
			this.element.parentNode.removeChild(this.element);
	}

    AdChoicesPlugin.minLargeAdArea = 10 * FullDisplayElement.pxWidth * FullDisplayElement.pxHeight;
    AdChoicesPlugin.minAdArea = 10 * LogoOnlyElement.pxWidth * LogoOnlyElement.pxHeight;



    __MicrosoftAdvertising.Ad.plugins.AdChoices = AdChoicesPlugin;

})();

;(function() {

    if(!window.__MicrosoftAdvertising)
        window.__MicrosoftAdvertising = {};

    if(!__MicrosoftAdvertising.atlasNodeFinder) {
        __MicrosoftAdvertising.atlasNodeFinder = {
            findCreative: function() {
                var testNode = this.findAutoloadScript();
                while(testNode) {
                    if(testNode.nodeType == 1) {
                        if(testNode.tagName.toLowerCase() == "a" || testNode.tagName.toLowerCase() == "iframe" || testNode.tagName.toLowerCase() == "object") {
                            return testNode;
                        }
                    }
                    testNode = testNode.previousSibling;
                }
                return testNode;
            },
            findAutoloadScript: function() {
                var testNode = this.findLastDescendant(this.targetBody);
  
                while(testNode) {
                    if(testNode.nodeType == 1 && testNode.tagName.toLowerCase() == "script" && /Ad\.autoLoad\.js(\?.*)?$/.test(testNode.getAttribute("src"))) {
                        return testNode;
                    }
                    testNode = testNode.previousSibling;
                }
  
                return null;
            },
			isAtlasIframePlacement: function() {
				return /\/iview\/([a-zA-Z0-9]*\/)/.test(document.location.href);
			},
			findAtlasPlacementScript: function() {
                var testNode = this.findLastDescendant(this.targetBody);

                while(testNode) {
                    if(testNode.nodeType == 1 && testNode.tagName.toLowerCase() == "script" && /\/j?view\/([a-zA-Z0-9]*)\//.test(testNode.getAttribute("src"))) {
                        return testNode;
                    }
                    testNode = testNode.previousSibling;
                }
  
                return null;
			},
            findLastDescendant: function(node) {
                var child = node.lastChild;
                while(child && child.nodeType != 1) {
                    child = child.previousSibling;
                }
                if(child) {
                    var descendant = this.findLastDescendant(child);
                    if(descendant) {
                    return descendant;
                    } else {
                    return child;
                    }
                } else {
                    return null;
                }
            },
            targetBody: document.body
  
        };
    }

	if(!__MicrosoftAdvertising.ExistingAtlasIframeAd) {
		
		function ExistingAtlasIframeAd(rootCreativeElement,pluginDir) {
			var placementId;
			var matches = document.location.href.match(/\/i?view\/([a-zA-Z0-9]*)\//);
			if(matches) placementId = matches[1];

			var ad = new __MicrosoftAdvertising.Ad(
				{
					creativeElement: rootCreativeElement,
					placementId: placementId
				},
				pluginDir
			);
			return ad;
		}

		__MicrosoftAdvertising.ExistingAtlasIframeAd = ExistingAtlasIframeAd;
	}

	if(!__MicrosoftAdvertising.ExistingAtlasJavascriptAd) {
		function ExistingAtlasJavascriptAd(placementScript,rootCreativeElement,pluginDir) {
			var placementId;
			if(placementScript) {
				var matches = placementScript.src.match(/\/j?view\/([a-zA-Z0-9]*)\//);
				if(matches) placementId = matches[1];
			}

			var ad = new __MicrosoftAdvertising.Ad(
				{
					creativeElement: rootCreativeElement,
					placementId: placementId,
					placementScript: placementScript
				},
				pluginDir
			);
			return ad;
		}

		__MicrosoftAdvertising.ExistingAtlasJavascriptAd = ExistingAtlasJavascriptAd;
	}

    var autoloadScript = __MicrosoftAdvertising.atlasNodeFinder.findAutoloadScript();

    if(autoloadScript) {
	    
        var rootDir = (function() {
            var dir = autoloadScript.src.match(/^([^\?]*[\/\\])[^\/\\]*$/)[1];
            return dir;
        })();
		
        var plugins = (function() {
            var plugins = [];
            var query = autoloadScript.src.match(/^[^\?]*\?(.*)$/);
            if(query) {
                query = query[1];
                var variables = query.split("&");
                for(var i=0; i<variables.length; i++) {
                    var variable = variables[i].split("=");
                    if(variable[0] == "plugin")
                        plugins.push(variable[1]);
                }
            }
            return plugins;
        })();

        if(!__MicrosoftAdvertising.Ad) {
            var adScript = document.createElement('script');
            adScript.type = "text/javascript";
            adScript.src = rootDir + "Ad.js";
            document.getElementsByTagName('head')[0].appendChild(adScript);
        }
		
        var ad = null;
		
        var rootCreativeElement = __MicrosoftAdvertising.atlasNodeFinder.findCreative();

		var atlasPlacementScript = __MicrosoftAdvertising.atlasNodeFinder.findAtlasPlacementScript();

        var pluginLoaderInterval = window.setInterval(
            function() {
                if(__MicrosoftAdvertising.Ad && !ad) {
                    window.clearInterval(pluginLoaderInterval);
					if(__MicrosoftAdvertising.atlasNodeFinder.isAtlasIframePlacement()) {
						ad = new __MicrosoftAdvertising.ExistingAtlasIframeAd(
							rootCreativeElement,
							rootDir + "plugins/"
						);
					} else {
						ad = __MicrosoftAdvertising.ExistingAtlasJavascriptAd(
							atlasPlacementScript,
							rootCreativeElement,
							rootDir + "plugins/"
						);
					}
                    for(var i=0; i<plugins.length; i++) {
                        ad.loadPlugin(plugins[i]);
                    }
                }
            },
            100
        );

    }

})();