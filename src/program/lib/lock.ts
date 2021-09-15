// after lock you will get either locked value or final value
// suppose you are updating the value by interval or asynchronously,

// val = new Lock(0)                           <---- create value lock with initial value
// val.lock()                                  <---- you lock the value at 0
// -----after 100 msec------ 2
// -----after 200 msec------------- 4          <---- if you access value here it will return 0 (the locked value)
// -----after 300 msec-------------------- 6
// val.unlock()                                <---- if you access value here it will return 6

export class Lock<T> {
	private locked = false;
	private lockedValue: T;

	constructor(private _value: T) {
		this.lockedValue = _value;
	}

	get value() {
		if (this.locked) {
			return this.lockedValue;
		}

		return this._value;
	}

	set value(data: T) {
		this._value = data;
	}

	lock() {
		this.lockedValue = this._value;
		this.locked = true;
	}

	unlock() {
		this.locked = false;
	}
}
