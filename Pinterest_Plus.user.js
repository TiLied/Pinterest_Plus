// ==UserScript==
// @name        Pinterest Plus
// @namespace   https://greasyfork.org/users/102866
// @description Show full size + working middle click to open new tab + open original image.
// @include     https://*.pinterest.*/*
// @require     https://code.jquery.com/jquery-3.4.1.min.js
// @author      TiLied
// @version     0.5.03
// @grant       GM_openInTab
// @grant       GM_listValues
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @require     https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @grant       GM.openInTab
// @grant       GM.listValues
// @grant       GM.getValue
// @grant       GM.setValue
// @grant       GM.deleteValue
// ==/UserScript==

class Options
{
	constructor(debug)
	{
		this.debug = debug;
	}

	get Debug()
	{
		let v =
		{
			debug: this.debug
		};

		return v;
	}

	set Debug(obj)
	{
		this.debug = obj["debug"];
	}

	//Start
	//async Methods/Functions GM_VALUE
	async HasValueGM(nameVal, optValue)
	{
		var vals = await GM.listValues();

		if (vals.length === 0)
		{
			if (optValue !== undefined)
			{
				GM.setValue(nameVal, optValue);
				return true;
			} else
			{
				return false;
			}
		}

		if (typeof nameVal !== "string")
		{
			return alert("name of value: '" + nameVal + "' are not string");
		}

		for (let i = 0; i < vals.length; i++)
		{
			if (vals[i] === nameVal)
			{
				return true;
			}
		}

		if (optValue !== undefined)
		{
			GM.setValue(nameVal, optValue);
			return true;
		} else
		{
			return false;
		}
	}
	async DeleteValuesGM(nameVal)
	{
		var vals = await GM.listValues();

		if (vals.length === 0 || typeof nameVal !== "string")
		{
			return;
		}

		switch (nameVal)
		{
			case "all":
				for (let i = 0; i < vals.length; i++)
				{
					if (vals[i] !== "adm")
					{
						GM.deleteValue(vals[i]);
					}
				}
				break;
			case "old":
				for (let i = 0; i < vals.length; i++)
				{
					if (vals[i] === "debug" || vals[i] === "debugA")
					{
						GM.deleteValue(vals[i]);
					}
				}
				break;
			default:
				for (let i = 0; i < vals.length; i++)
				{
					if (vals[i] === nameVal)
					{
						GM.deleteValue(nameVal);
					}
				}
				break;
		}
	}
	async UpdateGM(what)
	{
		var gmVal;

		switch (what)
		{
			case "options":
				gmVal = JSON.stringify(options.values);
				GM.setValue("pp_options", gmVal);
				break;
			default:
				alert("class:Options.UpdateGM(" + what + "). default switch");
				break;
		}
	}
	//async Methods/Functions GM_VALUE
	//End
}

class Main extends Options
{
	_SetLocalVal()
	{
		this.whatPage = 0;
		this.fullSize = false;
		this.login = null;
		this.oldWay = false;
		this.oneSecond = 1000;
		this.deltaTime = 1500;
	}
	
	constructor(debug, pFullSize)
	{
		super(debug);
		this.pFullSize = pFullSize;
	}

	get getValues()
	{
		return this.Debug.push(this.pFullSize);
	}

	set setValues(obj)
	{
		this.debug = obj["debug"];
		this.pFullSize = obj["pFullSize"];
		console.log(obj);
	}

	_Main()
	{
		console.log("Pinterest Plus v" + GM.info.script.version + " initialization");
		this._SetLocalVal();
		//Middle click
		document.addEventListener("click", function (e) { e.button === 1 && e.stopPropagation(); }, true);
		//Url handler for changing(If you don't like tabs)
		this.UrlHandler();
		//Place CSS in head
		this.SetCSS();
		//Set settings or create
		this.SetSettings(function ()
		{
			//check login
			if (main.debug) console.log($("main[data-test-id='unauthPinPage']"));

			if ($("main[data-test-id='unauthPinPage']").length !== 0)
				main.login = false;
			else
				main.login = true;

			if (main.debug) console.log("login: " + main.login);
			//Check on what page we are and switch. Currently only on pin page
			main.SwitchPage();
			console.log("Page number: " + main.whatPage + "/" + Page[main.whatPage] + " page");
		});
	}

