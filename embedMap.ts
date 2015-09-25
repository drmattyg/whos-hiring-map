/// <reference path='typings/leaflet/leaflet.d.ts' />

import WHP = require('./WHParser')

var entryData: {} = window["entryData"];
var map: L.Map = new L.Map("wh-map");
var osmUrl: string ='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib: string ='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
var osm: L.TileLayer = new L.TileLayer(osmUrl, {minZoom: 1, maxZoom: 12, attribution: osmAttrib});
map.setView(new L.LatLng(47, -34), 3);
map.addLayer(osm);

Object.keys(entryData).forEach((key: string) => {
	var entries: WHP.WHEntry[] = <WHP.WHEntry[]>entryData[key];
	var latLon: number[] = [entries[0].geolocation.latitude, entries[0].geolocation.longitude];
	var popupHtml: string = entries.map((e) => { return '<font size="1"><b>' + e.header + '</b><p>' + e.html + '</p></font>' }).join("<hr>")
	var marker: L.Marker = L.marker(latLon);
	marker.bindPopup(popupHtml, { maxHeight: 300 });
	marker.addTo(map);
});
