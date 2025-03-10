﻿using CSharpToJavaScript.APIs.JS;
using static CSharpToJavaScript.APIs.JS.GlobalObject;
using System.Text.Json;

using Object = CSharpToJavaScript.APIs.JS.Object;
using System.Collections.Generic;
using System;
using System.Threading.Tasks;
using System.Reflection.PortableExecutable;
using System.Net.NetworkInformation;

namespace Pinterest_Plus;

public class PinterestPlus
{
	public static PinterestPlus FirstInstance;

	private List<string> _Urls = new();
	private bool _BtnOn = false;

	private string _OldHash = "";
	private long _Check = 0;

	static PinterestPlus() 
	{
		FirstInstance = new PinterestPlus();
	}

	public PinterestPlus() 
	{
		Console.WriteLine("Pinterest Plus v" + GM.Info.Script.Version + " initialization");
		
		_SetCSS();
		_FirstTime();
	}

	private void _SetCSS()
	{
		(GlobalThis.Window.Document.Head as ParentNode).Append("<!--Start of Pinterest Plus v" + GM.Info.Script.Version + " CSS-->");

		GlobalThis.Window.Document.Head.InsertAdjacentHTML("beforeend", "<style type='text/css'> button.ppTrue"+
		"{"+
		"border: 2px solid black!important;"+
		"}</ style >");

		GlobalThis.Window.Document.Head.InsertAdjacentHTML("beforeend", "<style type='text/css'> button.ppTrue"+
		"{"+
			"border: 2px solid black!important;"+
		"}</style>");

		GlobalThis.Window.Document.Head.InsertAdjacentHTML("beforeend", "<style type='text/css'> button.ppTrue"+
	"{"+
		"border: 2px solid black!important;"+
		"}</style>");

		GlobalThis.Window.Document.Head.InsertAdjacentHTML("beforeend", "<style type='text/css' >#myBtn"+
	"{"+
		"pointer-events: auto; !important;"+
		"display: inherit; " +
		"align-items: center; "+
		"box-sizing: border - box; "+
		"color:#fff;"+
		"font-size: 16px; "+
		"font-weight: 700; "+
		"letter-spacing: -.4px; "+
		"margin-top: -4px; "+
		"border-style: solid; "+
		"border-width: 0px; "+
		"background-color: #e60023;"+
		"border-radius: 24px; "+
		"padding: 10px 14px; "+
		"will-change: transform; "+
		"margin-left: 8px; "+
	"}</style>");

		GlobalThis.Window.Document.Head.InsertAdjacentHTML("beforeend", "<style type='text/css'>#myBtn:hover"+
	"{"+
		"background - color: #ad081b;"+
	"}</ style >");

		GlobalThis.Window.Document.Head.InsertAdjacentHTML("beforeend", "<style type='text/css'>#pp_divFullSize"+
	"{"+
		"z-index: 500; !important;"+
		"justify-content: center;"+
		"display: grid;"+
	"}</ style >");

		(GlobalThis.Window.Document.Head as ParentNode).Append("<!--End of Pinterest Plus v" + GM.Info.Script.Version + " CSS-->");

	}

	private async void _FirstTime()
	{
		if (await HasValueGM("ppFullSize", false))
		{
			_BtnOn = await GM.GetValue("ppFullSize");
		}

		//Console log prefs with value
		Console.WriteLine("*prefs:");
		Console.WriteLine("*-----*");

		List<dynamic> vals = await GM.ListValues();

		for (int i = 0; i < vals.Count; i++)
		{
			Console.WriteLine("*" + vals[i] + ":" + await GM.GetValue(vals[i]));
		}
		Console.WriteLine("*-----*");
	}