	SetCSS()
	{
		$("head").append($("<!--Start of Pinterest Plus v" + GM.info.script.version + " CSS-->"));

		$("head").append($("<style type=text/css></style>").text("button.ppTrue \
		{                                         \
			border:2px solid black!important;     \
		}                                         \
		"));

		$("head").append($("<style type=text/css></style>").text("#myBtn \
		{                                         \
			align-items: center;\
			box-sizing: border-box;\
			color:#fff;\
			font-size: 16px;\
			font-weight: 700;\
			letter-spacing: -.4px;\
			padding: 10px;\
			padding-top: 10px;\
			padding-right: 14px;\
			padding-left: 14px;\
			padding-bottom: 10px;\
			margin-top: -4px;\
			border-style: solid;\
			border-width: 0px;\
		}                                         \
		"));

		$("head").append($("<style type=text/css></style>").text("#pp_divFullSize \
		{                                         \
			z-index: 500;!important;     \
			justify-content: center;\
			display: flex;\
		}                                         \
		"));

		$("head").append($("<!--End of Pinterest Plus v" + GM.info.script.version + " CSS-->"));
	}

	async SetSettings(callBack)
	{
		//THIS IS ABOUT pFullSize
		if (this.HasValueGM("ppFullSize", false))
		{
			this.pFullSize = await GM.getValue("ppFullSize");
		}

		//Console log prefs with value
		console.log("*prefs:");
		console.log("*-----*");
		var vals = await GM.listValues();

		//Find out that var in for block is not local... Seriously js?
		for (let i = 0; i < vals.length; i++)
		{
			console.log("*" + vals[i] + ":" + await GM.getValue(vals[i]));
		}
		console.log("*-----*");

		callBack();
	}

	SwitchPage()
	{
		switch (this.GetPage(document.URL))
	{
			case 1:
				break;
			case 2:
				this.HidePopup();
				break;
			case 4:
			case 5:
			case 6:
			case 10:
				break;
			case 3:
				this.HidePopup();
				this.SetUpForPin();
				break;
			default:
				break;
		}
	}

	//On what page are we?
	GetPage(url)
	{
		/*
		1-front page
		2-search page
		3-pin page
		4-topics page
		5-news_hub page
		6-categories page
		10-board page
		*/
		const reg = new RegExp("https:\\/\\/([a-z]+\\.|[a-z-]+\\.|)pinterest\\.(com|jp|at|ca|ch|co\\.uk|com\\.mx|de|dk|fr|nz|se|com\\.au|ie|ru)");

		if (document.location.pathname === "/")
		{
			this.whatPage = 1;
		} else if (url.match(new RegExp(reg.source + "/search", "i")))
		{
			this.whatPage = 2;
		} else if (url.match(new RegExp(reg.source + "/pin", "i")))
		{
			this.whatPage = 3;
		} else if (url.match(new RegExp(reg.source + "/topics", "i")))
		{
			this.whatPage = 4;
		} else if (url.match(new RegExp(reg.source + "/news_hub", "i")))
		{
			this.whatPage = 5;
		} else if (url.match(new RegExp(reg.source + "/categories", "i")))
		{
			this.whatPage = 6;
		} else
		{
			this.whatPage = 10;
		}
		return this.whatPage;
	}

	//UI SETTING "Full size"
	SetUpForPin()
	{
		var buttonDiv = document.createElement("div");
		var buttonButton = document.createElement("button");
		var buttonText = document.createTextNode("Full size");
		var parentDiv = document.querySelector("div[data-test-id='closeupActionBar'] div div") || document.querySelector("div[data-test-id='pinHeader']");

		if (typeof parentDiv === "undefined" || parentDiv === null)
		{
			console.log("div[data-test-id='closeupActionBar'] div div or div[data-test-id='pinHeader']:");
			return console.log(parentDiv);
		}

		buttonButton.appendChild(buttonText);
		buttonDiv.appendChild(buttonButton);
		parentDiv.appendChild(buttonDiv);
		$(buttonDiv).addClass("items-center");

		if (this.login === true) $(buttonDiv).attr("style", "display: flex;");

		$(buttonButton).addClass("SaveButton SaveButton--enabled SaveButton__background--enabled SaveButton__background");
		$(buttonButton).attr("style", "padding: 10px 14px; will-change: transform; margin-left: 8px;");

		if (this.login === false)
		{
			$(buttonButton).addClass("red active");
			$(buttonButton).attr("style", "background-color: rgb(230, 0, 35); padding: 10px 14px; will-change: transform; margin-left: 8px; border-radius: 8px; max-height: inherit;");
		}
		$(buttonButton).attr("id", "myBtn");

		if (this.pFullSize)
		{
			$(buttonButton).addClass("ppTrue");
		}

		this.Core(buttonButton);
	}

