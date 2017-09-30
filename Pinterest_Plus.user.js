// ==UserScript==
// @name        Pinterest Plus
// @namespace   https://greasyfork.org/users/102866
// @description Show full size + working middle click to open new tab
// @include     https://*.pinterest.com/*
// @include     https://*.pinterest.jp/*
// @include     https://*.pinterest.at/*
// @include     https://*.pinterest.ca/*
// @include     https://*.pinterest.ch/*
// @include     https://*.pinterest.co.uk/*
// @include     https://*.pinterest.com.mx/*
// @include     https://*.pinterest.de/*
// @include     https://*.pinterest.dk/*
// @include     https://*.pinterest.fr/*
// @include     https://*.pinterest.nz/*
// @include     https://*.pinterest.se/*
// @require     https://code.jquery.com/jquery-3.2.1.min.js
// @author      TiLied
// @version     0.1.12
// @grant       GM_openInTab
// @grant       GM_listValues
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// ==/UserScript==

var whatPage = 0,
	fullSize = false,
	oriMaxWidthOne,
	oriMaxWidthTwo,
	oriHeight;

const oneSecond = 1000;

//prefs
var pFullSize;

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
	console.log("Pinterest Plus v" + GM_info.script.version + " initialization");
	//Middle click
	document.addEventListener("click", function (e) { e.button === 1 && e.stopPropagation(); }, true);
	//Url handler for changing(If you don't like tabs)
	UrlHandler();
	//Place CSS in head
	SetCSS();
	//Set settings or create
	SetSettings();
	//Check on what page we are and switch. Currently only on pin page
	SwitchPage();
	console.log("Page number: " + whatPage + "/" + Page[whatPage] + " page");
}();

function SetCSS()
{
	$("head").append($("<!--Start of Pinterest Plus v" + GM_info.script.version + " CSS-->"));

	$("head").append($("<style type=text/css></style>").text("button.ppTrue \
	{                                         \
		border:2px solid black!important;     \
	}                                         \
	"));

	$("head").append($("<!--End of Pinterest Plus v" + GM_info.script.version + " CSS-->"));
}

function SetSettings()
{
	//THIS IS ABOUT pFullSize
	if (HasValue("ppFullSize", false))
	{
		pFullSize = GM_getValue("ppFullSize");
	}

	//Console log prefs with value
	console.log("*prefs:");
	console.log("*-----*");
	var vals = [];

	//Find out that var in for block is not local... Seriously js?
	for (let i = 0; i < GM_listValues().length; i++)
	{
		vals[i] = GM_listValues()[i];
	}
	for (let i = 0; i < vals.length; i++)
	{
		console.log("*" + vals[i] + ":" + GM_getValue(vals[i]));
	}
	console.log("*-----*");
}

