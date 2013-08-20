///<reference path="typings/phantomjs.d.ts" />

declare var handlerFunc: (url:string, page:WebPage) => void;
declare var window: any;
declare var document: any;

export interface IPageNavigation{
	pageReady(url: RegExp, handler: typeof handlerFunc):void;

	transfer(url: string): void;
}

class PageNavigation implements IPageNavigation{

	private _pageReadyCallbackPool: {url: RegExp; handler: typeof handlerFunc}[] = [];

	constructor(private _page: WebPage){
		_page.onCallback = (e) => {

			setTimeout(() => {
				if(e && e.event === "DOMContentLoaded"){
					this.onPageReady(e.data.url);
				}
			}, 0);
			
		}
		_page.onInitialized = () => {
			this._page.evaluate(function(){
				document.addEventListener("DOMContentLoaded", function(){
					window.callPhantom({
						event: "DOMContentLoaded",
						data: {
							url: window.location.href
						}
					});
				}, false);
			});
		};
	}

	public pageReady(url: RegExp, handler: typeof handlerFunc):void{
		this._pageReadyCallbackPool.push({
			url: url,
			handler: handler
		});
	}

	private onPageReady(url: string): void{
		var i: number, l: number, 
			item: {url: RegExp; handler: typeof handlerFunc},
			func: typeof handlerFunc;

		for(i = 0, l = this._pageReadyCallbackPool.length; i < l; i++){
			item = this._pageReadyCallbackPool[i];
			if(item.url.test(url)){
				func = item.handler;
				break;
			}
		}

		if(func){
			func(url, this._page);
		}	
	}

	public transfer(url: string): void{
		this._page.evaluate(function(url){
		    window.location.href = url;
		}, url);
	}
}

export function create(page: WebPage): IPageNavigation{

	return new PageNavigation(page);

}