	public void Main()
	{
		if (!GlobalThis.Window.Document.Location.Pathname.StartsWith("/pin/"))
		{
			UrlHandler();
			return;
		}

		Element buttonDiv = GlobalThis.Window.Document.CreateElement("div");
		Element buttonButton = GlobalThis.Window.Document.CreateElement("button");
		Text buttonText = GlobalThis.Window.Document.CreateTextNode("Full Size");
		
		
		
		Element? parentDiv;
		Element? shareButtonParent = (GlobalThis.Window.Document as ParentNode).QuerySelector("div[data-test-id='share-button']");
		
		if (shareButtonParent != null)
		{
			parentDiv = shareButtonParent.ParentElement;
		}
		else
		{
			parentDiv = (GlobalThis.Window.Document as ParentNode).QuerySelector("div[data-test-id='closeupActionBar']>div>div," +
			"div[data-test-id='UnauthBestPinCardBodyContainer']>div>div>div," +
			"div.UnauthStoryPinCloseupBody__container>div>div," +
			"div[data-test-id='CloseupDetails']," +
			"div[data-test-id='CloseupMainPin']>div>div:last-child>div");
		}

		if (parentDiv == null)
		{
			GlobalThis.Console.Error("parentDiv:", parentDiv);
			return;
		}

		buttonButton.AppendChild(buttonText);
		buttonDiv.AppendChild(buttonButton);
		buttonButton.Id = "myBtn";

		parentDiv.AppendChild(buttonDiv);

		//
		//
		Element? queryCloseup = (GlobalThis.Window.Document as ParentNode).QuerySelector("div[data-test-id='CloseupMainPin'], div.reactCloseupScrollContainer");

		if (queryCloseup == null)
		{
			GlobalThis.Console.Error("div[data-test-id='pin']:first, div.reactCloseupScrollContainer:", queryCloseup);
			return;
		}

		HTMLElement? div = (GlobalThis.Window.Document as ParentNode).QuerySelector<HTMLElement>("#pp_divFullSize");

		if (div == null)
		{
			div = (HTMLElement?)GlobalThis.Window.Document.CreateElement("div");

			div.Id = "pp_divFullSize";

			(queryCloseup as ParentNode).Prepend(div);
		}

		(div as ElementCSSInlineStyle).Style.SetProperty("display", "none", "");

		if (_BtnOn)
		{
			buttonButton.ClassList.Add("ppTrue");

			(div as ElementCSSInlineStyle).Style.SetProperty("display", "grid", "");
		}

		Events(buttonButton);

		GetOrigRequest(buttonButton);

		UrlHandler();
	}

	private async void GetOrigRequest(Element btn)
	{
		float time = Date.Now();

		RegExp re = new("\\/(\\d+)\\/|pin\\/([\\w\\-]+)\\/?");
		string[] regU = re.Exec(GlobalThis.Window.Document.Location.Href);


		string id = regU[1];

		if (id == null)
			id = regU[2];

		if (id == null)
		{
			GlobalThis.Console.Error("id is undefined");

			GlobalThis.Console.Log("Trying without request.");
			GetOrigNoRequest(btn);

			return;
		}
		
		dynamic myHeaders = new Headers2();
		myHeaders.Append("X-Pinterest-PWS-Handler", "www/pin/[id].js");
		
		dynamic init = new {};
		init.Method = "GET";
		init.Headers = myHeaders;

		string urlRec = "https://" + GlobalThis.Window.Document.Location.Host + "/resource/PinResource/get/?source_url=%2Fpin%2F" + id + "%2F&data=%7B%22options%22%3A%7B%22id%22%3A%22" + id + "%22%2C%22field_set_key%22%3A%22detailed%22%2C%22noCache%22%3Atrue%7D%2C%22context%22%3A%7B%7D%7D&_=" + time;

		Response res = await (GlobalThis.Window as WindowOrWorkerGlobalScope).Fetch(urlRec, init);

		if (res.Status != 200)
		{
			GlobalThis.Console.Error($"Request failed. Request: {res}");

			GlobalThis.Console.Log("Trying without request.");
			GetOrigNoRequest(btn);

			return;
		}

		dynamic json = await (res as Body).Json();
		dynamic r = await json;
		if (r["resource_response"]["status"] == "success")
		{
			Console.WriteLine(r["resource_response"]["data"]);

			var pin = r["resource_response"]["data"];

			if (pin["videos"] != null)
			{
				string[] k0 = Object.Keys(pin["videos"]["video_list"])[0];

				_Urls[0] = pin["videos"]["video_list"][k0]["url"];

				btn.SetAttribute("title", "" + pin["videos"]["video_list"][k0]["width"] + "px x " + pin["videos"]["video_list"][k0]["height"] + "px");

				return;
			}

			if (pin["story_pin_data"] != null)
			{
				var sp = pin["story_pin_data"]["pages"];

				for (int i = 0; i < sp.Count; i++)
				{
					if (_Urls[0] == null)
					{
						_Urls[0] = sp[i]["image"]["images"]["originals"]["url"];
						continue;
					}
					_Urls.Add(sp[i]["blocks"]["0"]["image"]["images"]["originals"]["url"]);
				}

				return;
			}

			_Urls[0] = pin["images"]["orig"]["url"];

			btn.SetAttribute("title", "" + pin["images"]["orig"]["width"] + "px x " + pin["images"]["orig"]["height"] + "px");

			if (_BtnOn)
				Show(_Urls[0]);

			return;
		}
		else
		{
			GlobalThis.Console.Error(r);
		}
	}

