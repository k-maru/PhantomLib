///<reference path="typings/phantomjs.d.ts" />

interface IAggregationHandler{
	name: string;
	aggregator: EventAggregator;
}

export interface IEventAggregator {

	on(handler: Function): string;
	off(id: string): void;

	defaultHandler: Function;
}

class EventAggregator implements IEventAggregator{

	private _handlers: {[index: string]: Function} = {};
	private _counter = 0;

	public defaultHandler: Function;

	public on(handler: Function): string{
		var id = (new Date()).getTime().toString() + (this._counter++).toString();
		this._handlers[id] = handler;
		return id;
	}

	public execute(context, args){
		var id: string, handler: Function;
		for(id in this._handlers){
			if(!this._handlers.hasOwnProperty(id)){
				continue;
			}
			handler = this._handlers[id];
			handler.apply(context, args);
		}
	}

	public off(id: string): void{
		this._handlers[id] = null;
		delete this._handlers[id];
	}

}

function retrieveOrCreateAggregator(obj: any, ev: string): IEventAggregator{
	var target = <IAggregationHandler>obj[ev];

	if(Object.prototype.toString.call(target) !== "[object Function]") {
		obj[ev] = createHandler();
		target = <IAggregationHandler>obj[ev];		
	}
	if(target.name === "eventAggregatorHandler" && target.aggregator instanceof EventAggregator){
		return target.aggregator;

	}else{
		obj[ev] = createHandler(<Function>obj[ev]);
		return (<IAggregationHandler>obj[ev]).aggregator;			
	}
	return null;
}

function createHandler(defaultFunction?: Function): Function {

	var aggregator = new EventAggregator(),
		func = function eventAggregatorHandler(){
			if(aggregator.defaultHandler){
				aggregator.defaultHandler.apply(this, arguments);	
			}
			aggregator.execute(this, arguments);
		},
		target = <IAggregationHandler><any>func;

	aggregator.defaultHandler = defaultFunction;
	target.aggregator = aggregator;
	return func;

}


export function create(target: any, ev: string): IEventAggregator{
	return retrieveOrCreateAggregator(target, ev);
}