//Check if value exists or not.  optValue = Optional
function HasValue(nameVal, optValue)
{
	var vals = [];
	for (let i = 0; i < GM_listValues().length; i++)
	{
		vals[i] = GM_listValues()[i];
	}

	if (vals.length === 0)
	{
		if (optValue !== undefined)
		{
			GM_setValue(nameVal, optValue);
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
		GM_setValue(nameVal, optValue);
		return true;
	} else
	{
		return false;
	}
}

//Delete Values
function DeleteValues(nameVal)
{
	var vals = [];
	for (let i = 0; i < GM_listValues().length; i++)
	{
		vals[i] = GM_listValues()[i];
	}

	if (vals.length === 0 || typeof nameVal !== "string")
	{
		return;
	}

	switch (nameVal)
	{
		case "all":
			for (let i = 0; i < vals.length; i++)
			{
				GM_deleteValue(vals[i]);
			}
			break;
		case "old":
			for (let i = 0; i < vals.length; i++)
			{
				if (vals[i] === "debug" || vals[i] === "debugA")
				{
					GM_deleteValue(vals[i]);
				}
			}
			break;
		default:
			for (let i = 0; i < vals.length; i++)
			{
				if (vals[i] === nameVal)
				{
					GM_deleteValue(nameVal);
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
	} else if (url.match(/https:\/\/([a-z]+\.|[a-z-]+\.|)pinterest\.(com|jp|at|ca|ch|co\.uk|com\.mx|de|dk|fr|nz|se)\/search/i))
	{
		whatPage = 2;
	} else if (url.match(/https:\/\/([a-z]+\.|[a-z-]+\.|)pinterest\.(com|jp|at|ca|ch|co\.uk|com\.mx|de|dk|fr|nz|se)\/pin/i))
	{
		whatPage = 3;
	} else if (url.match(/https:\/\/([a-z]+\.|[a-z-]+\.|)pinterest\.(com|jp|at|ca|ch|co\.uk|com\.mx|de|dk|fr|nz|se)\/topics/i))
	{
		whatPage = 4;
	} else if (url.match(/https:\/\/([a-z]+\.|[a-z-]+\.|)pinterest\.(com|jp|at|ca|ch|co\.uk|com\.mx|de|dk|fr|nz|se)\/news_hub/i))
	{
		whatPage = 5;
	} else if (url.match(/https:\/\/([a-z]+\.|[a-z-]+\.|)pinterest\.(com|jp|at|ca|ch|co\.uk|com\.mx|de|dk|fr|nz|se)\/categories/i))
	{
		whatPage = 6;
	} else
	{
		whatPage = 10;
	}
	return whatPage;
}

//UI SETTING "Full size"
function SetUpForPin()
{
	var buttonDiv = document.createElement("div");
	var buttonButton = document.createElement("button");
	var buttonText = document.createTextNode("Full size");
	var parentDiv = document.querySelector("div.flex.justify-between div");
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

	setTimeout(function ()
	{
		SetEventButton(buttonButton, GetFullSizeURL(document.querySelectorAll("a.imageLink img[alt]")));
		if (pFullSize)
		{
			ChangeSource(GetFullSizeURL(document.querySelectorAll("a.imageLink img[alt]")), document.querySelectorAll("a.imageLink img[alt]"));
			ChangeImgTags(GetFullSizeURL(document.querySelectorAll("a.imageLink img[alt]")), document.querySelectorAll("a.imageLink img[alt]"));
		}
	}, oneSecond);
}

function SetEventButton(btn, url)
{
	$(btn).on('mousedown', function (e)
	{
		if ((e.which === 3))
		{
			if (pFullSize)
			{
				GM_setValue("ppFullSize", false);
				$(btn).removeClass("ppTrue");
				pFullSize = GM_getValue("ppFullSize");
			} else
			{
				GM_setValue("ppFullSize", true);
				$(btn).addClass("ppTrue");
				pFullSize = GM_getValue("ppFullSize");
			}
			console.log("right");
		}
		if ((e.which === 1))
		{
			if (fullSize)
			{
				ChangeTagsBack();
			} else
			{
				ChangeSource(GetFullSizeURL(document.querySelectorAll("a.imageLink img[alt]")), document.querySelectorAll("a.imageLink img[alt]"));
				ChangeImgTags(GetFullSizeURL(document.querySelectorAll("a.imageLink img[alt]")), document.querySelectorAll("a.imageLink img[alt]"));
			}
			console.log("left");
		}
		if ((e.which === 2))
		{
			GM_openInTab(url);
			console.log("middle");
		}
		e.preventDefault();
	});
}

function GetFullSizeURL(img)
{
	var src = img[0].currentSrc;
	src = src.replace(/[0-9]+x/, "originals");
	return src;
}

function ChangeSource(irl, img)
{
	for (let i = 0; i < img.length; i++)
	{
		img[i].src = irl;
	}
}

function ChangeImgTags(irl, img)
{
	var imgw = new Image();
	imgw.onload = function () {
		var closeUp = document.querySelector("div.closeupContainer");
		var imageLink = document.querySelector("a.imageLink");
		var footer = $(imageLink).parent();
		var mWidth = this.width + 64;
		oriMaxWidthOne = closeUp.style.maxWidth;
		closeUp.style.maxWidth = mWidth + "px";
		oriMaxWidthTwo = imageLink.childNodes[0].style.maxWidth;
		oriHeight = $(imageLink.childNodes[0]).height();
		imageLink.childNodes[0].style.maxWidth = "none";
		$(imageLink.childNodes[0]).height("auto");
		footer.next().css("margin-top", 50);
	};
	imgw.src = irl;
	fullSize = true;
}

function ChangeTagsBack()
{
	var closeUp = document.querySelector("div.closeupContainer");
	var imageLink = document.querySelector("a.imageLink");
	var footer = $(imageLink).parent();
	closeUp.style.maxWidth = oriMaxWidthOne;
	imageLink.childNodes[0].style.maxWidth = oriMaxWidthTwo;
	$(imageLink.childNodes[0]).height(oriHeight);
	footer.next().css("margin-top", 0);
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