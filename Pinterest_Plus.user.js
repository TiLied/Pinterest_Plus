﻿// ==UserScript==
// @name        Pinterest Plus
// @namespace   https://greasyfork.org/users/102866
// @description Show full size + working middle click to open new tab
// @include     https://*.pinterest.*/*
// @require     https://code.jquery.com/jquery-3.2.1.min.js
// @author      TiLied
// @version     0.3.01
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

var whatPage = 0,
	fullSize = false,
	oriMaxWidthOne,
	oriMaxWidthTwo,
	oriHeight,
	oriWidth;

const oneSecond = 1000;

//prefs
var pFullSize,
	debug = false;

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

void function Main()
{
	console.log("Pinterest Plus v" + GM.info.script.version + " initialization");
	//Middle click
	document.addEventListener("click", function (e) { e.button === 1 && e.stopPropagation(); }, true);
	//Url handler for changing(If you don't like tabs)
	UrlHandler();
	//Place CSS in head
	SetCSS();
	//Set settings or create
	SetSettings(function ()
	{
		//Check on what page we are and switch. Currently only on pin page
		SwitchPage();
		console.log("Page number: " + whatPage + "/" + Page[whatPage] + " page");
	});
}();

function SetCSS()
{
	$("head").append($("<!--Start of Pinterest Plus v" + GM.info.script.version + " CSS-->"));

	$("head").append($("<style type=text/css></style>").text("button.ppTrue \
	{                                         \
		border:2px solid black!important;     \
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

async function SetSettings(callBack)
{
	//THIS IS ABOUT pFullSize
	if (HasValue("ppFullSize", false))
	{
		pFullSize = await GM.getValue("ppFullSize");
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

//Check if value exists or not.  optValue = Optional
async function HasValue(nameVal, optValue)
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

//Delete Values
async function DeleteValues(nameVal)
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
				GM.deleteValue(vals[i]);
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


function SwitchPage()
{
	switch (GetPage(document.URL))
{
		case 1:
			//Events("Thumbs");
			//Events("Scroll");
			break;
		case 2:
		case 4:
		case 5:
		case 6:
		case 10:
			break;
		case 3:
			SetUpForPin();
			break;
		default:
			break;
	}
}

//On what page are we?
function GetPage(url)
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
	if (document.location.pathname === "/")
	{
		whatPage = 1;
	} else if (url.match(/https:\/\/([a-z]+\.|[a-z-]+\.|)pinterest\.(com|jp|at|ca|ch|co\.uk|com\.mx|de|dk|fr|nz|se|com\.au|ie|ru)\/search/i))
	{
		whatPage = 2;
	} else if (url.match(/https:\/\/([a-z]+\.|[a-z-]+\.|)pinterest\.(com|jp|at|ca|ch|co\.uk|com\.mx|de|dk|fr|nz|se|com\.au|ie|ru)\/pin/i))
	{
		whatPage = 3;
	} else if (url.match(/https:\/\/([a-z]+\.|[a-z-]+\.|)pinterest\.(com|jp|at|ca|ch|co\.uk|com\.mx|de|dk|fr|nz|se|com\.au|ie|ru)\/topics/i))
	{
		whatPage = 4;
	} else if (url.match(/https:\/\/([a-z]+\.|[a-z-]+\.|)pinterest\.(com|jp|at|ca|ch|co\.uk|com\.mx|de|dk|fr|nz|se|com\.au|ie|ru)\/news_hub/i))
	{
		whatPage = 5;
	} else if (url.match(/https:\/\/([a-z]+\.|[a-z-]+\.|)pinterest\.(com|jp|at|ca|ch|co\.uk|com\.mx|de|dk|fr|nz|se|com\.au|ie|ru)\/categories/i))
	{
		whatPage = 6;
	} else
	{
		whatPage = 10;
	}
	return whatPage;
}

function Events(what)
{
	try
	{
		var event = function (e)
		{
			if ((e.which === 2))
			{
				var url = $(this).find(".pinLink").attr("href");
				if (debug) console.log($(this).find(".pinLink"));
				GM.openInTab(url);
				console.log("middle");
			}
			e.preventDefault();
		};

		setTimeout(function ()
		{
		switch (what)
		{
			case "Thumbs":
				if (debug) console.log($(".PinRep"));
				$(".PinRep").on("mousedown", event);
				break;
			case "Scroll":
				window.onscroll = function (ev)
				{
					if ((window.innerHeight + window.pageYOffset) >= document.getElementsByClassName("gridCentered").scrollHeight)
					{
						Events("DeleteThumbs");
						if (debug) console.log("SCROLL TRUE");
						Events("Thumbs");
					}
				};
				break;
			case "DeleteThumbs":
				$(".PinRep").off("mousedown", event);
				break;
			default:
				break;
		}
		}, oneSecond);
	} catch (e) { console.error(e); }
}

//UI SETTING "Full size"
async function SetUpForPin()
{
	try
	{
		setTimeout(async function ()
		{
			var buttonDiv = document.createElement("div");
			var buttonButton = document.createElement("button");
			var buttonText = document.createTextNode("Full size");
			var parentDiv = document.querySelector("div.sticky div div div");
			if (typeof parentDiv === "undefined" || parentDiv === null)
			{
				return console.error("div.sticky div div div:" + parentDiv);
			}

			buttonButton.appendChild(buttonText);
			buttonDiv.appendChild(buttonButton);
			parentDiv.appendChild(buttonDiv);
			$(buttonDiv).addClass("items-center");
			$(buttonDiv).attr("style", "display: flex;");
			$(buttonButton).addClass("isBrioFlat matchDenzel Button Module btn hasText rounded primary");
			$(buttonButton).attr("style", "font-size: 14px; will-change: transform; margin-left: 8px;");
			$(buttonButton).attr("id", "myBtn");

			if (pFullSize)
			{
				$(buttonButton).addClass("ppTrue");
			}

			var urlF = await GetFullSizeURL(document.querySelectorAll("a.imageLink img[alt]"));

			if (typeof urlF === "undefined" || urlF === null)
			{
				return console.error("image full url:" + urlF);
			}

			SetEventButton(buttonButton, urlF);

			if (pFullSize)
			{
				ChangeSource(urlF, document.querySelectorAll("a.imageLink img[alt]"));
				ShowFullSize(urlF);
			}
		}, oneSecond + 500);
	} catch (e) { console.error(e); }
}

async function SetEventButton(btn, url)
{
	$(btn).on('mousedown', async function (e)
	{
		if ((e.which === 3))
		{
			if (pFullSize)
			{
				GM.setValue("ppFullSize", false);
				$(btn).removeClass("ppTrue");
				pFullSize = await GM.getValue("ppFullSize");
			} else
			{
				GM.setValue("ppFullSize", true);
				$(btn).addClass("ppTrue");
				pFullSize = await GM.getValue("ppFullSize");
			}
			console.log("right");
		}
		if ((e.which === 1))
		{
			if (fullSize)
			{
				ChangeTagsBack(url);
			} else
			{
				ShowFullSize(url);
			}
			console.log("left");
		}
		if ((e.which === 2))
		{
			GM.openInTab(url);
			console.log("middle");
		}
		e.preventDefault();
	});
}

function ShowFullSize(url)
{
	try
	{
		if ($("#pp_divFullSize").length === 0)
		{
			const div = $("<div id=pp_divFullSize></div>").html("");
			$("div.Closeup").prepend(div);
		}

		if ($("#pp_img").attr('src') === url)
		{
			$("div.containCloseup").css("padding-top", url.height + 100);
			$("#pp_divFullSize").show(500);
			return fullSize = true;
		}

		var img = $("<img id=pp_img src='" + url + "'></img>");

		var maxWidth = $("div.Closeup").css("width");
		if (typeof maxWidth === "undefined" || maxWidth === null)
			return console.error("Max width error:" + maxWidth);

		$("#pp_divFullSize").prepend(img);

		$("#pp_divFullSize").hide();

		$(img).css("width", url.width);
		$(img).css("height", url.height);
		$(img).css("max-width", maxWidth);

		$("div.containCloseup").css("padding-top", url.height + 100);
		$("#pp_divFullSize").show(500);

		fullSize = true;
	} catch (e) { console.error(e); }
}
function GetFullSizeURL(img)
{
	if (debug) console.log(img);
	if (typeof img === "undefined" || img === null)
	{
		return console.error("image url not found:" + img);
	}

	var src = img[0].currentSrc;
	var oldSrc = src;
	src = src.replace(/[0-9]+x/, "originals");
	return new Promise(function (resolve)
	{
		$.get(src, function ()
		{
			resolve(src);
		})
			.fail(function ()
			{
				src = src.replace(/jpg/, "png");
				$.get(src, function ()
				{
					resolve(src);
				})
					.fail(function ()
					{
						resolve(oldSrc);
					});
			});
	});
}

function ChangeSource(irl, img)
{
	for (let i = 0; i < img.length; i++)
	{
		img[i].src = irl;
	}
}

function ChangeTagsBack()
{
	$("div.containCloseup").css("padding-top", 0);
	$("#pp_divFullSize").hide(500);
	fullSize = false;
}

//hHander for url
function UrlHandler()
{
	this.oldHash = window.location.pathname;
	this.Check;

	var that = this;
	var detect = function ()
	{
		if (that.oldHash !== window.location.pathname)
		{
			that.oldHash = window.location.pathname;
			setTimeout(function () { SwitchPage(); }, oneSecond);
		}
	};
	this.Check = setInterval(function () { detect(); }, 200);
}