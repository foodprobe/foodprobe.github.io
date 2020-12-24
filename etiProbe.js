(function() {
  'use strict';

  class ETISensor {
    constructor() {
      this.device = null;
      this.server = null;
      this._characteristics = new Map();
    }
    connect() {
      let options = {
        acceptAllDevices: true,
        //optionalServices: ['45544942-4c55-4554-4845-524db87ad700']
      }

      return navigator.bluetooth.requestDevice(options)
      .then(device => {
        this.device = device;
        return device.gatt.connect();
      })
      .then(server => {
        this.server = server;
        return Promise.all([
          server.getPrimaryService('45544942-4c55-4554-4845-524db87ad700').then(service => {
            return Promise.all([
              this._cacheCharacteristic(service, '45544942-4c55-4554-4845-524db87ad701'),
            ])
          })
        ]);
      })
    }

    /* ETI Service */

    startNotificationsTempMeasurement() {
      return this._startNotifications('45544942-4c55-4554-4845-524db87ad701');
    }
    stopNotificationsTempMeasurement() {
      return this._stopNotifications('45544942-4c55-4554-4845-524db87ad701');
    }
    parseTemperature(value) {
      // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
      value = value.buffer ? value : new DataView(value);
      let result = {};

      result.temperature = value.getFloat32(0, true);

      return result;
    }

    getDevice() {
      return this.device;
    }

    /* Utils */


    _cacheCharacteristic(service, characteristicUuid) {
      return service.getCharacteristic(characteristicUuid)
      .then(characteristic => {
        this._characteristics.set(characteristicUuid, characteristic);
      });
    }
    _readCharacteristicValue(characteristicUuid) {
      let characteristic = this._characteristics.get(characteristicUuid);
      return characteristic.readValue()
      .then(value => {
        // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
        value = value.buffer ? value : new DataView(value);
        return value;
      });
    }
    _writeCharacteristicValue(characteristicUuid, value) {
      let characteristic = this._characteristics.get(characteristicUuid);
      return characteristic.writeValue(value);
    }
    _startNotifications(characteristicUuid) {
      let characteristic = this._characteristics.get(characteristicUuid);
      // Returns characteristic to set up characteristicvaluechanged event
      // handlers in the resolved promise.
      return characteristic.startNotifications()
      .then(() => characteristic);
    }
    _stopNotifications(characteristicUuid) {
      let characteristic = this._characteristics.get(characteristicUuid);
      // Returns characteristic to remove characteristicvaluechanged event
      // handlers in the resolved promise.
      return characteristic.stopNotifications()
      .then(() => characteristic);
    }
  }

  window.ETISensor = new ETISensor();

})();
