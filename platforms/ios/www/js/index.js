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
        startNearestBeaconDisplayTimer();
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

var mRegionEvents = [];

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

// Nearest ranged beacon.
var mNearestBeacon = null;

var displayFlag = 0;
var jsonData;

//data related to the regions can be set here
var mRegionData = {
    'ith-basement' : 'ITH-basement data'
    //ith-basement is the id of the first region
}

function startNearestBeaconDisplayTimer(){
    mNearestDisplayTimer = setInterval(displayNearestBeacon, 1000);
}

function displayNearestBeacon(){

}
function startMonitoringAndRanging() {
    console.log('started the function');
    
    
    function onDidDetermineStateForRegion (result) {
        //console.log("did determine state for region "+ JSON.stringify(pluginResult));
        alert('pluginResult.state ' + pluginResult.state);
        saveRegionEvents(result.state, result.region.identifier);
        displayRecentRegionEvents();

    };

    function onDidRangeBeaconsInRegion(data) {
        console.log('did Range Beacons In Region: ' + JSON.stringify(data) );
        // if(data.beacons.length > 0){
        //     displayBeaconMessage(data);
        //     JSON.stringify(data)
        //     displayFlag = 1;
        // }else{
        //     //alert('Beacon Flag not connected');
        // }

        updateNearestBeacon(data.beacons);
        
    }
    
    
    function displayBeaconMessage(data){
        if(displayFlag == 0){
           //alert('Connected to beacon: ' + data.region["identifier"] );
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

function saveRegionEvents(eventType, regionId){
    mRegionEvents.push(
        {
            type: eventType,
            regionId: regionId
        }
    );
    
    //if more than 10 events then truncate
    if(mRegionEvents.length > 10){
        mRegionEvents.shift();
    }
    
}

function displayRecentRegionEvents(){
    //TODO: write code for background
    
    displayRegionEvents();
    
    
    
}

function displayRegionEvents() {
    //displays the events of the mRegionEvents 
    var events = document.getElementById('events');
    for(var i = mRegionEvents.length - 1; i >= 0; i--){
        var event = mRegionEvents[i];
        var title = getTitleFromEvent(event);
        var element = title;
        events.append(element)
    }

    if(mRegionEvents.length <= 0){
        var element = "Waiting for a beacon connection";
        events.append(element)
    }
}

function getTitleFromEvent(event){
    return  mRegionStateNames[event.type] + ' '
    + mRegionData[event.regionId] + ' '
   + mRegionData[event.state];
}

function updateNearestBeacon(beacons){
    for(var i = 0; i < 2; i++){
        var beacon = beacons[i];
        if(!mNearestBeacon){
            mNearestBeacon = beacon;
        }
        else{
//            if(isSameBeacon(beacon, mNearestBeacon) || isNearThan(beacon, mNearestBeacon)){
//                mNearestBeacon = beacon;
//            }
        }

    }
}

function displayNearestBeacon(){
    if (!mNearestBeacon) {return;}
    var beconElement = document.getElementById('beacon');
    
    var element = 'Proximity: ' + mNearestBeacon.proximity + '<br />';
    
    beconElement.append(element);
}

function getBeaconId(beacon){
    return beacon.uuid + ':' + beacon.major + ':' + beacon.minor;
}
function isSameBeacon(beacon1, beacon2){
    //return getBeaconId(beacon1) == getBeaconId(beacon2);
}

function isNearThan(beacon1, beacon2){
    return beacon1.accuracy > 0 && beacon2.accuracy > 0 && beacon1.accuracy < beacon2.accuracy;
}
