using CSharpToJavaScript;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace AnkiWeb_Quiz
{
	internal class Program
	{
		static async Task Main(string[] args)
		{
			CSTOJSOptions opt = new()
			{
				AddSBInFront = new("// ==UserScript==\r\n" +
					"// @name	Pinterest Plus\r\n" +
					"// @namespace	https://greasyfork.org/users/102866\r\n" +
					"// @description	Show full size + open original image.\r\n" +
					"// @match     https://*.pinterest.com/*\r\n" +
					"// @match     https://*.pinterest.at/*\r\n" +
					"// @match     https://*.pinterest.ca/*\r\n" +
					"// @match     https://*.pinterest.ch/*\r\n" +
					"// @match     https://*.pinterest.cl/*\r\n" +
					"// @match     https://*.pinterest.co.kr/*\r\n" +
					"// @match     https://*.pinterest.co.uk/*\r\n" +
					"// @match     https://*.pinterest.com.au/*\r\n" +
					"// @match     https://*.pinterest.com.mx/*\r\n" +
					"// @match     https://*.pinterest.de/*\r\n" +
					"// @match     https://*.pinterest.dk/*\r\n" +
					"// @match     https://*.pinterest.es/*\r\n" +
					"// @match     https://*.pinterest.fr/*\r\n" +
					"// @match     https://*.pinterest.ie/*\r\n" +
					"// @match     https://*.pinterest.info/*\r\n" +
					"// @match     https://*.pinterest.it/*\r\n" +
					"// @match     https://*.pinterest.jp/*\r\n" +
					"// @match     https://*.pinterest.nz/*\r\n" +
					"// @match     https://*.pinterest.ph/*\r\n" +
					"// @match     https://*.pinterest.pt/*\r\n" +
					"// @match     https://*.pinterest.se/*\r\n" +
					"// @author	TiLied\r\n" +
					"// @version	0.7.01\r\n" +
					"// @grant	GM_openInTab\r\n" +
					"// @grant	GM_listValues\r\n" +
					"// @grant	GM_getValue\r\n" +
					"// @grant	GM_setValue\r\n" +
					"// @grant	GM_deleteValue\r\n" +
					"// @require	https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js\r\n" +
					"// @grant	GM.openInTab\r\n" +
					"// @grant	GM.listValues\r\n" +
					"// @grant	GM.getValue\r\n" +
					"// @grant	GM.setValue\r\n" +
					"// @grant	GM.deleteValue\r\n" +
					"// ==/UserScript==\r\n\r\n"),

				AddSBInEnd = new("\r\nwindow.onload = function ()\r\n" +
					"{\r\n" +
					"\tsetTimeout(() =>\r\n" +
					"\t{\r\n" +
					"\t\tPinterestPlus.FirstInstance.Main();\r\n" +
					"\t}, 1250);\r\n};"),

				CustomCSNamesToJS = new List<Tuple<string, string>>()
				{
					new Tuple<string, string>("Count", "length")
				},

				OutPutPath = "..\\..\\..\\..\\"			
			};

			CSTOJS cstojs = new(opt);
			await cstojs.GenerateOneAsync("..\\..\\..\\..\\Pinterest_Plus\\PinterestPlus.cs", "Pinterest_Plus.user.js");

			Console.ReadKey();
		}
	}
}