	private void GetOrigNoRequest(Element btn) 
	{
		RegExp re = new("\\/\\d+x\\/");

		NodeList imgs = (GlobalThis.Window.Document as ParentNode).QuerySelectorAll("img");
		
		GlobalThis.Console.Log(imgs);
		
		if (imgs.Length == 0)
		{
			GlobalThis.Console.Error("Query 'img' is null!");
			return;
		}

		HTMLImageElement img =(imgs[0] as HTMLImageElement);

		string scr = img.Src;

		string[] match = re.Exec(scr);
		if (match.Length == 0)
		{
			GlobalThis.Console.Error($"No match. Url: {scr}");
			return;
		}

		scr = scr.Replace(match[0], "/originals/");

		if (_Urls[0] == null)
			_Urls.Add(scr);
		else
			_Urls[0] = scr;

		if (_BtnOn)
			Show(_Urls[0]);
	}

	private void Events(Element btn)
	{
		btn.AddEventListener("mousedown", (MouseEvent e) =>
		{
			if (e.Button == 2)
			{
				if (_BtnOn)
				{
					GM.SetValue("ppFullSize", false);
					btn.ClassList.Remove("ppTrue");
					_BtnOn = false;
				}
				else
				{
					GM.SetValue("ppFullSize", true);
					btn.ClassList.Add("ppTrue");
					_BtnOn = true;
				}

				//console.log("right");
			}
			if (e.Button == 0)
			{
				Show(_Urls[0]);

				HTMLElement? _div = (GlobalThis.Window.Document as ParentNode).QuerySelector<HTMLElement>("#pp_divFullSize");

				if ((_div as ElementCSSInlineStyle).Style.GetPropertyValue("display") == "none")
					(_div as ElementCSSInlineStyle).Style.SetProperty("display", "grid", "");
				else
					(_div as ElementCSSInlineStyle).Style.SetProperty("display", "none", "");

				//console.log("left");
			}
			if (e.Button == 1)
			{
				for (int i = 0; i < _Urls.Count; i++)
				{
					if (_Urls[i] != null)
						GM.OpenInTab(_Urls[i]);
				}

				//console.log("middle");
			}

			e.PreventDefault();
		}, false);
	}

	private void Show(string url)
	{
		Element? img = (GlobalThis.Window.Document as ParentNode).QuerySelector("#pp_img");

		if (img != null)
		{
			img.SetAttribute("src", url);
		}
		else
		{
			img = GlobalThis.Window.Document.CreateElement("img");

			img.Id = "pp_img";
			img.SetAttribute("src", url);

			Element? _div = (GlobalThis.Window.Document as ParentNode).QuerySelector("#pp_divFullSize");
			(_div as ParentNode).Prepend(img);
		}
	}

	//Handler for url
	private void UrlHandler()
	{
		_OldHash = GlobalThis.Window.Location.Pathname;

		PinterestPlus that = this;
		Action detect = () =>
		{
			if (that._OldHash != GlobalThis.Window.Location.Pathname)
			{
				that._OldHash = GlobalThis.Window.Location.Pathname;
				(GlobalThis.Window as WindowOrWorkerGlobalScope).SetTimeout(() => 
				{ 
					Main();
				}, 1500);
			}
		};

		_Check = (GlobalThis.Window as WindowOrWorkerGlobalScope).SetInterval(() =>
		{
			detect();
		}, 250);
	}

	//Start
	//async Methods/Functions GM_VALUE
	private async Task<bool> HasValueGM(string nameVal, dynamic optValue)
	{
		List<dynamic> vals = await GM.ListValues();

		if (vals.Count == 0)
		{
			if (optValue != null)
			{
				GM.SetValue(nameVal, optValue);
				return true;
			}
			else
			{
				return false;
			}
		}

		for (int i = 0; i < vals.Count; i++)
		{
			if (vals[i] == nameVal)
			{
				return true;
			}
		}

		if (optValue != null)
		{
			GM.SetValue(nameVal, optValue);
			return true;
		}
		else
		{
			return false;
		}
	}
	//async Methods/Functions GM_VALUE
	//End
}
