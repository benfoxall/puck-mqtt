# puck-mqtt

a hacky BLE & MQTT forwarder.

**tl;dr You should use [EspruinoHub](https://github.com/espruino/EspruinoHub/).**

The difference with this:
* subscribe & publish arbitrary channels on the puck itself
* limited number of pucks can be connected at one time (depends on OS, maybe 6)
* likely to be disastrous for battery life

## Running

```bash
# find any connectable pucks around
puck-mqtt scan


# connect to a puck
puck-mqtt connect 123long0hash0no0dashes123
```

## Puck.js code

```js
// a list of topics to subscribe to
const MQTT_subs = [
  '/foo/bar',
  '/baz/foo',
  '/fez/#'
];

// helper function for publishing messages
function MQTT_publish(topic, message) {
  console.log("\n<~" + btoa(topic + ' ' + message) + "~>\n");
}

// (implement this) - a handler for incoming messages
function MQTT_handle(topic, message) {
  console.log("got a message!", message);
}


// publish events on button press
setWatch(function() {
  MQTT_publish('/puck/btn', 'pressed');
}, BTN, { repeat:true, edge:"rising", debounce:50 });
```

### How

This script creates a BLE UART connection to the puck and listens out for messages of a particular format `<~BASE64~>`.

Topic subscriptions are read on connect by running:

```js
;(this.MQTT_subs||[]).forEach(s => console.log('\n<~' + btoa(s) + '~>\n'));
```

Message handlers are called by injecting:

```js
;((fn, a, b)=>{ if(fn) fn(atob(a), atob(b)) })
(this.MQTT_handle, 'BASE64_ENCODED_TOPIC', 'BASE64_ENCODED_MESSAGE');
```

Each puck is connected to an individual mqtt connection.

### Resources

A lot of the connection logic comes via:

* https://github.com/espruino/EspruinoHub
* https://github.com/echox/bbowl