	async Core(buttonButton)
	{
		if (!this.oldWay)
		{
			var regU = document.URL.match(/\/(\d+)\/|\/([A-Z].+\w+)\//);
			if (typeof regU === "undefined" || regU === null)
			{
				this.oldWay = true;
				return this.Core(buttonButton);
			}
			var id = regU[1];
			var arr = [];

			if (typeof id === "undefined")
				id = regU[2];
			else if (typeof id === "undefined") { this.oldWay = true; return this.Core(buttonButton); }

			var time = Date.now();

			var tld = window.location.origin.split('.').pop();
			if (window.location.origin.endsWith('.com.au') || window.location.origin.endsWith('.com.mx') || window.location.origin.endsWith('.co.uk'))
			{
				let a = window.location.origin.split('.');
				tld = a[a.length - 2] +"."+ a.pop();
			}
			if (main.debug) console.log(tld);

			var urlRec = "https://www.pinterest." + tld + "/resource/PinResource/get/?source_url=/pin/" + id + "/&data={%22options%22:{%22field_set_key%22:%22detailed%22,%22id%22:%22" + id + "%22},%22context%22:{}}&_=" + time;

			$.get(urlRec, async function (r)
			{
				if (r["resource_response"]["status"] === "success")
				{
					if (main.debug) console.log(r["resource_response"]["data"]);
					let pin = r["resource_response"]["data"];
					if (pin["is_video"] === false && pin["videos"] === null)
					{
						if (pin["carousel_data"] === null) 
						{
							arr.push(pin["images"]["orig"]["url"]);
							main.SetEventButton(buttonButton, arr);
							if (main.pFullSize)
							{
								main.ShowFullSize(pin["images"]["orig"]["url"]);
							}
							return $(buttonButton).attr("title", "" + pin["images"]["orig"]["width"] + "px x " + pin["images"]["orig"]["height"] + "px");
						} else
						{
							/*let urlF = await GetFullSizeURL(query);

							if (typeof urlF === "undefined" || urlF === null)
							{
								console.error("image full url:");
								return console.error(urlF);
							}

							SetEventButton(buttonButton, urlF);

							if (pFullSize)
							{
								//ChangeSource(urlF, query);
								ShowFullSize(urlF[0]);
							}*/
						}
					} else
					{
						return console.log("VIDEO!!!");
					}

				} else
				{
					main.oldWay = true;
					console.log(r);
					return main.Core(buttonButton);
				}
			}, "json")
				.fail(function (e)
				{
					main.oldWay = true;
					console.log(e);
					return main.Core(buttonButton);
				});

		} else
		{
			//TODO NEED BETTER SELECTION!
			//query = document.querySelectorAll("a[rel] img[alt]");
			var query = $("article").find("img");

			if (typeof query === "undefined" || query === null || query.length === 0)
				query = $("div.closeupLegoContainer").find("a:first").find("img");

			if (main.debug) console.log(query);

			if (typeof query === "undefined" || query === null || query.length === 0)
			{
				console.log("query:");
				return console.log(query);
			}

			let urlF = await this.GetFullSizeURL(query);

			if (typeof urlF === "undefined" || urlF === null)
			{
				console.log("image full url:");
				return console.log(urlF);
			}

			this.SetEventButton(buttonButton, urlF);

			if (this.pFullSize)
			{
				this.ShowFullSize(urlF[0]);
			}
		}
	}

	//Hide popup after scrolling
	HidePopup()
	{
		if (this.login)
			return;

		setTimeout(function ()
		{
			let button = $(" button[aria-label='close']");
			if (button.length >= 1)
				$(button).click();

			var popup = $(" div[data-test-id='giftWrap']:parent");
			if (main.debug)
			{
				console.log(popup);
				console.log(button);
			}
			$(popup).attr("style", "display:none;");
		}, this.deltaTime);
	}

	async SetEventButton(btn, url)
	{
		$(btn).on('mousedown', async function (e)
		{
			if ((e.which === 3))
			{
				if (main.pFullSize)
				{
					GM.setValue("ppFullSize", false);
					$(btn).removeClass("ppTrue");
					let obj = {
						debug: main.debug,
						pFullSize: await GM.getValue("ppFullSize")
					}
					main.setValues = obj;
				} else
				{
					GM.setValue("ppFullSize", true);
					$(btn).addClass("ppTrue");
					let obj = {
						debug: main.debug,
						pFullSize: await GM.getValue("ppFullSize")
					}
					main.setValues = obj;
				}
				console.log("right");
			}
			if ((e.which === 1))
			{
				if (main.fullSize)
				{
					main.ChangeTagsBack();
				} else
				{
					main.ShowFullSize(url[0]);
				}
				console.log("left");
			}
			if ((e.which === 2))
			{
				GM.openInTab(url[0]);
				console.log("middle");
			}
			e.preventDefault();
		});
	}

	ShowFullSize(url)
	{
		let img;

		var queryCloseup = $("main[data-test-id='unauthPinPage']").find("div[data-test-id='pin']:first");

		if (typeof queryCloseup === "undefined" || queryCloseup === null || queryCloseup.length === 0)
			queryCloseup = $("div.Closeup");

		var querycontainCloseup = $("div.containCloseup");

		if (typeof querycontainCloseup === "undefined" || querycontainCloseup === null || querycontainCloseup.length === 0)
			querycontainCloseup = $("div[data-test-id='pinHeader']");

		if ($("#pp_divFullSize").length === 0)
		{
			const div = $("<div id=pp_divFullSize></div>").html("");
			queryCloseup.prepend(div);
		}

		var querypp_divFullSize = $("#pp_divFullSize");

		if ($("#pp_img").attr('src') === url)
		{
			querycontainCloseup.css("padding-top", url.height + 100);
			querypp_divFullSize.show(500);
			return this.fullSize = true;
		}

		if ($("#pp_img").length !== 0)
		{
			$("#pp_img").attr('src', url);
			img = $("#pp_img");
		} else
		{
			img = $("<img id=pp_img src='" + url + "'></img>");
		}

		var queryImg = $(img);
		var maxWidth = queryCloseup.css("width");

		if (typeof maxWidth === "undefined" || maxWidth === null)
			return console.log("Max width error:" + maxWidth);

		querypp_divFullSize.prepend(img);

		querypp_divFullSize.hide();

		queryImg.css("width", url.width);
		queryImg.css("height", url.height);
		queryImg.css("max-width", maxWidth);

		querycontainCloseup.css("padding-top", url.height + 100);
		querypp_divFullSize.show(500);

		this.fullSize = true;
	}

	async GetFullSizeURL(img)
	{
		if (typeof img === "undefined" || img === null)
		{
			return console.log("image url not found:" + img);
		}

		var arr = [];

		for (let i = 0; i < img.length; i++)
		{
			let src = $(img)[i].currentSrc;
			let oldSrc = src;
			let endUrl = new RegExp(src.slice(src.length - 3));

			if (this.debug) console.log(endUrl);

			src = src.replace(/[0-9]+x/, "originals");

			if (this.debug) console.log(src);

			await new Promise(function (resolve)
			{
				$.get(src, function ()
				{
					resolve(arr.push(src));
				})
					.fail(function ()
					{
						src = src.replace(endUrl, "png");
						$.get(src, function ()
						{
							resolve(arr.push(src));
						})
							.fail(function ()
							{
								src = src.replace(/png/, "gif");
								$.get(src, function ()
								{
									resolve(arr.push(src));
								})
									.fail(function ()
									{
										src = src.replace(/gif/, "webp");
										$.get(src, function ()
										{
											resolve(arr.push(src));
										})
											.fail(function ()
											{
												if (main.debug) alert("this try diferent url = " + oldSrc);
												resolve(arr.push(oldSrc));
											});
									});
							});
					});
			});
		}
		return arr;
	}

	ChangeTagsBack()
	{
		$("div.containCloseup").css("padding-top", 0);
		$("#pp_divFullSize").hide(500);
		this.fullSize = false;
	}

	//Handler for url
	UrlHandler()
	{
		this.oldHash = window.location.pathname;
		this.Check;

		var that = this;
		var detect = function ()
		{
			if (that.oldHash !== window.location.pathname)
			{
				that.oldHash = window.location.pathname;
				setTimeout(function () { main.SwitchPage(); }, main.deltaTime);
			}
		};
		this.Check = setInterval(function () { detect(); }, 200);
	}
}

var main = new Main(false, false);

/**
* ENUM, BECAUSE WHY NOT ¯\_(ツ)_/¯
* SEE FUNCTION GetPage()
*/
var Page;
(function (Page)
{
	Page[Page["ErrorNothing"] = 0] = "ErrorNothing";
	Page[Page["front"] = 1] = "front";
	Page[Page["search"] = 2] = "search";
	Page[Page["pin"] = 3] = "pin";
	Page[Page["topics"] = 4] = "topics";
	Page[Page["news_hub"] = 5] = "news_hub";
	Page[Page["categories"] = 6] = "categories";
	Page[Page["ErrorNothing2"] = 7] = "ErrorNothing2";
	Page[Page["ErrorNothing3"] = 8] = "ErrorNothing3";
	Page[Page["ErrorNothing4"] = 9] = "ErrorNothing4";
	Page[Page["board"] = 10] = "board";
})(Page || (Page = {}));

$(window).on("load", function ()
{
	console.log(main);
	main._Main();
});