///<reference path="typings/phantomjs.d.ts" />

import eva = require("./eventaggre");

export interface IHostMessage{

	on(eventName: string, handler: Function): string;
	off(id: string): void;

}

class HostMessage implements IHostMessage{

	private _eventAggregator: eva.IEventAggregator;
	private _handlers: {[index:string]: {handler: Function; eventName: string}} = {};
	private _counter = 0;

	constructor(private _page: WebPage){

		this._eventAggregator = eva.create(this._page, "onConsoleMessage");
		this._eventAggregator.on((message: string) => this._handleMessage(message));

	}

	private _handleMessage(message: string): void{
		var messageKey: string = message.substr(0, 12),
			evAndArg: string = message.substr(12),
			splitEvAndArg: string[],
			handlerKey: string,
			handler: {handler: Function; eventName: string},
			targetHandlers: Function[] = [],
			i: number, len: number, targetHandler: Function,
			argText: string,
			arg: any;

		if(messageKey !== "hostmessage." || !evAndArg){
			return;
		}
		splitEvAndArg = evAndArg.split(" ");

		if(!splitEvAndArg || !splitEvAndArg.length){
			return;
		}
		for(handlerKey in this._handlers){
			if(!this._handlers.hasOwnProperty(handlerKey)){
				continue;
			}
			handler = this._handlers[handlerKey];
			if(handler.eventName === splitEvAndArg[0]){
				targetHandlers.push(handler.handler);
			}
		}
		splitEvAndArg.shift();
		argText = splitEvAndArg.join("");
		
		if(argText){
			try{
				arg = JSON.parse(argText);
			}catch(e){}
		}


		for(i = 0, len = targetHandlers.length; i < len; i++){
			targetHandler = targetHandlers[i];
			targetHandler.call(this, arg);
		}
	}

	on(eventName: string, handler: Function): string {
		var id = (new Date()).getTime().toString() + (this._counter++).toString();
		this._handlers[id] = {
			handler: handler,
			eventName: eventName
		};
		return id;
	}

	off(id: string): void {
		this._handlers[id] = null;
		delete this._handlers[id];
	}
}

var handlers: {[index:string]: Function} = {};

export function create(page: WebPage): IHostMessage{

	return new HostMessage(page);

}