# puck-mqtt

a hacky BLE to MQTT bridge

```bash
# find any connectable pucks around
puck-mqtt --scan


# connect to listed pucks
puck-mqtt abcde-123 abcde-124 abcde-125
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


// publishing events
setWatch(function() {
  MQTT_publish('/puck/btn', 'pressed');
}, BTN, { repeat:true, edge:"rising", debounce:50 });

```

### Resources

A lot of the connection logic comes via:

* https://github.com/espruino/EspruinoHub
* https://github.com/echox/bbowl
