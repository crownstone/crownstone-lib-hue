class IdGenerator {
  currentId: number

  constructor() {
    this.currentId = 0;
  }

  getId():number {
    return this.currentId++;
  }
}

const idGenerator = new IdGenerator();

export class EventBus {
  _subscriptions: {};
  _subscriptionIds: {};

  constructor() {
    this._subscriptions = {};
    this._subscriptionIds = {};
  }

  subscribe(topic: string, callback: (data: any) => void): EventUnsubscriber {
    if (!(topic)) {
      return;
    }
    if (!(callback)) {
      return;
    }
    let id = idGenerator.getId();

    if (this._subscriptions[topic] === undefined) {
      this._subscriptions[topic] = []
    }
    this._subscriptions[topic].push({id, callback});
    this._subscriptionIds[id] = true;


    // return unsubscribe function.
    return () => {
      if (this._subscriptions[topic] !== undefined) {
        // find id and delete
        for (let i = 0; i < this._subscriptions[topic].length; i++) {
          if (this._subscriptions[topic][i].id === id) {
            this._subscriptions[topic].splice(i, 1);
            break;
          }
        }

        // clear the ID
        this._subscriptionIds[id] = undefined;
        delete this._subscriptionIds[id];

        if (this._subscriptions[topic].length === 0) {
          delete this._subscriptions[topic];
        }
      }
    };
  }

  emit(topic: string, data: any): void {
    if (this._subscriptions[topic] !== undefined) {
      // Firing these elements can lead to a removal of a point in this._topics.
      // To ensure we do not cause a shift by deletion (thus skipping a callback) we first put them in a separate Array
      let fireElements = [];

      for (let i = 0; i < this._subscriptions[topic].length; i++) {
        fireElements.push(this._subscriptions[topic][i]);
      }

      for (let i = 0; i < fireElements.length; i++) {
        // this check makes sure that if a callback has been deleted, we do not fire it.
        if (this._subscriptionIds[fireElements[i].id] === true) {
          fireElements[i].callback(data);
        }
      }
    }

  }

  reset():void {
    this._subscriptions = {};
    this._subscriptionIds = {};
  }

}

export const eventBus = new EventBus()