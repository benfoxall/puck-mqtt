# puck-mqtt

a hacky BLE to MQTT bridge

```bash
# find any connectable pucks around
puck-mqtt --scan


# connect to listed pucks
puck-mqtt abcde-123 abcde-124 abcde-125
```

### Resources

A lot of the connection logic comes via:

* https://github.com/espruino/EspruinoHub
* https://github.com/echox/bbowl
