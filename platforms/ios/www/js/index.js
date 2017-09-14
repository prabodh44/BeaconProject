/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
        startMonitoringAndRanging();
        displayRegionEvents();
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();
//variable declarations

//an array of regions
var mRegions = [
            {
                id: 'ith-basement',
                uuid: 'f7826da6-4fa2-4e98-8024-bc5b71e08933',
                major: 28374,
                minor: 42469
            }
];
var mRegionStateNames = {
    'CLRegionStateInside' : 'Enter',
    'CLRegionStateOutside' : 'Exit'
};

var displayFlag = 0;
var jsonData;

//data related to the regions can be set here
var mRegionData = {
    'ith-basement' : 'ITH-basement data'
    //ith-basement is the id of the first region
}


function startMonitoringAndRanging() {
    console.log('started the function');
    
    
    function onDidDetermineStateForRegion (pluginResult) {
        console.log("did determine state for region "+ JSON.stringify(pluginResult));
        //alert('pluginResult.state ' + pluginResult.state);

    };

    function onDidRangeBeaconsInRegion(data) {
        console.log('did Range Beacons In Region: ' + JSON.stringify(data) );
        if(data.beacons.length > 0){
            displayBeaconMessage(data);
            JSON.stringify(data)
            displayFlag = 1;
        }else{
            alert('Beacon Flag not connected');
        }
        
    }
    
    
    function displayBeaconMessage(data){
        if(displayFlag == 0){
           alert('Connected to beacon: ' + data.region["identifier"] );
        }
        
    }
    function onError(message) {
        console.log('Error due to : ' + message);
    }
    
    cordova.plugins.locationManager.requestAlwaysAuthorization();
    
    // Create delegate object that holds beacon callback functions.
    var delegate = new cordova.plugins.locationManager.Delegate();
    cordova.plugins.locationManager.setDelegate(delegate);
    
    // Set delegate functions.
    delegate.didDetermineStateForRegion = onDidDetermineStateForRegion
    //didDetermineStateForRegion is called when the user enters or exits a region
    
    delegate.didRangeBeaconsInRegion = onDidRangeBeaconsInRegion;
    // called every second, there is a list of beacons inside data.beacons
    // will get called even if there are 0 beacons in the list
    
    startMonitoringAndRangingRegions(mRegions, onError);
    
    console.log('everything is ok');
   
}

function startMonitoringAndRangingRegions(regions, onError){
    for(var i in regions){
        startMonitoringAndRangingRegion(regions[i], onError);
    }
}

function startMonitoringAndRangingRegion(region, onError){
    //creating a beacon region object
    var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(region.id, region.uuid, region.major, region.minor);
    
    //start monitoring
    cordova.plugins.locationManager.startMonitoringForRegion(beaconRegion).fail(onError).done();
    
    //start ranging
    cordova.plugins.locationManager.startRangingBeaconsInRegion(beaconRegion).fail(onError).done();
}

function displayRegionEvents() {
}
